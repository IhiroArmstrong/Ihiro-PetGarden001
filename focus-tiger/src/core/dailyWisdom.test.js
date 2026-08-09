import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DAILY_WISDOM_EN,
  DAILY_WISDOM_JA,
  findDailyWisdomText,
  getDailyWisdomPool
} from '../content/daily-wisdom/index.js';
import {
  DAILY_WISDOM_RECENT_WINDOW,
  DAILY_WISDOM_STORAGE_KEY,
  DailyWisdomStore,
  dailyWisdomRecentWindow,
  hashDateKey,
  pickDailyWisdomId,
  selectWisdomId
} from './DailyWisdomStore.js';
import { resolveTodayWisdom } from './dailyWisdom.js';

function createMapStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    _map: map
  };
}

test('en/ja pools share the same stable ids', () => {
  const enIds = DAILY_WISDOM_EN.map((e) => e.id);
  const jaIds = DAILY_WISDOM_JA.map((e) => e.id);
  assert.deepEqual(enIds, jaIds);
  assert.ok(enIds.length >= 3);
  assert.equal(new Set(enIds).size, enIds.length, 'en ids unique');
  for (const required of [
    'catch-this-moment',
    'cling-to-nothing',
    'not-the-emotion'
  ]) {
    assert.ok(enIds.includes(required), `missing seed id: ${required}`);
  }
  assert.equal(
    DAILY_WISDOM_EN.find((e) => e.id === 'not-the-emotion')?.text,
    'You are not the emotion.'
  );
  assert.equal(
    DAILY_WISDOM_EN.find((e) => e.id === 'catch-this-moment')?.text,
    'Catch this moment.'
  );
  assert.equal(
    DAILY_WISDOM_EN.find((e) => e.id === 'cling-to-nothing')?.text,
    'Cling to nothing.'
  );
  for (const e of DAILY_WISDOM_EN) {
    assert.match(e.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(e.text.trim().length > 0);
  }
  for (const e of DAILY_WISDOM_JA) {
    assert.ok(e.text.trim().length > 0);
  }
});

test('getDailyWisdomPool: ja vs en; unknown locale → en', () => {
  assert.equal(getDailyWisdomPool('ja'), DAILY_WISDOM_JA);
  assert.equal(getDailyWisdomPool('en'), DAILY_WISDOM_EN);
  assert.equal(getDailyWisdomPool('zh'), DAILY_WISDOM_EN);
  assert.equal(findDailyWisdomText('catch-this-moment', 'ja'), 'この瞬間を、つかまえて。');
  assert.equal(findDailyWisdomText('catch-this-moment', 'en'), 'Catch this moment.');
});

test('hashDateKey / selectWisdomId are deterministic', () => {
  assert.equal(hashDateKey('2026-08-10'), hashDateKey('2026-08-10'));
  assert.notEqual(hashDateKey('2026-08-10'), hashDateKey('2026-08-11'));
  const ids = ['a', 'b', 'c'];
  assert.equal(selectWisdomId('2026-08-10', ids), selectWisdomId('2026-08-10', ids));
});

test('pickDailyWisdomId excludes recent window', () => {
  const pool = ['a', 'b', 'c', 'd'];
  const picked = pickDailyWisdomId('2026-08-10', pool, ['a', 'b', 'c'], 3);
  assert.equal(picked, 'd');
});

test('dailyWisdomRecentWindow caps at poolSize - 1', () => {
  assert.equal(dailyWisdomRecentWindow(1), 0);
  assert.equal(dailyWisdomRecentWindow(3, 7), 2);
  assert.equal(dailyWisdomRecentWindow(24, 7), 7);
  assert.equal(DAILY_WISDOM_RECENT_WINDOW, 7);
});

test('DailyWisdomStore locks same day; avoids recent on next day', () => {
  const storage = createMapStorage();
  const store = new DailyWisdomStore({ storage });
  const pool = [
    { id: 'a' },
    { id: 'b' },
    { id: 'c' },
    { id: 'd' },
    { id: 'e' },
    { id: 'f' },
    { id: 'g' },
    { id: 'h' }
  ];

  const day1 = store.resolveQuoteId('2026-08-01', pool);
  assert.ok(day1);
  assert.equal(store.resolveQuoteId('2026-08-01', pool), day1);
  assert.equal(
    JSON.parse(storage.getItem(DAILY_WISDOM_STORAGE_KEY)).quoteId,
    day1
  );

  const seen = new Set([day1]);
  for (let d = 2; d <= 8; d++) {
    const dayKey = `2026-08-0${d}`;
    const id = store.resolveQuoteId(dayKey, pool);
    assert.ok(id);
    assert.equal(seen.has(id), false, `day ${d} should not repeat recent ${id}`);
    seen.add(id);
  }
});

test('resolveTodayWisdom returns locale text and persists', () => {
  const storage = createMapStorage();
  const a = resolveTodayWisdom({
    date: new Date(2026, 7, 10),
    locale: 'en',
    storage
  });
  const b = resolveTodayWisdom({
    date: new Date(2026, 7, 10),
    locale: 'en',
    storage
  });
  assert.ok(a);
  assert.equal(a.dateKey, '2026-08-10');
  assert.equal(a.id, b.id);
  assert.equal(a.text, b.text);
  assert.ok(a.text.length > 0);

  const ja = resolveTodayWisdom({
    date: new Date(2026, 7, 10),
    locale: 'ja',
    storage
  });
  assert.equal(ja.id, a.id);
  assert.equal(ja.text, findDailyWisdomText(a.id, 'ja'));
  assert.notEqual(ja.text, a.text);
});
