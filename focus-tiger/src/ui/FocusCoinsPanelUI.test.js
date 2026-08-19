/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOCUS_COIN_CATALOG } from '../core/focusCoinsLedger.js';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'FocusCoinsPanelUI.js'), 'utf8');

test('Yin Coin panel is Journey-log glass family (z-index 18, 220ms fade, :active)', () => {
  assert.match(src, /id = 'yin-coin-panel'/);
  assert.match(src, /z-index: 18/);
  assert.match(src, /const FADE_MS = 220/);
  assert.match(src, /\.yin-coin-panel__btn:active:not\(:disabled\)/);
  assert.match(src, /overflow: auto/);
  assert.match(src, /listFocusCoinSurfaceRows/);
});

test('panel source maps every catalog SKU via listFocusCoinSurfaceRows (all 8)', () => {
  assert.equal(FOCUS_COIN_CATALOG.length, 8);
  assert.match(src, /listFocusCoinSurfaceRows\(ctx\)/);
  assert.match(src, /dataset\.sku = row\.id/);
});
