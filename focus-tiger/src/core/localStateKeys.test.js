import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FOCUS_TIGER_LOCAL_STORAGE_KEYS,
  clearAllFocusTigerLocalState
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
