import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  pickDailyZenQuoteKey,
  resolveDailyZenQuote,
  wrapCanvasText,
  downloadCanvasPng,
  saveDailyZenQuoteImage
} from './dailyZenQuote.js';
import { COPY_POOLS, setLocale } from '../locales/i18n.js';

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
});
