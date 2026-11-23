/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const mountSrc = readFileSync(
  new URL('./coPracticeContractMount.js', import.meta.url),
  'utf8'
);
const eveningSrc = readFileSync(
  new URL('./eveningPracticeFactsControls.js', import.meta.url),
  'utf8'
);

test('How Yin may speak hosts T58 toggle and T62 evening consent', () => {
  assert.match(mountSrc, /yin-adaptation-toggle/);
  assert.match(mountSrc, /setYinAdaptationEnabled/);
  assert.match(mountSrc, /mountEveningPracticeFactsControls/);
  assert.match(eveningSrc, /practice-paper-evening-consent/);
  assert.match(eveningSrc, /practice-paper-evening-confirm/);
  assert.match(eveningSrc, /confirmBtn\.scrollIntoView/);
});
