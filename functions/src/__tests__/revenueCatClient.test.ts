import assert from 'node:assert/strict';
import test from 'node:test';

import {
  RevenueCatApiError,
  RevenueCatRestClient,
} from '../revenueCatClient.js';

test('customer deletion targets the authenticated RevenueCat customer', async t => {
  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;
  t.mock.method(
    globalThis,
    'fetch',
    async (input: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(input);
      capturedInit = init;
      return new Response(null, { status: 202 });
    },
  );

  const client = new RevenueCatRestClient('proj_123', 'secret-value');
  assert.equal(await client.deleteCustomer('firebase/uid'), 'deleted');
  assert.equal(
    capturedUrl,
    'https://api.revenuecat.com/v2/projects/proj_123/customers/firebase%2Fuid',
  );
  assert.equal(capturedInit?.method, 'DELETE');
  assert.equal(
    new Headers(capturedInit?.headers).get('authorization'),
    'Bearer secret-value',
  );
});

test('customer deletion treats a missing customer as already deleted', async t => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(null, { status: 404 }),
  );

  const client = new RevenueCatRestClient('proj_123', 'secret-value');
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
