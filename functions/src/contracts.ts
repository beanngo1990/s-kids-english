import { createHash } from 'node:crypto';

import { Timestamp, type DocumentData } from 'firebase-admin/firestore';

export const FOUNDER_CAMPAIGN_ENABLED_KEY = 'founder_premium_campaign_enabled';
export const FOUNDER_CAMPAIGN_ID_KEY = 'founder_premium_campaign_id';
export const DEFAULT_FOUNDER_CAMPAIGN_ID = 'founder-premium-2026-v1';
export const PREMIUM_ENTITLEMENT_LOOKUP_KEY = 'premium';
export const FUNCTIONS_REGION = 'asia-southeast1';

export type FounderCampaignStatus =
  | 'available'
  | 'granted'
  | 'processing'
  | 'alreadyClaimed'
  | 'alreadyPremium'
  | 'notAvailable'
  | 'soldOut'
  | 'signInRequired'
  | 'retryableError';

export type FounderCampaignResponse = Readonly<{
  expiresAt?: string;
  status: FounderCampaignStatus;
}>;

export type CampaignLifecycleStatus = 'draft' | 'ready' | 'paused' | 'closed';
export type FounderClaimStatus =
  | 'reserved'
  | 'granting'
  | 'granted'
  | 'manualReview';
export type GrantOutboxStatus =
  | 'pending'
  | 'processing'
  | 'done'
  | 'manualReview';

export type FounderCampaign = Readonly<{
  capacity: number;
  durationDays: number;
  endsAt?: Timestamp;
  entitlementLookupKey: string;
  grantedCount: number;
  revenueCatEntitlementId: string;
  reservedCount: number;
  startsAt?: Timestamp;
  status: CampaignLifecycleStatus;
}>;

export type FounderClaim = Readonly<{
  attemptCount: number;
  expiresAt: Timestamp;
  revenueCatEntitlementId: string;
  revenueCatCustomerId: string;
  status: FounderClaimStatus;
}>;

export type FounderRemoteGate = Readonly<{
  campaignId: string;
  enabled: boolean;
}>;

export function parseFounderCampaign(
  data: DocumentData | undefined,
): FounderCampaign | null {
  if (!data || data.kind !== 'revenuecat_granted_entitlement') {
    return null;
  }

  if (
    !isCampaignLifecycleStatus(data.status) ||
    !isNonNegativeInteger(data.capacity) ||
    !isNonNegativeInteger(data.reservedCount) ||
    !isNonNegativeInteger(data.grantedCount) ||
    !isPositiveInteger(data.durationDays) ||
    data.entitlementLookupKey !== PREMIUM_ENTITLEMENT_LOOKUP_KEY ||
    !isRevenueCatEntitlementId(data.revenueCatEntitlementId) ||
    (data.startsAt !== undefined && !(data.startsAt instanceof Timestamp)) ||
    (data.endsAt !== undefined && !(data.endsAt instanceof Timestamp))
  ) {
    return null;
  }

  return {
    capacity: data.capacity,
    durationDays: data.durationDays,
    endsAt: data.endsAt,
    entitlementLookupKey: data.entitlementLookupKey,
    grantedCount: data.grantedCount,
    revenueCatEntitlementId: data.revenueCatEntitlementId,
    reservedCount: data.reservedCount,
    startsAt: data.startsAt,
    status: data.status,
  };
}

export function parseFounderClaim(
  data: DocumentData | undefined,
): FounderClaim | null {
  if (
    !data ||
    !isFounderClaimStatus(data.status) ||
    !(data.expiresAt instanceof Timestamp) ||
    !isRevenueCatEntitlementId(data.revenueCatEntitlementId) ||
    typeof data.revenueCatCustomerId !== 'string' ||
    data.revenueCatCustomerId.length === 0 ||
    !isNonNegativeInteger(data.attemptCount)
  ) {
    return null;
  }

  return {
    attemptCount: data.attemptCount,
    expiresAt: data.expiresAt,
    revenueCatEntitlementId: data.revenueCatEntitlementId,
    revenueCatCustomerId: data.revenueCatCustomerId,
    status: data.status,
  };
}

export function getCampaignAvailability(
  campaign: FounderCampaign,
  now: Timestamp,
): 'available' | 'notAvailable' | 'soldOut' {
  if (
    campaign.status !== 'ready' ||
    (campaign.startsAt && now.toMillis() < campaign.startsAt.toMillis()) ||
    (campaign.endsAt && now.toMillis() >= campaign.endsAt.toMillis())
  ) {
    return 'notAvailable';
  }

  return campaign.reservedCount >= campaign.capacity ? 'soldOut' : 'available';
}

export function getExistingClaimResponse(
  claim: FounderClaim,
  claimOperation: boolean,
): FounderCampaignResponse {
  if (claim.status === 'granted') {
    return {
      expiresAt: claim.expiresAt.toDate().toISOString(),
      status: claimOperation ? 'alreadyClaimed' : 'granted',
    };
  }

  return {
    expiresAt: claim.expiresAt.toDate().toISOString(),
    status: 'processing',
  };
}

export function founderClaimExpiration(
  reservedAt: Timestamp,
  durationDays: number,
): Timestamp {
  return Timestamp.fromMillis(
    reservedAt.toMillis() + durationDays * 24 * 60 * 60 * 1000,
  );
}

export function isSafeCampaignId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/.test(value);
}

export function grantOutboxId(campaignId: string, firebaseUid: string): string {
  const digest = createHash('sha256')
    .update(`${campaignId}:${firebaseUid}`)
    .digest('hex');
  return `founder_${digest}`;
}

export function anonymizedUid(firebaseUid: string): string {
  return createHash('sha256').update(firebaseUid).digest('hex').slice(0, 16);
}

export function calculateRetryDelayMs(
  attemptCount: number,
  requestedBackoffMs?: number,
): number {
  const exponentialMs = Math.min(
    6 * 60 * 60 * 1000,
    30_000 * 2 ** Math.min(Math.max(attemptCount - 1, 0), 14),
  );
  const serverBackoffMs = Math.min(
    Math.max(requestedBackoffMs ?? 0, 0),
    24 * 60 * 60 * 1000,
  );
  return Math.max(exponentialMs, serverBackoffMs);
}

function isCampaignLifecycleStatus(
  value: unknown,
): value is CampaignLifecycleStatus {
  return (
    value === 'draft' ||
    value === 'ready' ||
    value === 'paused' ||
    value === 'closed'
  );
}

function isFounderClaimStatus(value: unknown): value is FounderClaimStatus {
  return (
    value === 'reserved' ||
    value === 'granting' ||
    value === 'granted' ||
    value === 'manualReview'
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

export function isRevenueCatEntitlementId(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^entl[A-Za-z0-9_-]+$/.test(value) &&
    value.length <= 255
  );
}
