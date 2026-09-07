/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import en from '../locales/en.json' with { type: 'json' };

const here = dirname(fileURLToPath(import.meta.url));

test('RecoverResetOfferUI exposes stable testids and bottom clearance', () => {
  const src = readFileSync(join(here, 'RecoverResetOfferUI.js'), 'utf8');
  assert.match(src, /recover-reset-offer/);
  assert.match(src, /homeClearanceBottomCss/);
  assert.match(src, /RESET_OFFER_PROMPT/);
  assert.equal(src.includes('pointer-events: auto'), true);
});

test('reset offer locale keys exist in en', () => {
  assert.ok(en.RESET_OFFER_PROMPT.length > 10);
  assert.ok(en.RESET_EMOJI_STEADY.length > 0);
  assert.ok(en.RESET_GROUND_INTRO.length > 10);
});
