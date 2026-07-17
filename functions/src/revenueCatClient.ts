const REVENUECAT_API_ORIGIN = 'https://api.revenuecat.com';
const REVENUECAT_API_BASE = `${REVENUECAT_API_ORIGIN}/v2`;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ENTITLEMENT_PAGES = 20;

export type RevenueCatActiveEntitlement = Readonly<{
  entitlementId: string;
  expiresAt: number | null;
}>;

export type RevenueCatCustomerEntitlements = Readonly<{
  activeEntitlements: readonly RevenueCatActiveEntitlement[];
  exists: boolean;
}>;

export interface RevenueCatClient {
  deleteCustomer(customerId: string): Promise<'deleted' | 'alreadyDeleted'>;
  getActiveEntitlements(
    customerId: string,
  ): Promise<RevenueCatCustomerEntitlements>;
  grantEntitlement(
    customerId: string,
    entitlementId: string,
    expiresAtMillis: number,
  ): Promise<void>;
}

export class RevenueCatApiError extends Error {
  readonly backoffMs?: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly statusCode?: number;

  constructor(options: {
    backoffMs?: number;
    code: string;
    retryable: boolean;
    statusCode?: number;
  }) {
    super(`RevenueCat API request failed (${options.code}).`);
    this.name = 'RevenueCatApiError';
    this.backoffMs = options.backoffMs;
    this.code = options.code;
    this.retryable = options.retryable;
    this.statusCode = options.statusCode;
  }
}

export class RevenueCatRestClient implements RevenueCatClient {
  constructor(
    private readonly projectId: string,
    private readonly secretApiKey: string,
  ) {
    if (!projectId.trim() || !secretApiKey.trim()) {
      throw new Error('RevenueCat server configuration is missing.');
    }
  }

  async getActiveEntitlements(
    customerId: string,
  ): Promise<RevenueCatCustomerEntitlements> {
    const customerPath = this.customerPath(customerId);
    let nextPath:
      | string
      | null = `${customerPath}/active_entitlements?limit=100`;
    const activeEntitlements: RevenueCatActiveEntitlement[] = [];

    for (let page = 0; nextPath && page < MAX_ENTITLEMENT_PAGES; page += 1) {
      const response = await this.request(nextPath, { method: 'GET' }, [404]);
      if (response.status === 404) {
        return { activeEntitlements: [], exists: false };
      }

      const payload = await readJson(response);
      if (!isListPayload(payload)) {
        throw new RevenueCatApiError({
          code: 'invalid_active_entitlements_response',
          retryable: true,
        });
      }

      for (const item of payload.items) {
        const entitlement = parseActiveEntitlement(item);
        if (entitlement) {
          activeEntitlements.push(entitlement);
        }
      }

      nextPath = validateNextPage(payload.next_page, customerPath);
    }

    if (nextPath) {
      throw new RevenueCatApiError({
        code: 'active_entitlements_pagination_limit',
        retryable: false,
      });
    }

    return { activeEntitlements, exists: true };
  }

  async grantEntitlement(
    customerId: string,
    entitlementId: string,
    expiresAtMillis: number,
  ): Promise<void> {
    await this.request(
      `${this.customerPath(customerId)}/actions/grant_entitlement`,
      {
        body: JSON.stringify({
          entitlement_id: entitlementId,
          expires_at: expiresAtMillis,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    );
  }

  async deleteCustomer(
    customerId: string,
  ): Promise<'deleted' | 'alreadyDeleted'> {
    const response = await this.request(
      this.customerPath(customerId),
      { method: 'DELETE' },
      [404],
    );
    return response.status === 404 ? 'alreadyDeleted' : 'deleted';
  }

  private customerPath(customerId: string): string {
    return `/projects/${encodeURIComponent(
      this.projectId,
    )}/customers/${encodeURIComponent(customerId)}`;
  }

  private async request(
    path: string,
    init: RequestInit,
    acceptedErrorStatuses: readonly number[] = [],
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${REVENUECAT_API_BASE}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.secretApiKey}`,
          ...init.headers,
        },
        signal: controller.signal,
      });

      if (response.ok || acceptedErrorStatuses.includes(response.status)) {
        return response;
      }

      throw await toRevenueCatApiError(response);
    } catch (error) {
      if (error instanceof RevenueCatApiError) {
        throw error;
      }

      throw new RevenueCatApiError({
        code: 'network_or_timeout',
        retryable: true,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function findActiveEntitlement(
  state: RevenueCatCustomerEntitlements,
  entitlementId: string,
): RevenueCatActiveEntitlement | undefined {
  return state.activeEntitlements.find(
    entitlement => entitlement.entitlementId === entitlementId,
  );
}

async function toRevenueCatApiError(
  response: Response,
): Promise<RevenueCatApiError> {
  const body = await readJson(response);
  const errorType =
    isRecord(body) && typeof body.type === 'string'
      ? normalizeErrorPart(body.type)
      : 'http_error';
  const bodyRetryable = isRecord(body) && body.retryable === true;
  const retryable =
    bodyRetryable ||
    response.status === 423 ||
    response.status === 429 ||
    response.status >= 500;
  const bodyBackoff =
    isRecord(body) && typeof body.backoff_ms === 'number'
      ? body.backoff_ms
      : undefined;
  const headerBackoff = parseRetryAfter(response.headers.get('retry-after'));

  return new RevenueCatApiError({
    backoffMs: maxDefined(bodyBackoff, headerBackoff),
    code: `http_${response.status}_${errorType}`,
    retryable,
    statusCode: response.status,
  });
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function isListPayload(value: unknown): value is Readonly<{
  items: readonly unknown[];
  next_page?: string | null;
}> {
  return isRecord(value) && Array.isArray(value.items);
}

function parseActiveEntitlement(
  value: unknown,
): RevenueCatActiveEntitlement | null {
  if (
    !isRecord(value) ||
    typeof value.entitlement_id !== 'string' ||
    (value.expires_at !== null && typeof value.expires_at !== 'number')
  ) {
    return null;
  }

  return {
    entitlementId: value.entitlement_id,
    expiresAt: value.expires_at,
  };
}

function validateNextPage(
  value: string | null | undefined,
  customerPath: string,
): string | null {
  if (!value) {
    return null;
  }

  const url = new URL(value, REVENUECAT_API_ORIGIN);
  const requiredPrefix = `/v2${customerPath}/active_entitlements`;
  if (url.origin !== REVENUECAT_API_ORIGIN || url.pathname !== requiredPrefix) {
    throw new RevenueCatApiError({
      code: 'invalid_pagination_url',
      retryable: false,
    });
  }

  return `${url.pathname.replace(/^\/v2/, '')}${url.search}`;
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const dateMillis = Date.parse(value);
  return Number.isFinite(dateMillis)
    ? Math.max(0, dateMillis - Date.now())
    : undefined;
}

function maxDefined(
  first: number | undefined,
  second: number | undefined,
): number | undefined {
  if (first === undefined) {
    return second;
  }
  if (second === undefined) {
    return first;
  }
  return Math.max(first, second);
}

function normalizeErrorPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 80);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
