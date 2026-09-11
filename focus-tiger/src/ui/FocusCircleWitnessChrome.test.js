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
const src = readFileSync(join(here, 'FocusCircleWitnessChrome.js'), 'utf8');

test('idle witness chrome uses warm glass panel tokens (phase 2)', () => {
  assert.match(src, /glassPanelStyles\.js/);
  assert.match(src, /GLASS_FILL/);
  assert.match(src, /GLASS_BLUR_CSS/);
  assert.doesNotMatch(src, /rgba\(214,\s*222,\s*236/);
  assert.doesNotMatch(src, /rgba\(180,\s*198,\s*224/);
});

test('idle witness chrome keeps pointer-events contract', () => {
  assert.match(src, /\.focus-circle-witness \{[\s\S]*pointer-events: none/);
  assert.match(src, /\.focus-circle-witness__respond \{[\s\S]*pointer-events: auto/);
  assert.match(src, /\.focus-circle-witness__hide \{[\s\S]*pointer-events: auto/);
});

test('idle witness respond button matches leave-strip gold CTA', () => {
  assert.match(src, /rgba\(196,\s*154,\s*74,\s*0\.88\)/);
});
