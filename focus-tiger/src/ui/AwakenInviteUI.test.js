/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AWAKEN_AUTO_DISMISS_MS } from '../core/InterventionOrchestrator.js';

test('awaken invite auto-dismisses in 10s and does not steal focus', () => {
  const src = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'AwakenInviteUI.js'),
    'utf8'
  );
  assert.equal(AWAKEN_AUTO_DISMISS_MS, 10_000);
  assert.match(src, /AWAKEN_AUTO_DISMISS_MS/);
  assert.match(src, /tabIndex = -1/);
  assert.equal(src.includes('window.focus'), false);
  assert.equal(src.includes('ANXIETY'), false);
});
