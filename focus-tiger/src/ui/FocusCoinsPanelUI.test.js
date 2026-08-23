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

test("Yin's Collections docks right on ≥480 and stays a short sheet on narrow", () => {
  assert.match(src, /@media \(min-width: 480px\)/);
  assert.match(src, /left: max\(56vw, calc\(100vw - 360px\)\)/);
  assert.match(src, /max-height: min\(42vh, 380px\)/);
  assert.doesNotMatch(src, /max-height: min\(70vh, 520px\)/);
});

test('Collections Bond / busy copy uses the center toast so the panel cannot bury it', () => {
  const main = readFileSync(join(here, '../main.js'), 'utf8');
  assert.match(
    main,
    /onMessage:\s*\(message\)\s*=>\s*\n?\s*mindfulToast\.show\(message,\s*\{\s*placement:\s*'center'\s*\}\)/
  );
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

test('Collections panel Play is a footer control, not a shop SKU row', () => {
  assert.match(src, /dataset\.testid = 'yin-coin-wave-play'/);
  assert.match(src, /YIN_COIN_WAVE_PLAY/);
  assert.match(src, /YIN_COIN_WAVE_BUSY/);
  assert.doesNotMatch(src, /gesture\.wave-hello/);
  assert.equal(listShopFocusCoinSkus().includes('gesture.wave-hello'), false);
});
