/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Pro / companion add-on checkout restored: merged Support copy uses
 * pro-addon-checkout-restore slice (not sale-stop).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeLocalePack } from '../mergeLocaleSlices.js';
import { LOCALE_SLICES } from '../localeSliceModules.js';
import restoreSlice from './pro-addon-checkout-restore.json' with { type: 'json' };

const KEYS = [
  'SUPPORT_PRO_BLURB',
  'SUPPORT_COMPANION_ADDON_BLURB',
  'SUPPORT_COMPANION_ADDON_CTA_OWNED'
];

const SALE_STOP_PATTERNS = {
  en: [/checkout is paused/i, /not selling new Pro/i, /entry not open yet/i],
  zh: [/新结账现已暂停/, /入口尚未开放/],
  ja: [/決済は停止/, /入口はまだ開いていません/]
};

const here = dirname(fileURLToPath(import.meta.url));
const localesDir = join(here, '..');

function loadMerged(locale) {
  const bases = {
    en: JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf8')),
    zh: JSON.parse(readFileSync(join(localesDir, 'zh.json'), 'utf8')),
    ja: JSON.parse(readFileSync(join(localesDir, 'ja.json'), 'utf8'))
  };
  const { dictionaries, errors } = mergeLocalePack(bases, LOCALE_SLICES);
  assert.equal(errors.length, 0, errors.join('; '));
  return dictionaries[locale];
}

test('merged Support keys match pro-addon-checkout-restore slice', () => {
  for (const locale of ['en', 'zh', 'ja']) {
    const merged = loadMerged(locale);
    for (const key of KEYS) {
      assert.equal(merged[key], restoreSlice[locale][key], `${locale}.${key}`);
    }
    const blob = KEYS.map((k) => String(merged[k] ?? '')).join('\n');
    for (const pattern of SALE_STOP_PATTERNS[locale]) {
      assert.doesNotMatch(blob, pattern, locale);
    }
  }
});

test('locale slices: sale-stop removed, restore slice present', () => {
  const names = LOCALE_SLICES.map((s) => s.filename);
  assert.equal(names.includes('plan-a-option1-support-sale-stop.json'), false);
  assert.equal(names.includes('pro-addon-checkout-restore.json'), true);
});