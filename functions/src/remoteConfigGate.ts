import { getRemoteConfig } from 'firebase-admin/remote-config';

import {
  DEFAULT_FOUNDER_CAMPAIGN_ID,
  FOUNDER_CAMPAIGN_ENABLED_KEY,
  FOUNDER_CAMPAIGN_ID_KEY,
  type FounderRemoteGate,
} from './contracts.js';

const CACHE_DURATION_MS = 15_000;

let cachedGate:
  | Readonly<{ expiresAtMillis: number; value: FounderRemoteGate }>
  | undefined;

export async function readFounderRemoteGate(): Promise<FounderRemoteGate> {
  const nowMillis = Date.now();
  if (cachedGate && cachedGate.expiresAtMillis > nowMillis) {
    return cachedGate.value;
  }

  const template = await getRemoteConfig().getTemplate();
  const enabled = readDefaultValue(
    template.parameters[FOUNDER_CAMPAIGN_ENABLED_KEY]?.defaultValue,
  );
  const configuredCampaignId = readDefaultValue(
    template.parameters[FOUNDER_CAMPAIGN_ID_KEY]?.defaultValue,
  );
  const value = {
    campaignId:
      typeof configuredCampaignId === 'string' &&
      configuredCampaignId.trim().length > 0
        ? configuredCampaignId.trim()
        : DEFAULT_FOUNDER_CAMPAIGN_ID,
    enabled: enabled === 'true',
  } satisfies FounderRemoteGate;

  cachedGate = {
    expiresAtMillis: nowMillis + CACHE_DURATION_MS,
    value,
  };
  return value;
}

function readDefaultValue(value: unknown): string | undefined {
  return typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    typeof value.value === 'string'
    ? value.value
    : undefined;
}
