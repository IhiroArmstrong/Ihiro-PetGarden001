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
const slicePath = join(here, 'co-practice-copy.json');

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

describe('co-practice-copy slice (T64)', () => {
  it('slice file defines both keys for en, zh, ja', () => {
    const slice = JSON.parse(readFileSync(slicePath, 'utf8'));
    for (const locale of ['en', 'zh', 'ja']) {
      assert.equal(typeof slice[locale].HINT_APP_PURPOSE_BODY, 'string');
      assert.equal(typeof slice[locale].HINT_APP_PURPOSE_WELLNESS_BODY, 'string');
    }
  });

  it('en purpose adds practice together without hype', () => {
    const en = loadMerged('en');
    assert.match(en.HINT_APP_PURPOSE_BODY, /We can practice together\. No rush, no judgment\./);
    assert.match(en.HINT_APP_PURPOSE_BODY, /no ads, no data mining/i);
  });

  it('en wellness adds not a zen master after clinical disclaimer', () => {
    const en = loadMerged('en');
    assert.match(en.HINT_APP_PURPOSE_WELLNESS_BODY, /counselor, therapist, or doctor/i);
    assert.match(en.HINT_APP_PURPOSE_WELLNESS_BODY, /not a zen master/i);
    assert.match(en.HINT_APP_PURPOSE_WELLNESS_BODY, /dharma transmission/i);
    assert.doesNotMatch(en.HINT_APP_PURPOSE_WELLNESS_BODY, /zen master who/i);
  });

  it('zh wellness adds 不是禅师', () => {
    const zh = loadMerged('zh');
    assert.match(zh.HINT_APP_PURPOSE_WELLNESS_BODY, /不是禅师/);
    assert.match(zh.HINT_APP_PURPOSE_BODY, /一起练习。不催，不评判/);
  });

  it('ja wellness names 禅師ではありません without enlightenment guarantee', () => {
    const ja = loadMerged('ja');
    assert.match(ja.HINT_APP_PURPOSE_WELLNESS_BODY, /禅師ではありません/);
    assert.doesNotMatch(ja.HINT_APP_PURPOSE_WELLNESS_BODY, /悟りを保証/);
    assert.match(ja.HINT_APP_PURPOSE_BODY, /一緒に練習できます/);
  });
});
