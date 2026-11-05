/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeLocalePack } from '../mergeLocaleSlices.js';
import { LOCALE_SLICES } from '../localeSliceModules.js';
import slice from './samatia-display-name.json' with { type: 'json' };

const here = dirname(fileURLToPath(import.meta.url));

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

test('T87-A1: merged locales expose Samatia as user-visible product name', () => {
  for (const locale of ['en', 'zh', 'ja']) {
    const m = loadMerged(locale);
    assert.equal(m.APP_TITLE, 'Samatia', locale);
    assert.equal(m.HINT_APP_PURPOSE_COLOPHON_MARK, 'Samatia™', locale);
    assert.equal(m.SUPPORT_PRO_TITLE, 'Samatia Pro', locale);
    assert.doesNotMatch(m.HINT_APP_PURPOSE_TITLE, /Focus Tiger|フォーカス・タイガー/);
    assert.doesNotMatch(String(m.HINT_APP_PURPOSE_WELLNESS_SUMMARY || ''), /Focus Tiger/);
    assert.doesNotMatch(String(m.LOCAL_DATA_IMPORT_ERR_FORMAT || ''), /Focus Tiger/);
  }

  assert.equal(slice.ja.HINT_APP_PURPOSE_TITLE, 'Samatia（サマティア）');
  assert.match(slice.en.HINT_APP_PURPOSE_PRONUNCIATION, /sa-MAH-tee-ah/);
  assert.doesNotMatch(JSON.stringify(slice.zh), /三摩莎/);
});

test('T87-A2: merged voice-access and export paths say Samatia', () => {
  for (const locale of ['en', 'zh', 'ja']) {
    const m = loadMerged(locale);
    assert.doesNotMatch(String(m.HINT_APP_PURPOSE_VOICE_ACCESS_BODY || ''), /Focus Tiger|フォーカス・タイガー/);
    assert.match(String(m.BRAND_YIN_WAY_SEAL || ''), /Samatia/);
  }
});

