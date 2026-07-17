import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RevenueCatApiError,
  RevenueCatRestClient,
} from '../revenueCatClient.js';

test('grant uses the RevenueCat v2 action and internal entitlement ID', async t => {
  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;
  t.mock.method(
    globalThis,
    'fetch',
    async (input: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(input);
      capturedInit = init;
      return Response.json({ object: 'customer' }, { status: 201 });
    },
  );

  const client = new RevenueCatRestClient('proj_123', 'secret-value');
  await client.grantEntitlement('firebase/uid', 'entlPremium123', 123456789);

  assert.equal(
    capturedUrl,
    'https://api.revenuecat.com/v2/projects/proj_123/customers/firebase%2Fuid/actions/grant_entitlement',
  );
  assert.equal(capturedInit?.method, 'POST');
  assert.deepEqual(JSON.parse(String(capturedInit?.body)), {
    entitlement_id: 'entlPremium123',
    expires_at: 123456789,
  });
  assert.equal(
    new Headers(capturedInit?.headers).get('authorization'),
    'Bearer secret-value',
  );
});

test('active entitlement lookup follows safe RevenueCat pagination', async t => {
  const calls: string[] = [];
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    if (calls.length === 1) {
      return Response.json({
        items: [{ entitlement_id: 'entlOther', expires_at: 100 }],
        next_page:
          '/v2/projects/proj_123/customers/parent-1/active_entitlements?starting_after=entlOther',
        object: 'list',
      });
    }
    return Response.json({
      items: [{ entitlement_id: 'entlPremium123', expires_at: null }],
      next_page: null,
      object: 'list',
    });
  });

  const client = new RevenueCatRestClient('proj_123', 'secret-value');
  const result = await client.getActiveEntitlements('parent-1');
  assert.equal(calls.length, 2);
  assert.deepEqual(result, {
    activeEntitlements: [
      { entitlementId: 'entlOther', expiresAt: 100 },
      { entitlementId: 'entlPremium123', expiresAt: null },
    ],
    exists: true,
  });
});

test('429 responses expose retryability without leaking the response body', async t => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json(
      {
        backoff_ms: 90000,
        message: 'do not log this customer-specific message',
        retryable: true,
        type: 'rate_limit_error',
      },
      { status: 429 },
    ),
  );

  const client = new RevenueCatRestClient('proj_123', 'secret-value');
  await assert.rejects(
    () => client.grantEntitlement('parent-1', 'entlPremium123', 123),
    (error: unknown) => {
      assert.ok(error instanceof RevenueCatApiError);
      assert.equal(error.statusCode, 429);
      assert.equal(error.retryable, true);
      assert.equal(error.backoffMs, 90000);
      assert.equal(error.message.includes('customer-specific'), false);
      return true;
    },
  );
});

test('423 and 5xx responses are normalized as retryable failures', async t => {
  const statuses = [423, 500, 503];
  let callIndex = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    const status = statuses[callIndex];
    callIndex += 1;
    return Response.json(
      { retryable: false, type: 'temporary_service_error' },
      { status },
    );
  });

  const client = new RevenueCatRestClient('proj_123', 'secret-value');
  for (const status of statuses) {
    await assert.rejects(
      () =>
        client.grantEntitlement(
          `parent-${status}`,
          'entlPremium123',
          123,
        ),
      (error: unknown) => {
        assert.ok(error instanceof RevenueCatApiError);
        assert.equal(error.statusCode, status);
        assert.equal(error.retryable, true);
        assert.equal(
          error.code,
          `http_${status}_temporary_service_error`,
        );
        return true;
      },
    );
  }
});

test('network and aborted requests are normalized as retryable timeout failures', async t => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new DOMException('The operation was aborted.', 'AbortError');
  });

  const client = new RevenueCatRestClient('proj_123', 'secret-value');
  await assert.rejects(
    () => client.grantEntitlement('parent-1', 'entlPremium123', 123),
    (error: unknown) => {
      assert.ok(error instanceof RevenueCatApiError);
      assert.equal(error.code, 'network_or_timeout');
      assert.equal(error.retryable, true);
      assert.equal(error.statusCode, undefined);
      return true;
    },
  );
});

test('customer deletion accepts queued deletion and treats 404 as idempotent', async t => {
  let status = 202;
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(null, { status }),
  );
  const client = new RevenueCatRestClient('proj_123', 'secret-value');

  assert.equal(await client.deleteCustomer('parent-1'), 'deleted');
  status = 404;
  assert.equal(await client.deleteCustomer('parent-1'), 'alreadyDeleted');
});

test('customer deletion surfaces transient RevenueCat failures for safe retry', async t => {
  let failWithNetworkError = false;
  t.mock.method(globalThis, 'fetch', async () => {
    if (failWithNetworkError) {
      throw new TypeError('network unavailable');
    }
    return Response.json(
      { retryable: true, type: 'service_unavailable' },
      { status: 503 },
    );
  });
  const client = new RevenueCatRestClient('proj_123', 'secret-value');

  await assert.rejects(
    () => client.deleteCustomer('parent-1'),
    (error: unknown) => {
      assert.ok(error instanceof RevenueCatApiError);
      assert.equal(error.code, 'http_503_service_unavailable');
      assert.equal(error.retryable, true);
      return true;
    },
  );

  failWithNetworkError = true;
  await assert.rejects(
    () => client.deleteCustomer('parent-1'),
    (error: unknown) => {
      assert.ok(error instanceof RevenueCatApiError);
      assert.equal(error.code, 'network_or_timeout');
      assert.equal(error.retryable, true);
      return true;
    },
  );
});
