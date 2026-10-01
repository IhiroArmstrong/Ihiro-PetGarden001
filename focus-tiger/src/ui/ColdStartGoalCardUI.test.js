/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'ColdStartGoalCardUI.js'), 'utf8');

test('ColdStartGoalCardUI supports manual re-open without rewriting seen flag', () => {
  assert.match(src, /open\(options = \{\}\)/);
  assert.match(src, /this\._manual = Boolean\(options\.manual\)/);
  assert.match(src, /if \(manual && choice === 'browse'\)/);
  assert.match(src, /if \(!manual\) \{\s*markColdStartGoalSeen/);
});
