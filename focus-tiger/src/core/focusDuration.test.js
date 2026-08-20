/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  FOCUS_DURATION_DEFAULT_MINUTES,
  FOCUS_DURATION_OPTIONS_MINUTES,
  FOCUS_DURATION_STORAGE_KEY,
  hasExplicitSessionMinutesQuery,
  loadPreferredFocusDurationMinutes,
  normalizeFocusDurationMinutes,
  resolveFocusSessionTargetMinutes,
  savePreferredFocusDurationMinutes,
  shouldSkipFocusDurationPicker
} from './focusDuration.js';

describe('focusDuration', () => {
  it('options are 10/15/25/45 (not Breath 1/3/5/10/20)', () => {
    assert.deepEqual([...FOCUS_DURATION_OPTIONS_MINUTES], [10, 15, 25, 45]);
    assert.equal(FOCUS_DURATION_DEFAULT_MINUTES, 10);
  });

  it('normalize falls back to 10', () => {
    assert.equal(normalizeFocusDurationMinutes(15), 15);
    assert.equal(normalizeFocusDurationMinutes(10), 10);
    assert.equal(normalizeFocusDurationMinutes(1), 10);
    assert.equal(normalizeFocusDurationMinutes(20), 10);
    assert.equal(normalizeFocusDurationMinutes(60), 10);
    assert.equal(normalizeFocusDurationMinutes(NaN), 10);
  });

  it('explicit ?sessionMinutes skips picker; resolves target', () => {
    assert.equal(hasExplicitSessionMinutesQuery(''), false);
    assert.equal(hasExplicitSessionMinutesQuery('?product=1'), false);
    assert.equal(hasExplicitSessionMinutesQuery('?sessionMinutes=1'), true);
    assert.equal(shouldSkipFocusDurationPicker('?sessionMinutes=5'), true);
    assert.equal(shouldSkipFocusDurationPicker('?product=1'), false);
    // No storage arg — must not touch browser localStorage (Node CI).
    assert.equal(resolveFocusSessionTargetMinutes('?sessionMinutes=1'), 1);
    assert.equal(resolveFocusSessionTargetMinutes('?sessionMinutes=5'), 5);
    assert.equal(resolveFocusSessionTargetMinutes('?product=1'), 10);
  });

  it('prefers stored minutes when no URL override', () => {
    /** @type {Record<string, string>} */
    const mem = {};
    const storage = {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => {
        mem[k] = String(v);
      }
    };
    assert.equal(
      resolveFocusSessionTargetMinutes('?product=1', storage),
      10
    );
    savePreferredFocusDurationMinutes(45, storage);
    assert.equal(
      loadPreferredFocusDurationMinutes(storage),
      45
    );
    assert.equal(
      resolveFocusSessionTargetMinutes('?product=1', storage),
      45
    );
    assert.ok(mem[FOCUS_DURATION_STORAGE_KEY]);
    // URL still wins
    assert.equal(
      resolveFocusSessionTargetMinutes('?sessionMinutes=1', storage),
      1
    );
  });
});

describe('focus duration floor copy', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const localesDir = join(here, '../locales');

  it('picker hint names the 10-minute Focus floor in en/zh/ja', () => {
    for (const file of ['en.json', 'zh.json', 'ja.json']) {
      const loc = JSON.parse(readFileSync(join(localesDir, file), 'utf8'));
      const hint = loc['focus_duration.hint'];
      assert.equal(typeof hint, 'string', file);
      assert.match(hint, /10/, `${file} must name the 10-minute floor`);
    }
  });

  it('interval hint names the 10-minute Focus floor in en/zh/ja', () => {
    for (const file of ['en.json', 'zh.json', 'ja.json']) {
      const loc = JSON.parse(readFileSync(join(localesDir, file), 'utf8'));
      const hint = loc.SESSION_INTERVAL_RHYTHM_HINT;
      assert.equal(typeof hint, 'string', file);
      assert.match(hint, /10/, `${file} interval hint must mention 10`);
    }
  });
});
