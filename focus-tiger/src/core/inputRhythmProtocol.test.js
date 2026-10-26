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
  parseInputRhythmStdoutLine,
  sanitizeInputRhythmLine
} from './inputRhythmProtocol.js';

const helperSrc = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../desktop/native/macos-input-rhythm-helper.swift'
  ),
  'utf8'
);

describe('inputRhythmProtocol', () => {
  it('keeps only count fields', () => {
    const row = sanitizeInputRhythmLine({
      ok: true,
      t: 10,
      keys: 3,
      backs: 1,
      switches: 2
    });
    assert.deepEqual(row, {
      ok: true,
      t: 10,
      keys: 3,
      backs: 1,
      switches: 2,
      error: null
    });
  });

  it('drops lines with content fields', () => {
    assert.equal(sanitizeInputRhythmLine({ ok: true, keys: 1, keycode: 12 }), null);
    assert.equal(sanitizeInputRhythmLine({ ok: true, title: 'Mail' }), null);
    assert.equal(parseInputRhythmStdoutLine('{"ok":true,"chars":"a"}'), null);
  });

  it('helper source never prints character or title keys', () => {
    assert.equal(/"keycode"/.test(helperSrc), false);
    assert.equal(/"title"/.test(helperSrc), false);
    assert.equal(/"chars"/.test(helperSrc), false);
    assert.match(helperSrc, /"keys"/);
    assert.match(helperSrc, /listenOnly/);
  });
});
