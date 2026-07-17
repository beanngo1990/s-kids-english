import { readFile } from 'node:fs/promises';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'demo-skidsenglish';
const OWNER_UID = 'parent-owner';
const OTHER_UID = 'parent-other';
const CAMPAIGN_ID = 'founder-premium-2026-v1';
const OUTBOX_ID = 'founder_test_hash';
const TOMBSTONE_ID = 'customer_test_hash';
const CONSENTED_AT = new Date('2026-07-15T08:00:00.000Z');

const rules = await readFile(new URL('../firestore.rules', import.meta.url), {
  encoding: 'utf8',
});
const testEnvironment = await initializeTestEnvironment({
  firestore: { rules },
  projectId: PROJECT_ID,
});

try {
  await testEnvironment.clearFirestore();

  const ownerDb = testEnvironment.authenticatedContext(OWNER_UID).firestore();
  const otherDb = testEnvironment.authenticatedContext(OTHER_UID).firestore();
  const anonymousDb = testEnvironment.unauthenticatedContext().firestore();
  const ownerProgress = doc(ownerDb, 'users', OWNER_UID, 'progress', 'current');

  await assertSucceeds(setDoc(ownerProgress, validCloudDocument()));
  await assertSucceeds(getDoc(ownerProgress));
  await assertSucceeds(
    setDoc(ownerProgress, validCloudDocument({ totalXP: 12 })),
  );

  await assertFails(
    getDoc(doc(otherDb, 'users', OWNER_UID, 'progress', 'current')),
  );
  await assertFails(
    getDoc(doc(anonymousDb, 'users', OWNER_UID, 'progress', 'current')),
  );
  await assertFails(
    setDoc(
      doc(otherDb, 'users', OWNER_UID, 'progress', 'current'),
      validCloudDocument(),
    ),
  );
  await assertFails(
    setDoc(
      doc(anonymousDb, 'users', OWNER_UID, 'progress', 'current'),
      validCloudDocument(),
    ),
  );
  await assertFails(
    getDocs(collection(ownerDb, 'users', OWNER_UID, 'progress')),
  );
  await assertFails(
    setDoc(doc(ownerDb, 'users', OWNER_UID, 'progress', 'other'), {
      ...validCloudDocument(),
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      childName: 'must-not-be-accepted',
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      ownerUid: 'parent-other',
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      consentVersion: 2,
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      schemaVersion: 2,
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      serverUpdatedAt: new Date('2026-07-15T08:00:00.000Z'),
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      progress: {
        ...validProgress(),
        unexpectedField: true,
      },
    }),
  );
  await assertSucceeds(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      consentedAt: new Date('2026-07-15T09:00:00.000Z'),
    }),
  );
  await assertFails(
    setDoc(ownerProgress, {
      ...validCloudDocument(),
      consentedAt: 'not-a-timestamp',
    }),
  );
  await assertFails(getDoc(doc(ownerDb, 'unrelated', 'document')));

  await testEnvironment.withSecurityRulesDisabled(async context => {
    const adminDb = context.firestore();

    await setDoc(doc(adminDb, 'monetizationCampaigns', CAMPAIGN_ID), {
      capacity: 500,
      durationDays: 365,
      entitlementLookupKey: 'premium',
      grantedCount: 0,
      kind: 'revenuecat_granted_entitlement',
      reservedCount: 1,
      revenueCatEntitlementId: 'entlTestPremium',
      status: 'ready',
    });
    await setDoc(
      doc(adminDb, 'monetizationCampaigns', CAMPAIGN_ID, 'claims', OWNER_UID),
      {
        firebaseUid: OWNER_UID,
        revenueCatEntitlementId: 'entlTestPremium',
        revenueCatCustomerId: OWNER_UID,
        status: 'reserved',
      },
    );
    await setDoc(doc(adminDb, 'monetizationGrantOutbox', OUTBOX_ID), {
      campaignId: CAMPAIGN_ID,
      firebaseUid: OWNER_UID,
      status: 'pending',
    });
    await setDoc(
      doc(adminDb, 'monetizationCustomerDeletionTombstones', TOMBSTONE_ID),
      { status: 'completed' },
    );
  });

  const campaign = doc(ownerDb, 'monetizationCampaigns', CAMPAIGN_ID);
  const ownerClaim = doc(
    ownerDb,
    'monetizationCampaigns',
    CAMPAIGN_ID,
    'claims',
    OWNER_UID,
  );
  const otherClaim = doc(
    ownerDb,
    'monetizationCampaigns',
    CAMPAIGN_ID,
    'claims',
    OTHER_UID,
  );
  const outbox = doc(ownerDb, 'monetizationGrantOutbox', OUTBOX_ID);
  const tombstone = doc(
    ownerDb,
    'monetizationCustomerDeletionTombstones',
    TOMBSTONE_ID,
  );

  // Campaign quota and status are server-only, even for signed-in parents.
  await assertFails(getDoc(campaign));
  await assertFails(getDoc(doc(otherDb, 'monetizationCampaigns', CAMPAIGN_ID)));
  await assertFails(
    getDoc(doc(anonymousDb, 'monetizationCampaigns', CAMPAIGN_ID)),
  );
  await assertFails(getDocs(collection(ownerDb, 'monetizationCampaigns')));
  await assertFails(updateDoc(campaign, { capacity: 501 }));
  await assertFails(updateDoc(campaign, { status: 'closed' }));
  await assertFails(
    setDoc(doc(ownerDb, 'monetizationCampaigns', 'client-created'), {
      capacity: 1,
      status: 'ready',
    }),
  );
  await assertFails(deleteDoc(campaign));

  // Claim documents are callable-only. A parent cannot inspect or mutate
  // either their own claim or another parent's UID.
  await assertFails(getDoc(ownerClaim));
  await assertFails(
    getDoc(
      doc(otherDb, 'monetizationCampaigns', CAMPAIGN_ID, 'claims', OWNER_UID),
    ),
  );
  await assertFails(getDoc(otherClaim));
  await assertFails(
    getDocs(
      collection(ownerDb, 'monetizationCampaigns', CAMPAIGN_ID, 'claims'),
    ),
  );
  await assertFails(
    setDoc(otherClaim, {
      firebaseUid: OTHER_UID,
      revenueCatCustomerId: OTHER_UID,
      status: 'granted',
    }),
  );
  await assertFails(updateDoc(ownerClaim, { status: 'granted' }));
  await assertFails(deleteDoc(ownerClaim));

  // Outbox documents contain grant-processing state and are never exposed to
  // an authenticated or anonymous mobile client.
  await assertFails(getDoc(outbox));
  await assertFails(getDoc(doc(otherDb, 'monetizationGrantOutbox', OUTBOX_ID)));
  await assertFails(
    getDoc(doc(anonymousDb, 'monetizationGrantOutbox', OUTBOX_ID)),
  );
  await assertFails(getDocs(collection(ownerDb, 'monetizationGrantOutbox')));
  await assertFails(updateDoc(outbox, { status: 'done' }));
  await assertFails(
    setDoc(doc(ownerDb, 'monetizationGrantOutbox', 'client-created'), {
      campaignId: CAMPAIGN_ID,
      firebaseUid: OWNER_UID,
      status: 'pending',
    }),
  );
  await assertFails(deleteDoc(outbox));

  // Hashed account-deletion tombstones permanently block reclaim/regrant and
  // are server-only even though they do not contain the raw Firebase UID.
  await assertFails(getDoc(tombstone));
  await assertFails(
    getDoc(
      doc(otherDb, 'monetizationCustomerDeletionTombstones', TOMBSTONE_ID),
    ),
  );
  await assertFails(
    getDocs(collection(ownerDb, 'monetizationCustomerDeletionTombstones')),
  );
  await assertFails(updateDoc(tombstone, { status: 'requested' }));
  await assertFails(
    setDoc(
      doc(
        ownerDb,
        'monetizationCustomerDeletionTombstones',
        'customer-created',
      ),
      { status: 'completed' },
    ),
  );
  await assertFails(deleteDoc(tombstone));

  await assertSucceeds(deleteDoc(ownerProgress));
  console.log('Firestore rules tests passed.');
} finally {
  await testEnvironment.cleanup();
}

function validCloudDocument(progressOverrides = {}) {
  return {
    consentedAt: CONSENTED_AT,
    consentVersion: 1,
    ownerUid: OWNER_UID,
    progress: validProgress(progressOverrides),
    schemaVersion: 1,
    serverUpdatedAt: serverTimestamp(),
  };
}

function validProgress(overrides = {}) {
  return {
    activeThemeId: 'mot-ngay-cua-be',
    completedLessonIds: [],
    completedReviewGameIds: [],
    completedSceneIds: [],
    earnedAchievementRecords: [],
    earnedStickerIds: [],
    earnedStickerRecords: [],
    learnedWordIds: [],
    totalXP: 0,
    vocabularyProgress: {},
    ...overrides,
  };
}
