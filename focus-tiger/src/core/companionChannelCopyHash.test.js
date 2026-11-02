/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { hashCompanionChannelText } from './companionChannelCopyHash.js';

test('hashCompanionChannelText is SHA-256 of NFC UTF-8 bytes', async () => {
  const text = 'About {minutes} {minuteUnit} this sitting.';
  const expected = createHash('sha256').update(text.normalize('NFC'), 'utf8').digest('hex');
  assert.equal(await hashCompanionChannelText(text), expected);
});
