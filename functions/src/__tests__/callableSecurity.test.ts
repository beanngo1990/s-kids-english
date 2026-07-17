import assert from 'node:assert/strict';
import test from 'node:test';

import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

import {
  claimFounderPremium,
  deleteRevenueCatCustomerData,
  getFounderPremiumStatus,
  monetizationCallableOptions,
} from '../index.js';

const unauthenticatedRequest = {
  auth: undefined,
  data: {},
  rawRequest: {},
} as unknown as CallableRequest<unknown>;

test('all monetization callables reject requests without Firebase Auth', async () => {
  const callables = [
    claimFounderPremium,
    getFounderPremiumStatus,
    deleteRevenueCatCustomerData,
  ];

  for (const callable of callables) {
    await assert.rejects(
      Promise.resolve(callable.run(unauthenticatedRequest)),
      error => error instanceof HttpsError && error.code === 'unauthenticated',
    );
  }
});

test('all monetization callables share App Check enforcement', () => {
  assert.equal(monetizationCallableOptions.enforceAppCheck, true);
  for (const callable of [
    claimFounderPremium,
    getFounderPremiumStatus,
    deleteRevenueCatCustomerData,
  ]) {
    assert.equal(callable.__endpoint.callableTrigger !== undefined, true);
  }
});
