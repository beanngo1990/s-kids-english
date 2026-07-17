import { parseArgs } from 'node:util';

const { values } = parseArgs({
  allowPositionals: false,
  options: {
    apply: { type: 'boolean', default: false },
    capacity: { type: 'string', default: '500' },
    'campaign-id': {
      type: 'string',
      default: 'founder-premium-2026-v1',
    },
    'duration-days': { type: 'string', default: '365' },
    'firebase-project': { type: 'string' },
    'revenuecat-entitlement-id': { type: 'string' },
    'revenuecat-project-id': { type: 'string' },
  },
});

const campaignId = values['campaign-id'];
const capacity = Number(values.capacity);
const durationDays = Number(values['duration-days']);
const revenueCatEntitlementId = values['revenuecat-entitlement-id'];
const revenueCatProjectId =
  values['revenuecat-project-id'] || process.env.REVENUECAT_PROJECT_ID;

if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(campaignId)) {
  throw new Error('Invalid --campaign-id.');
}
if (!Number.isInteger(capacity) || capacity <= 0) {
  throw new Error('--capacity must be a positive integer.');
}
if (!Number.isInteger(durationDays) || durationDays <= 0) {
  throw new Error('--duration-days must be a positive integer.');
}
if (
  !revenueCatEntitlementId ||
  !/^entl[A-Za-z0-9_-]+$/.test(revenueCatEntitlementId)
) {
  throw new Error(
    '--revenuecat-entitlement-id must be the RevenueCat v2 internal ID (entl...), not the premium lookup key.',
  );
}

const preview = {
  campaignId,
  capacity,
  durationDays,
  entitlementLookupKey: 'premium',
  revenueCatEntitlementId,
  status: 'ready',
};
console.log('Founder campaign seed plan:', preview);

if (!values.apply) {
  console.log('Dry run only. Re-run with --apply after verifying the plan.');
  process.exit(0);
}

const revenueCatValidationKey = process.env.REVENUECAT_SECRET_API_KEY;
if (!revenueCatProjectId || !revenueCatValidationKey) {
  throw new Error(
    'Apply requires --revenuecat-project-id (or REVENUECAT_PROJECT_ID) and an ephemeral REVENUECAT_SECRET_API_KEY environment value for entitlement validation.',
  );
}

await validateRevenueCatEntitlement({
  entitlementId: revenueCatEntitlementId,
  projectId: revenueCatProjectId,
  secretApiKey: revenueCatValidationKey,
});

const [{ initializeApp }, { getFirestore, Timestamp }] = await Promise.all([
  import('firebase-admin/app'),
  import('firebase-admin/firestore'),
]);
initializeApp(
  values['firebase-project']
    ? { projectId: values['firebase-project'] }
    : undefined,
);
const firestore = getFirestore();
const campaignRef = firestore
  .collection('monetizationCampaigns')
  .doc(campaignId);

await firestore.runTransaction(async transaction => {
  const existing = await transaction.get(campaignRef);
  if (existing.exists) {
    throw new Error(
      `Campaign ${campaignId} already exists; refusing to overwrite counters or status.`,
    );
  }

  const now = Timestamp.now();
  transaction.create(campaignRef, {
    capacity,
    createdAt: now,
    durationDays,
    entitlementLookupKey: 'premium',
    grantedCount: 0,
    kind: 'revenuecat_granted_entitlement',
    reservedCount: 0,
    revenueCatEntitlementId,
    status: 'ready',
    updatedAt: now,
  });
});

console.log(`Created monetizationCampaigns/${campaignId}.`);

async function validateRevenueCatEntitlement({
  entitlementId,
  projectId,
  secretApiKey,
}) {
  const response = await fetch(
    `https://api.revenuecat.com/v2/projects/${encodeURIComponent(
      projectId,
    )}/entitlements/${encodeURIComponent(entitlementId)}`,
    { headers: { Authorization: `Bearer ${secretApiKey}` } },
  );
  if (!response.ok) {
    throw new Error(
      `RevenueCat entitlement validation failed with HTTP ${response.status}.`,
    );
  }

  const entitlement = await response.json();
  if (
    entitlement?.id !== entitlementId ||
    entitlement?.lookup_key !== 'premium'
  ) {
    throw new Error(
      'The RevenueCat internal entitlement ID does not resolve to lookup key premium.',
    );
  }
}
