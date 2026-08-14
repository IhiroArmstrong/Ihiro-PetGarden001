import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  pickDailyZenQuoteKey,
  resolveDailyZenQuote,
  wrapCanvasText,
  downloadCanvasPng,
  saveDailyZenQuoteImage,
  listMixedDailyZenQuoteKeys,
  isInsightZenQuoteKey,
  noteDailyZenQuoteOpened,
  hasOpenedInsightSparkToday,
  DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY,
  readDailyZenQuotePoolV2
} from './dailyZenQuote.js';
import { COPY_POOLS, setLocale } from '../locales/i18n.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  appendJourneyLogEntry,
  readJourneyLog
} from './journeyLogGate.js';

const here = dirname(fileURLToPath(import.meta.url));

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
    }
  };
}

describe('dailyZenQuote', () => {
  it('picks deterministically by local date key', () => {
    const keys = COPY_POOLS.DAILY_ZEN_QUOTE;
    const a = pickDailyZenQuoteKey('2026-08-06', keys);
    const b = pickDailyZenQuoteKey('2026-08-06', keys);
    assert.equal(a, b);
    assert.ok(keys.includes(a));
    // Different day can differ (not guaranteed for all pairs; check span)
    const set = new Set(
      ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07'].map(
        (d) => pickDailyZenQuoteKey(d, keys)
      )
    );
    assert.ok(set.size >= 2);
  });

  it('resolveDailyZenQuote returns en/ja text for ready locales', () => {
    setLocale('en', { persist: false });
    const en = resolveDailyZenQuote({
      date: new Date(2026, 7, 6),
      locale: 'en'
    });
    assert.equal(en.dateKey, '2026-08-06');
    assert.match(en.text, /./);
    assert.notEqual(en.text, en.key);

    setLocale('ja', { persist: false });
    const ja = resolveDailyZenQuote({
      date: new Date(2026, 7, 6),
      locale: 'ja'
    });
    assert.equal(ja.key, en.key);
    assert.match(ja.text, /./);
    assert.notEqual(ja.text, en.text);
    setLocale('en', { persist: false });
  });

  it('wrapCanvasText wraps long English and CJK', () => {
    const ctx = {
      measureText: (s) => ({ width: String(s).length * 10 })
    };
    const en = wrapCanvasText(ctx, 'one two three four five', 35);
    assert.ok(en.length >= 2);
    const ja = wrapCanvasText(ctx, '静かな一行は急がない', 40);
    assert.ok(ja.length >= 2);
  });

  it('downloadCanvasPng clicks an anchor with download name', async () => {
    /** @type {{ download?: string, href?: string, clickCount: number }} */
    const anchor = { clickCount: 0 };
    const fakeCanvas = {
      toBlob: (cb) => cb(new Blob(['png'], { type: 'image/png' }))
    };
    const ok = await downloadCanvasPng(
      /** @type {any} */ (fakeCanvas),
      'focus-tiger-quiet-line-2026-08-06.png',
      {
        createElement: () => {
          return {
            set href(v) {
              anchor.href = v;
            },
            get href() {
              return anchor.href;
            },
            set download(v) {
              anchor.download = v;
            },
            get download() {
              return anchor.download;
            },
            set rel(_v) {},
            click() {
              anchor.clickCount += 1;
            }
          };
        },
        createObjectURL: () => 'blob:test',
        revokeObjectURL: () => {}
      }
    );
    assert.equal(ok, true);
    assert.equal(anchor.clickCount, 1);
    assert.equal(anchor.download, 'focus-tiger-quiet-line-2026-08-06.png');
  });

  it('saveDailyZenQuoteImage wires resolve + download', async () => {
    let clicked = 0;
    const result = await saveDailyZenQuoteImage({
      date: new Date(2026, 7, 6),
      locale: 'en',
      createElement: (tag) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => ({
              createLinearGradient: () => ({ addColorStop() {} }),
              fillRect() {},
              fillText() {},
              measureText: () => ({ width: 10 }),
              fillStyle: '',
              font: '',
              textAlign: ''
            }),
            toBlob: (cb) => cb(new Blob(['x'], { type: 'image/png' }))
          };
        }
        return {
          set href(_v) {},
          set download(_v) {},
          set rel(_v) {},
          click() {
            clicked += 1;
          }
        };
      },
      createObjectURL: () => 'blob:x',
      revokeObjectURL: () => {}
    });
    assert.equal(result.ok, true);
    assert.equal(result.filename, 'focus-tiger-quiet-line-2026-08-06.png');
    assert.ok(result.key.startsWith('DAILY_ZEN_QUOTE_'));
    assert.equal(clicked, 1);
  });

  it('mixes classic and insight pools without throwing', () => {
    const mixed = listMixedDailyZenQuoteKeys();
    assert.equal(COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT.length, 10);
    assert.ok(mixed.length > COPY_POOLS.DAILY_ZEN_QUOTE.length);
    assert.equal(
      mixed.length,
      COPY_POOLS.DAILY_ZEN_QUOTE.length + COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT.length
    );
    assert.ok(COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT.includes('DAILY_ZEN_QUOTE_INSIGHT_10'));
    assert.equal(
      COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT.includes('DAILY_ZEN_QUOTE_INSIGHT_11'),
      false
    );
    const empty = listMixedDailyZenQuoteKeys([], []);
    assert.equal(empty.length, 0);
    const fromEmptyArg = pickDailyZenQuoteKey('2026-08-14', []);
    assert.ok(listMixedDailyZenQuoteKeys().includes(fromEmptyArg));
    for (const d of [
      '2026-08-01',
      '2026-08-14',
      '2026-08-31',
      '2026-09-01'
    ]) {
      const key = pickDailyZenQuoteKey(d, mixed);
      assert.ok(mixed.includes(key));
    }
  });

  it('same day stays stable across mixed-pool resolves when v2 storage is set', () => {
    const storage = createMapStorage();
    const date = new Date(2026, 7, 14);
    const a = resolveDailyZenQuote({ date, locale: 'en', storage });
    const b = resolveDailyZenQuote({ date, locale: 'en', storage });
    assert.equal(a.key, b.key);
    assert.equal(a.dateKey, '2026-08-14');
    assert.equal(typeof a.insightSpark, 'boolean');
    assert.equal(a.insightSpark, isInsightZenQuoteKey(a.key));
    const stored = readDailyZenQuotePoolV2(storage);
    assert.equal(stored?.dateKey, '2026-08-14');
    assert.equal(stored?.key, a.key);
    assert.equal(stored?.opened, false);
  });

  it('corrupt v2 storage degrades to a mixed pick without throwing', () => {
    const storage = createMapStorage({
      [DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY]: '{nope'
    });
    const resolved = resolveDailyZenQuote({
      date: new Date(2026, 7, 14),
      locale: 'en',
      storage
    });
    assert.match(resolved.key, /^DAILY_ZEN_QUOTE/);
    assert.equal(typeof resolved.insightSpark, 'boolean');
  });

  it('over many days the mixed pool yields both classic and insight keys', () => {
    const mixed = listMixedDailyZenQuoteKeys();
    const kinds = new Set();
    for (let i = 0; i < 60; i += 1) {
      const dt = new Date(Date.UTC(2026, 6, 1 + i));
      const key = pickDailyZenQuoteKey(dt.toISOString().slice(0, 10), mixed);
      kinds.add(isInsightZenQuoteKey(key) ? 'insight' : 'classic');
    }
    assert.equal(kinds.has('classic'), true);
    assert.equal(kinds.has('insight'), true);
  });

  it('opening insight content stamps Journey Log; classic open does not', () => {
    const storage = createMapStorage();
    const localDay = new Date(2026, 7, 14, 12, 0, 0);
    appendJourneyLogEntry(storage, {
      at: localDay.toISOString(),
      minutes: 20,
      arrive: true,
      reflect: true
    });
    storage.setItem(
      DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY,
      JSON.stringify({
        dateKey: '2026-08-14',
        key: 'DAILY_ZEN_QUOTE_INSIGHT_1',
        opened: false
      })
    );
    const opened = noteDailyZenQuoteOpened({
      date: localDay,
      locale: 'en',
      storage
    });
    assert.equal(opened.key, 'DAILY_ZEN_QUOTE_INSIGHT_1');
    assert.equal(opened.insightSpark, true);
    assert.equal(opened.opened, true);
    assert.equal(hasOpenedInsightSparkToday({ date: new Date(2026, 7, 14), storage }), true);
    assert.equal(readJourneyLog(storage).entries[0].insightSpark, true);

    const classicStorage = createMapStorage();
    appendJourneyLogEntry(classicStorage, {
      at: localDay.toISOString(),
      minutes: 20,
      arrive: true,
      reflect: true
    });
    classicStorage.setItem(
      DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY,
      JSON.stringify({
        dateKey: '2026-08-14',
        key: 'DAILY_ZEN_QUOTE_1',
        opened: false
      })
    );
    const classic = noteDailyZenQuoteOpened({
      date: new Date(2026, 7, 14),
      locale: 'en',
      storage: classicStorage
    });
    assert.equal(classic.insightSpark, false);
    assert.equal(
      hasOpenedInsightSparkToday({
        date: new Date(2026, 7, 14),
        storage: classicStorage
      }),
      false
    );
    assert.equal(readJourneyLog(classicStorage).entries[0].insightSpark, undefined);
  });

  it('must not import tip / sanctuary / practice badges', () => {
    const src = readFileSync(join(here, 'dailyZenQuote.js'), 'utf8');
    assert.equal(/tipJarGate|sanctuaryEntitlement|practiceBadgeAward/.test(src), false);
  });
});
