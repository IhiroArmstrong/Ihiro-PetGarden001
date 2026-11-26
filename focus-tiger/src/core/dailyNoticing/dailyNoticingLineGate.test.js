/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { inspectModelOutput } from '../outputGate/outputGateRules.js';

const here = dirname(fileURLToPath(import.meta.url));
const slice = JSON.parse(
  readFileSync(join(here, '../../locales/slices/daily-noticing.json'), 'utf8')
);
const KEYS = [
  'DAILY_NOTICING_Q1',
  'DAILY_NOTICING_Q2',
  'DAILY_NOTICING_Q3',
  'DAILY_NOTICING_Q4',
  'DAILY_NOTICING_CLOSE_1',
  'DAILY_NOTICING_CLOSE_2',
  'DAILY_NOTICING_CLOSE_3'
];

describe('daily noticing lines G3', () => {
  for (const locale of ['en', 'zh', 'ja']) {
    for (const key of KEYS) {
      it(`${locale} ${key}`, () => {
        const text = slice[locale][key];
        const found = inspectModelOutput(text);
        assert.notEqual(found.category, 'G6', text);
      });
    }
  }
});