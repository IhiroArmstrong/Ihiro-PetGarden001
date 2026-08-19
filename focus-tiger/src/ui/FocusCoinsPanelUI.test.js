/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listShopFocusCoinSkus } from '../core/focusCoinsLedger.js';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'FocusCoinsPanelUI.js'), 'utf8');
const publicUi = join(here, '../../public/ui/focus-coins');

test("Yin's Collections panel is Journey-log glass family (z-index 18, 220ms fade, :active)", () => {
  assert.match(src, /id = 'yin-coin-panel'/);
  assert.match(src, /z-index: 18/);
  assert.match(src, /const FADE_MS = 220/);
  assert.match(src, /\.yin-coin-panel__btn:active:not\(:disabled\)/);
  assert.match(src, /overflow: auto/);
  assert.match(src, /listFocusCoinSurfaceRows/);
});

test('panel source maps shop SKUs via listFocusCoinSurfaceRows', () => {
  assert.equal(listShopFocusCoinSkus().length, 8);
  assert.match(src, /listFocusCoinSurfaceRows\(ctx\)/);
  assert.match(src, /dataset\.sku = row\.id/);
});

test('Yin Coin marks are UI chrome files (relief header + flat icon)', () => {
  assert.match(src, /MARK_SRC = '\/ui\/focus-coins\/yin-coin-mark.png'/);
  assert.match(src, /ICON_SRC = '\/ui\/focus-coins\/yin-coin-mark-icon.png'/);
  assert.match(src, /dataset\.testid = 'yin-coin-mark'/);
  assert.match(src, /dataset\.testid = 'yin-coin-balance-icon'/);
  assert.equal(existsSync(join(publicUi, 'yin-coin-mark.png')), true);
  assert.equal(existsSync(join(publicUi, 'yin-coin-mark-icon.png')), true);
});
