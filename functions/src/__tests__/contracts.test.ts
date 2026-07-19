import assert from 'node:assert/strict';
import test from 'node:test';

import { anonymizedUid, FUNCTIONS_REGION } from '../contracts.js';

test('functions stay in the configured production region', () => {
  assert.equal(FUNCTIONS_REGION, 'asia-southeast1');
});

test('log actor hashes are stable and do not expose raw Firebase UIDs', () => {
  const uid = 'parent/uid@example.com';
  const actor = anonymizedUid(uid);

  assert.match(actor, /^[a-f0-9]{16}$/);
  assert.equal(actor, anonymizedUid(uid));
  assert.equal(actor.includes(uid), false);
});
