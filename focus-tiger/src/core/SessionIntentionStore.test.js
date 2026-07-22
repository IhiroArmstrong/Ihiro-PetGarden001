import test from 'node:test';
import assert from 'node:assert/strict';

import {
  INTENTION_MAX_SAVED,
  INTENTION_STORAGE_KEY,
  formatIntentionEcho,
  intentionEchoKey,
  normalizeIntentionText,
  recordIntention,
  resolveSessionIntentionLatch,
  trimIntentions
} from './SessionIntentionStore.js';
import { getStorage, setStorage } from '../utils/Storage.js';

function mockStorage() {
  const memory = new Map();
  return {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(key, String(value));
    },
    removeItem(key) {
      memory.delete(key);
    }
  };
}

test('normalizeIntentionText trims and treats whitespace as empty', () => {
  assert.equal(normalizeIntentionText('  reading  '), 'reading');
  assert.equal(normalizeIntentionText('   '), '');
  assert.equal(normalizeIntentionText(null), '');
});

test('empty intention is not stored', () => {
  const previous = globalThis.localStorage;
  globalThis.localStorage = mockStorage();
  try {
    assert.equal(recordIntention('   '), null);
    assert.deepEqual(getStorage(INTENTION_STORAGE_KEY, []), []);
  } finally {
    globalThis.localStorage = previous;
  }
});

test('non-empty intention is stored with source and capped at five', () => {
  const previous = globalThis.localStorage;
  globalThis.localStorage = mockStorage();
  try {
    let clock = 1000;
    for (let i = 1; i <= 6; i += 1) {
      const entry = recordIntention(`intent-${i}`, {
        source: i % 2 === 0 ? 'icon' : 'typed',
        now: () => {
          clock += 1;
          return clock;
        }
      });
      assert.equal(entry?.text, `intent-${i}`);
      assert.equal(entry?.source, i % 2 === 0 ? 'icon' : 'typed');
    }

    const saved = getStorage(INTENTION_STORAGE_KEY, []);
    assert.equal(saved.length, INTENTION_MAX_SAVED);
    assert.deepEqual(
      saved.map((item) => item.text),
      ['intent-2', 'intent-3', 'intent-4', 'intent-5', 'intent-6']
    );
  } finally {
    globalThis.localStorage = previous;
  }
});

test('trimIntentions keeps the newest entries only', () => {
  const trimmed = trimIntentions(
    [{ text: 'a', timestamp: 1 }],
    { text: 'b', timestamp: 2 },
    1
  );
  assert.deepEqual(trimmed, [{ text: 'b', timestamp: 2 }]);
});

test('echo text matches the stored intention text by source', () => {
  const previous = globalThis.localStorage;
  globalThis.localStorage = mockStorage();
  try {
    const entry = recordIntention('  write quietly  ', {
      source: 'typed',
      now: () => 42
    });
    assert.equal(entry.text, 'write quietly');
    assert.equal(intentionEchoKey(entry.source), 'SESSION_INTENTION_ECHO_TYPED');
    assert.equal(
      formatIntentionEcho('Written direction: {text}', entry.text),
      'Written direction: write quietly'
    );
    setStorage(INTENTION_STORAGE_KEY, []);
  } finally {
    globalThis.localStorage = previous;
  }
});

test('resolveSessionIntentionLatch: pending wins; empty pending must not wipe latch', () => {
  const fromChoose = resolveSessionIntentionLatch(
    { text: '', source: 'typed' },
    { text: '📖 Reading', source: 'icon' },
    { clearIfEmpty: true }
  );
  assert.equal(fromChoose.text, '📖 Reading');
  assert.equal(fromChoose.source, 'icon');

  const afterSecondBegin = resolveSessionIntentionLatch(fromChoose, null, {
    clearIfEmpty: false
  });
  assert.equal(afterSecondBegin.text, '📖 Reading');
  assert.equal(afterSecondBegin.source, 'icon');

  const cleared = resolveSessionIntentionLatch(fromChoose, null, {
    clearIfEmpty: true
  });
  assert.equal(cleared.text, '');
});
