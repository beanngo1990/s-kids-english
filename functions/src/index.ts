import { getApps, initializeApp } from 'firebase-admin/app';
import { logger } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import {
  HttpsError,
  onCall,
  type CallableOptions,
} from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { anonymizedUid, FUNCTIONS_REGION } from './contracts.js';
import {
  FirestoreFounderCampaignStore,
  FounderCampaignService,
} from './founderCampaign.js';
import { GrantOutboxProcessor } from './grantOutbox.js';
import {
  RevenueCatApiError,
  RevenueCatRestClient,
} from './revenueCatClient.js';
import { RevenueCatDeletionCoordinator } from './revenueCatDeletion.js';
import { readFounderRemoteGate } from './remoteConfigGate.js';

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

export const claimFounderPremium = onCall(
  monetizationCallableOptions,
  async request => {
    const firebaseUid = request.auth?.uid;
    if (!firebaseUid) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const result = await createFounderService().claim(firebaseUid);
    logger.info('Founder Premium claim resolved.', {
      actor: anonymizedUid(firebaseUid),
      status: result.status,
    });
    return result;
  },
);

export const getFounderPremiumStatus = onCall(
  monetizationCallableOptions,
  async request => {
    const firebaseUid = request.auth?.uid;
    if (!firebaseUid) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const result = await createFounderService().getStatus(firebaseUid);
    logger.info('Founder Premium status resolved.', {
      actor: anonymizedUid(firebaseUid),
      status: result.status,
    });
    return result;
  },
);

export const processFounderGrant = onDocumentCreated(
  {
    concurrency: 2,
    document: 'monetizationGrantOutbox/{outboxId}',
    maxInstances: 4,
    region: FUNCTIONS_REGION,
    retry: true,
    secrets: [revenueCatSecretApiKey],
    timeoutSeconds: 60,
  },
  async event => {
    const outboxId = event.params.outboxId;
    try {
      await createOutboxProcessor().process(outboxId);
      logger.info('Founder grant outbox processed.', { outboxId });
    } catch (error) {
      logger.error('Founder grant outbox processing crashed.', {
        errorCode: operationalErrorCode(error),
        outboxId,
      });
      throw error;
    }
  },
);

export const reconcileFounderGrants = onSchedule(
  {
    concurrency: 1,
    maxInstances: 1,
    region: FUNCTIONS_REGION,
    schedule: 'every 5 minutes',
    secrets: [revenueCatSecretApiKey],
    timeZone: 'Etc/UTC',
    timeoutSeconds: 300,
  },
  async () => {
    const processedCount = await createOutboxProcessor().reconcileDue();
    logger.info('Founder grant reconciliation completed.', { processedCount });
  },
);

export const deleteRevenueCatCustomerData = onCall(
  monetizationCallableOptions,
  async request => {
    const firebaseUid = request.auth?.uid;
    if (!firebaseUid) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    try {
      const status = await new RevenueCatDeletionCoordinator(
        createRevenueCatClient(),
      ).deleteCustomer(firebaseUid);
      if (status === 'retryableError') {
        logger.info('RevenueCat customer deletion is safely deferred.', {
          actor: anonymizedUid(firebaseUid),
        });
        return { status } as const;
      }
      logger.info('RevenueCat customer deletion completed.', {
        actor: anonymizedUid(firebaseUid),
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

function createFounderService(): FounderCampaignService {
  return new FounderCampaignService(
    new FirestoreFounderCampaignStore(),
    createRevenueCatClient(),
    readFounderRemoteGate,
  );
}

function createOutboxProcessor(): GrantOutboxProcessor {
  return new GrantOutboxProcessor(createRevenueCatClient());
}

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
