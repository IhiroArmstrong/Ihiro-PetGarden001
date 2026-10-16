/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDebugBesideSeats } from './FocusCircleBesideSeatsChrome.js';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'FocusCircleBesideSeatsChrome.js'), 'utf8');
const publicUi = join(here, '../../public/ui');

test('beside seat row uses the cut-out Yin outline and cannot be clicked', () => {
  assert.equal(existsSync(join(publicUi, 'yin-sitting-outline.png')), true);
  assert.equal(existsSync(join(publicUi, 'yin-sitting-fill.png')), true);
  assert.match(src, /pointer-events:\s*none/);
  assert.match(src, /z-index:\s*\$\{Z\.CIRCLE\}/);
  assert.match(src, /yin-sitting-outline\.png/);
  assert.match(src, /is-seated/);
});

test('debug query previews a row with pale-gold seats', () => {
  assert.deepEqual(readDebugBesideSeats('?debugBesideSeats=5&debugBesideGold=2'), {
    memberCount: 5,
    seatedCount: 2
  });
  assert.equal(readDebugBesideSeats(''), null);
});
