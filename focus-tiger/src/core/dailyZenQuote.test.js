import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  pickDailyZenQuoteKey,
  pickDailyZenQuoteBackdropSrc,
  resolveDailyZenQuote,
  wrapCanvasText,
  downloadCanvasPng,
  saveDailyZenQuoteImage,
  coverSourceRect,
  QUIET_LINE_CARD,
  formatQuietLineFooterDate,
  renderDailyZenQuoteCanvas,
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
import { DIGITAL_WALLPAPER_STILLS } from './digitalWallpapersCatalog.js';

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
              drawImage() {},
              measureText: () => ({ width: 10 }),
              fillStyle: '',
              font: '',
              textAlign: '',
              textBaseline: ''
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
    assert.equal(result.usedBackdrop, false);
  });

  it('coverSourceRect crops 1056×864 stills into the postcard photo band', () => {
    const destW = QUIET_LINE_CARD.width;
    const destH = Math.round(
      QUIET_LINE_CARD.height * QUIET_LINE_CARD.imageBandRatio
    );
    const crop = coverSourceRect(1056, 864, destW, destH);
    assert.ok(crop.sw > 0 && crop.sh > 0);
    assert.ok(crop.sx + crop.sw <= 1056 + 1e-6);
    assert.ok(crop.sy + crop.sh <= 864 + 1e-6);
    assert.ok(crop.sy > 0);
    assert.ok(crop.sy < 864 * 0.2);
  });

  it('renderDailyZenQuoteCanvas draws the still in the upper band', () => {
    /** @type {unknown[]} */
    const draws = [];
    const texts = [];
    const canvas = renderDailyZenQuoteCanvas({
      quoteText:
        'The question of doing it right is also just a sound passing through.',
      title: 'A quiet line for today',
      footer: 'Focus Tiger · with Yin',
      dateKey: '2026-08-15',
      locale: 'en',
      backdropImage: { width: 1056, height: 864 },
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({
          createLinearGradient: () => ({ addColorStop() {} }),
          fillRect() {},
          fillText(text) {
            texts.push(String(text));
          },
          drawImage(...args) {
            draws.push(args);
          },
          measureText: (s) => ({ width: String(s).length * 18 }),
          fillStyle: '',
          font: '',
          textAlign: '',
          textBaseline: ''
        })
      })
    });
    assert.equal(canvas.width, QUIET_LINE_CARD.width);
    assert.equal(canvas.height, QUIET_LINE_CARD.height);
    assert.equal(draws.length, 1);
    const bandH = Math.round(
      QUIET_LINE_CARD.height * QUIET_LINE_CARD.imageBandRatio
    );
    assert.equal(draws[0][5], 0);
    assert.equal(draws[0][6], 0);
    assert.equal(draws[0][7], QUIET_LINE_CARD.width);
    assert.equal(draws[0][8], bandH);
    assert.ok(texts.includes('A quiet line for today'));
    assert.ok(texts.includes('Focus Tiger · with Yin'));
    assert.ok(texts.includes('August 15, 2026'));
    assert.equal(
      texts.includes('2026-08-15'),
      false
    );
    assert.equal(
      texts.some((t) => t.includes('Not now') || t.includes('Save image')),
      false
    );
  });

  it('renderDailyZenQuoteCanvas prefers naturalWidth over CSS box size', () => {
    /** @type {unknown[]} */
    const draws = [];
    renderDailyZenQuoteCanvas({
      quoteText: 'One breath is already a return.',
      backdropImage: {
        width: 360,
        height: 220,
        naturalWidth: 1056,
        naturalHeight: 864
      },
      createElement: () => ({
        width: 0,
        height: 0,
        getContext: () => ({
          createLinearGradient: () => ({ addColorStop() {} }),
          fillRect() {},
          fillText() {},
          drawImage(...args) {
            draws.push(args);
          },
          measureText: () => ({ width: 10 }),
          fillStyle: '',
          font: '',
          textAlign: '',
          textBaseline: ''
        })
      })
    });
    assert.equal(draws.length, 1);
    const crop = coverSourceRect(
      1056,
      864,
      QUIET_LINE_CARD.width,
      Math.round(QUIET_LINE_CARD.height * QUIET_LINE_CARD.imageBandRatio)
    );
    assert.equal(draws[0][1], crop.sx);
    assert.equal(draws[0][2], crop.sy);
    assert.equal(draws[0][3], crop.sw);
    assert.equal(draws[0][4], crop.sh);
  });

  it('saveDailyZenQuoteImage uses loaded still and still downloads if load fails', async () => {
    let drawCount = 0;
    const makeCtx = () => ({
      createLinearGradient: () => ({ addColorStop() {} }),
      fillRect() {},
      fillText() {},
      drawImage() {
        drawCount += 1;
      },
      measureText: () => ({ width: 10 }),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: ''
    });
    const makeCreateElement = () => (tag) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => makeCtx(),
          toBlob: (cb) => cb(new Blob(['x'], { type: 'image/png' }))
        };
      }
      return {
        set href(_v) {},
        set download(_v) {},
        set rel(_v) {},
        click() {}
      };
    };
    const withStill = await saveDailyZenQuoteImage({
      date: new Date(2026, 7, 15),
      locale: 'en',
      createElement: makeCreateElement(),
      createObjectURL: () => 'blob:x',
      revokeObjectURL: () => {},
      loadImage: async (src) => {
        assert.match(src, /\/sprites\/tiger-cub\//);
        return { width: 1056, height: 864 };
      }
    });
    assert.equal(withStill.ok, true);
    assert.equal(withStill.usedBackdrop, true);
    assert.equal(drawCount, 1);

    drawCount = 0;
    const failed = await saveDailyZenQuoteImage({
      date: new Date(2026, 7, 15),
      locale: 'en',
      createElement: makeCreateElement(),
      createObjectURL: () => 'blob:x',
      revokeObjectURL: () => {},
      loadImage: async () => {
        throw new Error('offline');
      }
    });
    assert.equal(failed.ok, true);
    assert.equal(failed.usedBackdrop, false);
    assert.equal(drawCount, 0);
  });

  it('pickDailyZenQuoteBackdropSrc is stable per date and from the wallpaper gallery', () => {
    const a = pickDailyZenQuoteBackdropSrc('2026-08-13');
    const b = pickDailyZenQuoteBackdropSrc('2026-08-13');
    assert.equal(a, b);
    assert.ok(DIGITAL_WALLPAPER_STILLS.some((s) => s.src === a));
    const c = pickDailyZenQuoteBackdropSrc('2026-08-14');
    assert.ok(DIGITAL_WALLPAPER_STILLS.some((s) => s.src === c));
  });

  it('mixes classic and insight pools without throwing', () => {
    const mixed = listMixedDailyZenQuoteKeys();
    assert.equal(COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT.length, 14);
    assert.ok(mixed.length > COPY_POOLS.DAILY_ZEN_QUOTE.length);
    assert.equal(
      mixed.length,
      COPY_POOLS.DAILY_ZEN_QUOTE.length + COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT.length
    );
    assert.ok(COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT.includes('DAILY_ZEN_QUOTE_INSIGHT_14'));
    assert.equal(
      COPY_POOLS.DAILY_ZEN_QUOTE_INSIGHT.includes('DAILY_ZEN_QUOTE_INSIGHT_15'),
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

  it('formatQuietLineFooterDate uses US month-day-year for English', () => {
    assert.equal(
      formatQuietLineFooterDate('2026-08-16', 'en'),
      'August 16, 2026'
    );
    assert.equal(
      formatQuietLineFooterDate('2026-08-16', 'en-US'),
      'August 16, 2026'
    );
    assert.match(formatQuietLineFooterDate('2026-08-16', 'ja'), /8.*16.*2026|2026.*8.*16/);
    assert.equal(formatQuietLineFooterDate('not-a-date', 'en'), 'not-a-date');
  });

  it('must not import tip / sanctuary / practice badges', () => {
    const src = readFileSync(join(here, 'dailyZenQuote.js'), 'utf8');
    assert.equal(/tipJarGate|sanctuaryEntitlement|practiceBadgeAward/.test(src), false);
  });
});
