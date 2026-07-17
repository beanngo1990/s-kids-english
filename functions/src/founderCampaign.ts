import {
  getFirestore,
  Timestamp,
  type Firestore,
} from 'firebase-admin/firestore';

import {
  founderClaimExpiration,
  getCampaignAvailability,
  getExistingClaimResponse,
  grantOutboxId,
  isSafeCampaignId,
  parseFounderCampaign,
  parseFounderClaim,
  type FounderCampaign,
  type FounderCampaignResponse,
  type FounderClaim,
  type FounderRemoteGate,
} from './contracts.js';
import {
  findActiveEntitlement,
  type RevenueCatClient,
} from './revenueCatClient.js';
import { customerDeletionTombstoneRef } from './revenueCatDeletion.js';

export type FounderCampaignReadState = Readonly<{
  campaign: FounderCampaign | null;
  campaignExists: boolean;
  claim: FounderClaim | null;
  claimExists: boolean;
}>;

export interface FounderCampaignStore {
  readState(
    campaignId: string,
    firebaseUid: string,
  ): Promise<FounderCampaignReadState>;
  reserve(
    campaignId: string,
    firebaseUid: string,
    reservedAt: Timestamp,
  ): Promise<FounderCampaignResponse>;
}

export class FirestoreFounderCampaignStore implements FounderCampaignStore {
  constructor(private readonly firestore: Firestore = getFirestore()) {}

  async readState(
    campaignId: string,
    firebaseUid: string,
  ): Promise<FounderCampaignReadState> {
    const campaignRef = this.firestore
      .collection('monetizationCampaigns')
      .doc(campaignId);
    const claimRef = campaignRef.collection('claims').doc(firebaseUid);
    const [campaignSnapshot, claimSnapshot] = await Promise.all([
      campaignRef.get(),
      claimRef.get(),
    ]);

    return {
      campaign: parseFounderCampaign(campaignSnapshot.data()),
      campaignExists: campaignSnapshot.exists,
      claim: parseFounderClaim(claimSnapshot.data()),
      claimExists: claimSnapshot.exists,
    };
  }

  reserve(
    campaignId: string,
    firebaseUid: string,
    reservedAt: Timestamp,
  ): Promise<FounderCampaignResponse> {
    const campaignRef = this.firestore
      .collection('monetizationCampaigns')
      .doc(campaignId);
    const claimRef = campaignRef.collection('claims').doc(firebaseUid);
    const outboxRef = this.firestore
      .collection('monetizationGrantOutbox')
      .doc(grantOutboxId(campaignId, firebaseUid));
    const deletionTombstoneRef = customerDeletionTombstoneRef(
      this.firestore,
      firebaseUid,
    );

    return this.firestore.runTransaction(async transaction => {
      const campaignSnapshot = await transaction.get(campaignRef);
      const claimSnapshot = await transaction.get(claimRef);
      const deletionTombstoneSnapshot = await transaction.get(
        deletionTombstoneRef,
      );
      const campaign = parseFounderCampaign(campaignSnapshot.data());
      const existingClaim = parseFounderClaim(claimSnapshot.data());

      if (deletionTombstoneSnapshot.exists) {
        return { status: 'notAvailable' };
      }

      if (claimSnapshot.exists) {
        return existingClaim
          ? getExistingClaimResponse(existingClaim, true)
          : { status: 'retryableError' };
      }

      if (!campaign) {
        return { status: 'notAvailable' };
      }

      const availability = getCampaignAvailability(campaign, reservedAt);
      if (availability !== 'available') {
        return { status: availability };
      }

      const expiresAt = founderClaimExpiration(
        reservedAt,
        campaign.durationDays,
      );
      transaction.create(claimRef, {
        attemptCount: 0,
        expiresAt,
        reservedAt,
        revenueCatEntitlementId: campaign.revenueCatEntitlementId,
        revenueCatCustomerId: firebaseUid,
        status: 'reserved',
        updatedAt: reservedAt,
      });
      transaction.update(campaignRef, {
        reservedCount: campaign.reservedCount + 1,
        updatedAt: reservedAt,
      });
      transaction.create(outboxRef, {
        attemptCount: 0,
        campaignId,
        createdAt: reservedAt,
        firebaseUid,
        processAfter: reservedAt,
        status: 'pending',
        updatedAt: reservedAt,
      });

      return {
        expiresAt: expiresAt.toDate().toISOString(),
        status: 'processing',
      };
    });
  }
}

export class FounderCampaignService {
  constructor(
    private readonly store: FounderCampaignStore,
    private readonly revenueCat: RevenueCatClient,
    private readonly readRemoteGate: () => Promise<FounderRemoteGate>,
    private readonly now: () => Timestamp = Timestamp.now,
  ) {}

  claim(firebaseUid: string): Promise<FounderCampaignResponse> {
    return this.resolve(firebaseUid, true);
  }

  getStatus(firebaseUid: string): Promise<FounderCampaignResponse> {
    return this.resolve(firebaseUid, false);
  }

  private async resolve(
    firebaseUid: string,
    claimOperation: boolean,
  ): Promise<FounderCampaignResponse> {
    let gate: FounderRemoteGate;
    try {
      gate = await this.readRemoteGate();
    } catch {
      return { status: 'retryableError' };
    }

    if (!isSafeCampaignId(gate.campaignId)) {
      return { status: 'notAvailable' };
    }

    let state: FounderCampaignReadState;
    try {
      state = await this.store.readState(gate.campaignId, firebaseUid);
    } catch {
      return { status: 'retryableError' };
    }

    if (state.claimExists) {
      return state.claim
        ? getExistingClaimResponse(state.claim, claimOperation)
        : { status: 'retryableError' };
    }

    if (!gate.enabled || !state.campaignExists || !state.campaign) {
      return { status: 'notAvailable' };
    }

    const now = this.now();
    const availability = getCampaignAvailability(state.campaign, now);
    if (availability !== 'available') {
      return { status: availability };
    }

    try {
      const customer = await this.revenueCat.getActiveEntitlements(firebaseUid);
      if (!customer.exists) {
        return { status: 'retryableError' };
      }

      if (
        findActiveEntitlement(customer, state.campaign.revenueCatEntitlementId)
      ) {
        return { status: 'alreadyPremium' };
      }
    } catch {
      return { status: 'retryableError' };
    }

    if (!claimOperation) {
      return { status: 'available' };
    }

    try {
      // Capture one concrete server timestamp immediately before the
      // transaction. Firestore may retry the callback, but the reservation
      // time/expiry must remain deterministic across those retries.
      return await this.store.reserve(gate.campaignId, firebaseUid, this.now());
    } catch {
      return { status: 'retryableError' };
    }
  }
}
