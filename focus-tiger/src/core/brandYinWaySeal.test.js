/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BRAND_YIN_WAY_SEAL_I18N_KEY,
  resolveBrandYinWaySeal
} from './brandYinWaySeal.js';

const here = dirname(fileURLToPath(import.meta.url));

test('resolveBrandYinWaySeal reads BRAND_YIN_WAY_SEAL via t()', () => {
  const seal = resolveBrandYinWaySeal({
    t: (key) =>
      key === BRAND_YIN_WAY_SEAL_I18N_KEY
        ? 'Walking the Yin Way. · Focus Tiger'
        : key
  });
  assert.equal(seal, 'Walking the Yin Way. · Focus Tiger');
});

test('locale SSOT uses statement seal (period) not question tagline', () => {
  const en = JSON.parse(readFileSync(join(here, '../locales/en.json'), 'utf8'));
  const ja = JSON.parse(readFileSync(join(here, '../locales/ja.json'), 'utf8'));
  const zh = JSON.parse(readFileSync(join(here, '../locales/zh.json'), 'utf8'));
  assert.equal(en.BRAND_YIN_WAY_SEAL, 'Walking the Yin Way. · Focus Tiger');
  assert.equal(ja.BRAND_YIN_WAY_SEAL, '寅の道を歩む。 · Focus Tiger');
  assert.equal(zh.BRAND_YIN_WAY_SEAL, '體驗寅之道。 · Focus Tiger');
  assert.match(en.BRAND_YIN_WAY_SEAL, /Walking the Yin Way\./);
  assert.doesNotMatch(en.BRAND_YIN_WAY_SEAL, /\?/);
});
