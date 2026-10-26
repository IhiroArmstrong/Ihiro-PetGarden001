/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  FOCUS_TIGER_LOCAL_STORAGE_KEY_LITERAL_EXCEPTIONS,
  auditFocusTigerLocalStorageKeyLiterals,
  scanFocusTigerLocalStorageKeyLiterals
} from './localStateKeyLiteralScan.js';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from './localStateKeys.js';

const SRC_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Frozen at T60 — shrink-only (remove rows when key joins reset whitelist). */
const T60_LITERAL_EXCEPTION_COUNT = 14;

test('FOCUS_TIGER_LOCAL_STORAGE_KEY_LITERAL_EXCEPTIONS is shrink-only', () => {
  assert.equal(
    FOCUS_TIGER_LOCAL_STORAGE_KEY_LITERAL_EXCEPTIONS.length,
    T60_LITERAL_EXCEPTION_COUNT
  );
  const unique = new Set(FOCUS_TIGER_LOCAL_STORAGE_KEY_LITERAL_EXCEPTIONS);
  assert.equal(
    unique.size,
    FOCUS_TIGER_LOCAL_STORAGE_KEY_LITERAL_EXCEPTIONS.length
  );
});

test('every focus-tiger.*.v1 literal in src is on reset whitelist or shrink-only exceptions', () => {
  const { ok, unregistered } = auditFocusTigerLocalStorageKeyLiterals({
    srcRoot: SRC_ROOT
  });
  assert.equal(
    ok,
    true,
    unregistered.length
      ? `unregistered literals: ${unregistered.join(', ')}`
      : ''
  );
});

test('scan finds awaken-check-ins literal (T52 storage)', () => {
  const literals = scanFocusTigerLocalStorageKeyLiterals(SRC_ROOT);
  assert.ok(literals.includes('focus-tiger.awaken-check-ins.v1'));
});

test('T60 reset whitelist includes awaken check-ins and focus duration pref', () => {
  assert.ok(
    FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes('focus-tiger.awaken-check-ins.v1')
  );
  assert.ok(
    FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes('focus-tiger.focus-duration-pref.v1')
  );
});
