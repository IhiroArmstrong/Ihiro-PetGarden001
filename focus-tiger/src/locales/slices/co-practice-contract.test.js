/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeLocalePack } from '../mergeLocaleSlices.js';
import { LOCALE_SLICES } from '../localeSliceModules.js';

const here = dirname(fileURLToPath(import.meta.url));
const slicePath = join(here, 'co-practice-contract.json');

function loadMerged(locale) {
  const localesDir = join(here, '..');
  const bases = {
    en: JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf8')),
    zh: JSON.parse(readFileSync(join(localesDir, 'zh.json'), 'utf8')),
    ja: JSON.parse(readFileSync(join(localesDir, 'ja.json'), 'utf8'))
  };
  const { dictionaries, errors } = mergeLocalePack(bases, LOCALE_SLICES);
  assert.equal(errors.length, 0, errors.join('; '));
  return dictionaries[locale];
}

describe('co-practice-contract slice (T63)', () => {
  it('defines title and rows for en, zh, ja', () => {
    const slice = JSON.parse(readFileSync(slicePath, 'utf8'));
    for (const locale of ['en', 'zh', 'ja']) {
      assert.equal(typeof slice[locale].CO_PRACTICE_CONTRACT_TITLE, 'string');
      assert.equal(typeof slice[locale].CO_PRACTICE_CONTRACT_ROW_DAILY_REMINDER, 'string');
    }
  });

  it('en title avoids intervention/coach wording', () => {
    const en = loadMerged('en');
    assert.match(en.CO_PRACTICE_CONTRACT_TITLE, /How Yin may speak/i);
    assert.doesNotMatch(en.CO_PRACTICE_CONTRACT_TITLE, /intervention|coach/i);
  });
});
