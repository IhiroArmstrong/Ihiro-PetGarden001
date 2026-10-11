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
const src = readFileSync(join(here, 'HomeSanctuaryNavFanUI.js'), 'utf8');

test('the sanctuary fan hinges under the language button', () => {
  assert.match(src, /language-preference-fab/);
  assert.match(src, /dataset\.fanAnchor = 'corner'/);
  assert.match(src, /border-radius: 50%/);
  assert.doesNotMatch(src, /opts\.anchorEl/);
  assert.doesNotMatch(src, /left: -96px/);
});
