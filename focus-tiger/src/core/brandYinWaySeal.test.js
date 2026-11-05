/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { mergeLocalePack } from '../locales/mergeLocaleSlices.js';
import { LOCALE_SLICES } from '../locales/localeSliceModules.js';
import {
  BRAND_YIN_WAY_SEAL_I18N_KEY,
  resolveBrandYinWaySeal
} from './brandYinWaySeal.js';

const here = dirname(fileURLToPath(import.meta.url));

test('resolveBrandYinWaySeal reads BRAND_YIN_WAY_SEAL via t()', () => {
  const seal = resolveBrandYinWaySeal({
    t: (key) =>
      key === BRAND_YIN_WAY_SEAL_I18N_KEY
        ? 'Walking the Yin Way. · Samatia'
        : key
  });
  assert.equal(seal, 'Walking the Yin Way. · Samatia');
});

test('T87: merged locale seal uses Samatia on export watermark', () => {
  const en = JSON.parse(readFileSync(join(here, '../locales/en.json'), 'utf8'));
  const ja = JSON.parse(readFileSync(join(here, '../locales/ja.json'), 'utf8'));
  const zh = JSON.parse(readFileSync(join(here, '../locales/zh.json'), 'utf8'));
  const { dictionaries, errors } = mergeLocalePack({ en, zh, ja }, LOCALE_SLICES);
  assert.equal(errors.length, 0);
  assert.equal(dictionaries.en.BRAND_YIN_WAY_SEAL, 'Walking the Yin Way. · Samatia');
  assert.equal(dictionaries.ja.BRAND_YIN_WAY_SEAL, '寅の道を歩む。 · Samatia');
  assert.equal(dictionaries.zh.BRAND_YIN_WAY_SEAL, '體驗寅之道。 · Samatia');
  assert.match(dictionaries.en.BRAND_YIN_WAY_SEAL, /Walking the Yin Way\./);
  assert.doesNotMatch(dictionaries.en.BRAND_YIN_WAY_SEAL, /\?/);
});
