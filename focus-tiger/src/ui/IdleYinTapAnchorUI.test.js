/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'IdleYinTapAnchorUI.js'), 'utf8');

test('Idle Yin tap is hidden when not armed (no silent click on a visible hit)', () => {
  assert.match(src, /setArmed/);
  assert.match(src, /this\.root\.hidden = !show/);
  assert.match(src, /if \(!this\._armed\) return/);
  assert.match(src, /z-index: 12/);
  assert.match(src, /IDLE_YIN_TAP_ARIA/);
});
