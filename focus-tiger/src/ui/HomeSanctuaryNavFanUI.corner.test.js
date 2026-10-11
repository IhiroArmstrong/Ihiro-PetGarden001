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

test('the sanctuary compass FAB sits at the bottom-right fan hinge', () => {
  assert.match(src, /ft-sanctuary-nav-compass-fab/);
  assert.match(src, /right: calc\(16px \+ \$\{COMPASS_FAB_PX\}px \+ 12px\)/);
  assert.match(src, /dataset\.fanAnchor = 'corner'/);
  assert.match(src, /border-radius: 50%/);
  assert.doesNotMatch(src, /opts\.anchorEl/);
  assert.doesNotMatch(src, /left: -96px/);
});
