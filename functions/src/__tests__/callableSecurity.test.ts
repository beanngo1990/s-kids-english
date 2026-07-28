import assert from 'node:assert/strict';
import test from 'node:test';

import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

import {
  deleteRevenueCatCustomerData,
  monetizationCallableOptions,
} from '../index.js';

const unauthenticatedRequest = {
  auth: undefined,
  data: {},
  rawRequest: {},
} as unknown as CallableRequest<unknown>;

test('account deletion rejects requests without Firebase Auth', async () => {
  await assert.rejects(
    Promise.resolve(deleteRevenueCatCustomerData.run(unauthenticatedRequest)),
    error => error instanceof HttpsError && error.code === 'unauthenticated',
  );
});

test('account deletion enforces App Check', () => {
  assert.equal(monetizationCallableOptions.enforceAppCheck, true);
  assert.equal(
    deleteRevenueCatCustomerData.__endpoint.callableTrigger !== undefined,
    true,
  );
});
