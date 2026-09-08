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

test('CalmActionArriveCardUI exposes stable testid above companion dock', () => {
  const src = readFileSync(join(here, 'CalmActionArriveCardUI.js'), 'utf8');
  assert.match(src, /calm-action-arrive-card/);
  assert.match(src, /bottom: max\(220px/);
});
