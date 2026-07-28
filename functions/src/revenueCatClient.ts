const REVENUECAT_API_ORIGIN = 'https://api.revenuecat.com';
const REVENUECAT_API_BASE = `${REVENUECAT_API_ORIGIN}/v2`;
const REQUEST_TIMEOUT_MS = 10_000;

export interface RevenueCatClient {
  deleteCustomer(customerId: string): Promise<'deleted' | 'alreadyDeleted'>;
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
