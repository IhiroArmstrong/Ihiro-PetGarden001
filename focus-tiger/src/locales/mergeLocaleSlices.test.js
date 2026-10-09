/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeLocalePack,
  localeHotspotError,
  validateLocaleSlice
} from './mergeLocaleSlices.js';

const slice = {
  en: { ART_NOTE: 'A quiet note.' },
  zh: { ART_NOTE: '一句安静的提示。' },
  ja: { ART_NOTE: '静かな一言。' }
};

describe('validateLocaleSlice', () => {
  it('requires the same keys in en, zh, and ja', () => {
    const result = validateLocaleSlice('art.json', {
      en: { ART_NOTE: 'A quiet note.' },
      zh: { ART_NOTE: '一句。' },
      ja: {}
    });
    assert.equal(result.errors.length > 0, true);
  });
});

describe('mergeLocalePack', () => {
  it('adds a new key without changing the base object', () => {
    const en = { APP_TITLE: 'Focus Tiger' };
    const zh = { APP_TITLE: '坐禅小老虎' };
    const ja = { APP_TITLE: '集中タイガー' };
    const merged = mergeLocalePack({ en, zh, ja }, [
      { filename: 'art.json', data: slice }
    ]);
    assert.deepEqual(merged.errors, []);
    assert.equal(merged.dictionaries.en.ART_NOTE, 'A quiet note.');
    assert.equal(merged.dictionaries.ja.ART_NOTE, '静かな一言。');
    assert.equal(en.ART_NOTE, undefined);
  });

  it('lets a slice override a base key and rejects two owners', () => {
    const bases = {
      en: { APP_TITLE: 'Focus Tiger' },
      zh: { APP_TITLE: '坐禅小老虎' },
      ja: { APP_TITLE: '集中タイガー' }
    };
    const override = {
      en: { APP_TITLE: 'Focus Tiger' },
      zh: { APP_TITLE: '坐禅小老虎' },
      ja: { APP_TITLE: 'フォーカスタイガー' }
    };
    const once = mergeLocalePack(bases, [
      { filename: 'title.json', data: override }
    ]);
    assert.equal(once.dictionaries.ja.APP_TITLE, 'フォーカスタイガー');
    const twice = mergeLocalePack(bases, [
      { filename: 'a.json', data: slice },
      { filename: 'b.json', data: slice }
    ]);
    assert.equal(twice.errors.some((err) => err.includes('ART_NOTE')), true);
  });
});

describe('localeHotspotError', () => {
  it('flags the three shared dictionaries only', () => {
    assert.equal(
      localeHotspotError(['focus-tiger/src/locales/slices/art.json']),
      null
    );
    assert.match(
      localeHotspotError(['focus-tiger/src/locales/en.json']) || '',
      /en\.json/
    );
  });
});
