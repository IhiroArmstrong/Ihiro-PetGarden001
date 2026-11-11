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
  join(here, 'EmailJourneySitCompletePromptUI.js'),
  'utf8'
);

test('sit-complete prompt is overlay dim, clickable, no countdown', () => {
  assert.match(src, /ROOT_ID = 'email-journey-sit-complete-prompt'/);
  assert.match(src, /Z\.OVERLAY_DIM/);
  assert.match(src, /pointer-events:\s*auto/);
  assert.match(src, /EMAIL_JOURNEY_NOT_NOW/);
  assert.doesNotMatch(src, /AWAKEN_AUTO_DISMISS_MS/);
});
