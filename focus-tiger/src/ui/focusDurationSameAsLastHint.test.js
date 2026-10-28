/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  FOCUS_DURATION_STORAGE_KEY,
  hasStoredFocusDurationPreference,
  savePreferredFocusDurationMinutes
} from '../core/focusDuration.js';

const here = dirname(fileURLToPath(import.meta.url));

describe('FOCUS_DURATION_SAME_AS_LAST slice', () => {
  const slice = JSON.parse(
    readFileSync(
      join(here, '../locales/slices/still-last-duration-copy.json'),
      'utf8'
    )
  );

  it('en/zh/ja keys align and avoid companion forbidden substrings', () => {
    const forbidden = [
      /懂你/i,
      /knows you/i,
      /only Yin/i,
      /已证明/i,
      /理解している/,
      /慣れてきた/
    ];
    for (const lang of ['en', 'zh', 'ja']) {
      const text = slice[lang].FOCUS_DURATION_SAME_AS_LAST;
      assert.equal(typeof text, 'string', lang);
      for (const re of forbidden) {
        assert.doesNotMatch(text, re, `${lang} must avoid ${re}`);
      }
    }
  });
});

describe('hasStoredFocusDurationPreference (T59)', () => {
  it('false until pref written; true after save', () => {
    /** @type {Record<string, string>} */
    const mem = {};
    const storage = {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => {
        mem[k] = String(v);
      }
    };
    assert.equal(hasStoredFocusDurationPreference(storage), false);
    savePreferredFocusDurationMinutes(25, storage);
    assert.equal(hasStoredFocusDurationPreference(storage), true);
    assert.ok(mem[FOCUS_DURATION_STORAGE_KEY]);
  });
});
