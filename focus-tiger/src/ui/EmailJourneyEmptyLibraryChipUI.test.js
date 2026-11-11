/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  join(here, 'EmailJourneyEmptyLibraryChipUI.js'),
  'utf8'
);

test('empty-library chip is a secondary button, not a first-scene overlay', () => {
  assert.match(src, /ROOT_ID = 'email-journey-empty-library-chip'/);
  assert.match(src, /EMAIL_JOURNEY_EMPTY_RESTORE/);
  assert.match(src, /pointer-events:\s*auto/);
  assert.doesNotMatch(src, /requestOverlaySlot/);
});
