import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FOCUS_TIGER_LOCAL_STORAGE_KEYS,
  clearAllFocusTigerLocalState,
  markDevResetToast,
  consumeDevResetToast,
  markDevBootIdle,
  consumeDevBootIdle,
  DEV_RESET_TOAST_SESSION_KEY,
  DEV_BOOT_IDLE_SESSION_KEY
} from './localStateKeys.js';

test('clearAllFocusTigerLocalState removes every known Focus Tiger key', () => {
  const map = new Map();
  for (const key of FOCUS_TIGER_LOCAL_STORAGE_KEYS) {
    map.set(key, 'x');
  }
  map.set('unrelated.app.v1', 'keep');

  const storage = {
    removeItem(key) {
      map.delete(key);
    },
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    }
  };

  const cleared = clearAllFocusTigerLocalState(storage);
  assert.equal(cleared.length, FOCUS_TIGER_LOCAL_STORAGE_KEYS.length);
  for (const key of FOCUS_TIGER_LOCAL_STORAGE_KEYS) {
    assert.equal(map.has(key), false);
  }
  assert.equal(map.get('unrelated.app.v1'), 'keep');
});

test('FOCUS_TIGER_LOCAL_STORAGE_KEYS stays kebab focus-tiger.*.v1 style', () => {
  for (const key of FOCUS_TIGER_LOCAL_STORAGE_KEYS) {
    assert.match(key, /^focus-tiger\.[a-z0-9.-]+\.v1$/);
  }
});

test('dev session flags are one-shot consume', () => {
  const map = new Map();
  const storage = {
    setItem(key, value) {
      map.set(key, value);
    },
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    removeItem(key) {
      map.delete(key);
    }
  };

  markDevResetToast(storage);
  assert.equal(map.get(DEV_RESET_TOAST_SESSION_KEY), '1');
  assert.equal(consumeDevResetToast(storage), true);
  assert.equal(consumeDevResetToast(storage), false);

  markDevBootIdle(storage);
  assert.equal(map.get(DEV_BOOT_IDLE_SESSION_KEY), '1');
  assert.equal(consumeDevBootIdle(storage), true);
  assert.equal(consumeDevBootIdle(storage), false);
});
