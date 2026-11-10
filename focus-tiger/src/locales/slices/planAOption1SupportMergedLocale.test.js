/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Plan A option 1: Support Pro / add-on copy (merged runtime) must not resurrect
 * legacy on-device Confide sale promises. Bases may be aligned to the slice
 * (copy-only); new copy still goes in slices.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeLocalePack } from '../mergeLocaleSlices.js';
import { LOCALE_SLICES } from '../localeSliceModules.js';
import planASlice from './plan-a-option1-support-sale-stop.json' with { type: 'json' };

const KEYS = [
  'SUPPORT_PRO_BLURB',
  'SUPPORT_COMPANION_ADDON_BLURB',
  'SUPPORT_COMPANION_ADDON_CTA_OWNED',
  'SUPPORT_CHECKOUT_SALE_PAUSED'
];

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

test('Plan A: merged Support keys match plan-a slice (subscribed / sale-stop copy)', () => {
  for (const locale of ['en', 'zh', 'ja']) {
    const merged = loadMerged(locale);
    for (const key of KEYS) {
      assert.equal(merged[key], planASlice[locale][key], `${locale}.${key}`);
    }
  }
});

const FORBIDDEN_IN_MERGED = {
  zh: [/另加桌面端本机倾诉/, /解锁本机阿寅/],
  en: [/Confide with on-device Yin/, /Unlock on-device Yin once/],
  ja: [/端末内阿寅を一度の購入で解放/]
};

test('Plan A: merged Support copy has no legacy on-device Confide sale promise', () => {
  for (const [locale, patterns] of Object.entries(FORBIDDEN_IN_MERGED)) {
    const merged = loadMerged(locale);
    const blob = KEYS.map((k) => String(merged[k] ?? '')).join('\n');
    for (const pattern of patterns) {
      assert.doesNotMatch(blob, pattern, locale);
    }
  }
});
