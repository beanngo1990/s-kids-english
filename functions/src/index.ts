import { getApps, initializeApp } from 'firebase-admin/app';
import { logger } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';
import {
  HttpsError,
  onCall,
  type CallableOptions,
} from 'firebase-functions/v2/https';

import { anonymizedUid, FUNCTIONS_REGION } from './contracts.js';
import {
  RevenueCatApiError,
  RevenueCatRestClient,
} from './revenueCatClient.js';

if (getApps().length === 0) {
  initializeApp();
}

const revenueCatSecretApiKey = defineSecret('REVENUECAT_SECRET_API_KEY');
const revenueCatProjectId = defineString('REVENUECAT_PROJECT_ID', {
  description: 'RevenueCat v2 Project ID (proj...).',
});

export const monetizationCallableOptions: CallableOptions = {
  enforceAppCheck: true,
  maxInstances: 30,
  region: FUNCTIONS_REGION,
  secrets: [revenueCatSecretApiKey],
  timeoutSeconds: 30,
};

export const deleteRevenueCatCustomerData = onCall(
  monetizationCallableOptions,
  async request => {
    const firebaseUid = request.auth?.uid;
    if (!firebaseUid) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    try {
      const status = await createRevenueCatClient().deleteCustomer(firebaseUid);
      logger.info('RevenueCat customer deletion completed.', {
        actor: anonymizedUid(firebaseUid),
        status,
      });
      return { status } as const;
    } catch (error) {
      logger.error('RevenueCat customer deletion failed.', {
        actor: anonymizedUid(firebaseUid),
        errorCode: operationalErrorCode(error),
      });
      return { status: 'retryableError' } as const;
    }
  },
);

function createRevenueCatClient(): RevenueCatRestClient {
  return new RevenueCatRestClient(
    revenueCatProjectId.value(),
    revenueCatSecretApiKey.value(),
  );
}

function operationalErrorCode(error: unknown): string {
  if (error instanceof RevenueCatApiError) {
    return error.code;
  }
  return error instanceof Error ? error.name : 'unknown';
}
