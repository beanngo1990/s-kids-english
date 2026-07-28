import { createHash } from 'node:crypto';

export const FUNCTIONS_REGION = 'asia-southeast1';

export function anonymizedUid(firebaseUid: string): string {
  return createHash('sha256').update(firebaseUid).digest('hex').slice(0, 16);
}
