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
import { YIN_COIN_COLLECTIONS_TABS } from './FocusCoinsPanelUI.js';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'FocusCoinsPanelUI.js'), 'utf8');
const publicUi = join(here, '../../public/ui/focus-coins');

test("Yin's Collections overlay backdrop contract", () => {
  assert.match(src, /id: 'yin-coin-panel-backdrop'/);
  assert.match(src, /testId: 'yin-coin-panel-backdrop'/);
  assert.match(src, /showOverlayBackdrop\(this\.backdrop\)/);
  assert.match(src, /hideOverlayBackdrop\(this\.backdrop\)/);
});

test("Yin's Collections panel is Journey-log glass family (z-index 18, 220ms fade, :active)", () => {
  assert.match(src, /id = 'yin-coin-panel'/);
  assert.match(src, /z-index: 18/);
  assert.match(src, /const FADE_MS = OVERLAY_BACKDROP_FADE_MS/);
  assert.match(src, /\.yin-coin-panel__btn:active:not\(:disabled\)/);
  assert.match(src, /overflow: auto/);
  assert.match(src, /listFocusCoinSurfaceSections/);
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

test('panel source maps shop SKUs via listFocusCoinSurfaceSections', () => {
  assert.equal(listShopFocusCoinSkus().length, 8);
  assert.match(src, /listFocusCoinSurfaceSections\(ctx\)/);
  assert.match(src, /dataset\.sku = row\.id/);
  assert.match(src, /YIN_COIN_SECTION_OBTAINED/);
  assert.match(src, /YIN_COIN_SECTION_PENDING/);
  assert.match(src, /yin-coin-panel__row--owned/);
  assert.match(src, /yin-coin-panel__owned-seal/);
});

test('Collections wave play eases backdrop blur via body class', () => {
  assert.match(src, /YIN_COIN_WAVE_FOCUS_BODY_CLASS/);
  assert.match(src, /releaseYinCoinWaveFocus/);
  const main = readFileSync(join(here, '../main.js'), 'utf8');
  assert.match(main, /acquireYinCoinWaveFocus/);
  assert.match(main, /releaseYinCoinWaveFocus/);
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

test('Collections header shows locale brand tagline under panel title', () => {
  assert.match(src, /dataset\.testid = 'yin-coin-brand-tagline'/);
  assert.match(src, /BRAND_YIN_WAY_TAGLINE/);
  const en = JSON.parse(
    readFileSync(join(here, '../locales/en.json'), 'utf8')
  );
  const ja = JSON.parse(
    readFileSync(join(here, '../locales/ja.json'), 'utf8')
  );
  const zh = JSON.parse(
    readFileSync(join(here, '../locales/zh.json'), 'utf8')
  );
  assert.equal(en.BRAND_YIN_WAY_TAGLINE, 'Walking the Yin Way?');
  assert.equal(ja.BRAND_YIN_WAY_TAGLINE, '寅の道を歩む？');
  assert.equal(zh.BRAND_YIN_WAY_TAGLINE, '體驗寅之道嗎？');
});

test('not-for-sale copy names sitting-together over time, not years of sitting', () => {
  const en = JSON.parse(
    readFileSync(join(here, '../locales/en.json'), 'utf8')
  );
  const zh = JSON.parse(
    readFileSync(join(here, '../locales/zh.json'), 'utf8')
  );
  assert.equal(/years of sitting/i.test(en.YIN_COIN_NOT_FOR_SALE), false);
  assert.match(en.YIN_COIN_NOT_FOR_SALE, /sitting together over time/i);
  assert.match(zh.YIN_COIN_NOT_FOR_SALE, /同坐日久/);
});

test('Collections D.4 uses object-card states and bond-only CTA', () => {
  assert.match(src, /dataset\.state = row\.owned/);
  assert.match(src, /yin-coin-panel__btn--bond/);
  assert.match(src, /yin-coin-panel__faint/);
  assert.match(src, /YIN_COIN_NOT_YET/);
});

test("Yin's Collections four-tab shell: bond default, placeholders on other tabs", () => {
  assert.deepEqual(YIN_COIN_COLLECTIONS_TABS, [
    'bond',
    'titles',
    'scroll',
    'imprints'
  ]);
  assert.match(src, /YIN_COIN_COLLECTIONS_TABS/);
  assert.match(src, /dataset\.testid = 'yin-coin-tabs'/);
  assert.match(src, /YIN_COIN_TAB_BOND/);
  assert.match(src, /YIN_COIN_TAB_TITLES/);
  assert.match(src, /YIN_COIN_TAB_SCROLL/);
  assert.match(src, /YIN_COIN_TAB_IMPRINTS/);
  assert.match(src, /YIN_COIN_TAB_COMING_SOON/);
  assert.match(src, /this\._setTab\('bond'/);
  assert.match(src, /yin-coin-panel__tab-placeholder/);
  const en = JSON.parse(
    readFileSync(join(here, '../locales/en.json'), 'utf8')
  );
  const zh = JSON.parse(
    readFileSync(join(here, '../locales/zh.json'), 'utf8')
  );
  assert.equal(zh.YIN_COIN_TAB_BOND, '结缘点缀');
  assert.equal(zh.YIN_COIN_TAB_TITLES, '陪伴称号');
  assert.equal(zh.YIN_COIN_TAB_SCROLL, '记忆小册');
  assert.equal(zh.YIN_COIN_TAB_IMPRINTS, '勋章印记');
  assert.equal(en.YIN_COIN_TAB_COMING_SOON, 'Coming soon');
});

test('Collections memorial section renders scarcity rows; imprint tiers reopen card', () => {
  assert.match(src, /listCollectionsBehavioralScarcityRows/);
  assert.match(src, /COLLECTIONS_SCARCITY_SECTION/);
  assert.match(src, /yin-coin-panel__memorial-row/);
  assert.match(src, /formatCollectionsScarcityExplanation/);
  assert.match(src, /isMemorialImprintOpenable/);
  assert.match(src, /onMemorialImprintOpen/);
  assert.match(src, /imprint-minutes-/);
  assert.match(src, /_memorialRowEl[\s\S]*addEventListener\('click'/);
});
