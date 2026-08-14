/**
 * Growth pack ③ — daily quiet-line quote (local pool + canvas save).
 * Deterministic by local YYYY-MM-DD; does not use soft-schedule / cloud.
 * Pool v2 mixes classic Quiet Line lines with a small insight-spark seed.
 * @see docs/task-briefs/task-growth-content-pack-decision.md
 * @see docs/task-briefs/task-quiet-line-insight-spark.md
 */

import { COPY_POOLS, getLocale, t, tInLocale } from '../locales/i18n.js';
import { getLocalDateKey } from '../utils/localDate.js';
import { stampJourneyLogInsightSparkForDate } from './journeyLogGate.js';
import { DIGITAL_WALLPAPER_STILLS } from './digitalWallpapersCatalog.js';

export const DAILY_ZEN_QUOTE_POOL_KEY = 'DAILY_ZEN_QUOTE';
export const DAILY_ZEN_QUOTE_INSIGHT_POOL_KEY = 'DAILY_ZEN_QUOTE_INSIGHT';

/** Same-day lock for the mixed pool. Do not reuse older keys. */
export const DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY =
  'focus-tiger.daily-zen-quote-pool-v2.v1';

/**
 * @param {Storage | null | undefined} explicit
 * @returns {Storage | null}
 */
function defaultQuoteStorage(explicit) {
  if (explicit !== undefined) return explicit ?? null;
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/**
 * Classic Quiet Line keys + insight-spark seed (production seed only).
 * @param {readonly string[]} [classicKeys]
 * @param {readonly string[]} [insightKeys]
 * @returns {string[]}
 */
export function listMixedDailyZenQuoteKeys(
  classicKeys = COPY_POOLS[DAILY_ZEN_QUOTE_POOL_KEY],
  insightKeys = COPY_POOLS[DAILY_ZEN_QUOTE_INSIGHT_POOL_KEY]
) {
  const classic = Array.isArray(classicKeys) ? [...classicKeys] : [];
  const insight = Array.isArray(insightKeys) ? [...insightKeys] : [];
  return [...classic, ...insight];
}

/**
 * @param {string | null | undefined} key
 * @param {readonly string[]} [insightKeys]
 * @returns {boolean}
 */
export function isInsightZenQuoteKey(
  key,
  insightKeys = COPY_POOLS[DAILY_ZEN_QUOTE_INSIGHT_POOL_KEY]
) {
  return Boolean(
    key && Array.isArray(insightKeys) && insightKeys.includes(key)
  );
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ dateKey: string, key: string, opened: boolean } | null}
 */
export function readDailyZenQuotePoolV2(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    const dateKey = typeof o.dateKey === 'string' ? o.dateKey : '';
    const key = typeof o.key === 'string' ? o.key : '';
    if (!dateKey || !key) return null;
    return { dateKey, key, opened: o.opened === true };
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ dateKey: string, key: string, opened?: boolean }} state
 */
export function writeDailyZenQuotePoolV2(storage, state) {
  if (!storage || !state?.dateKey || !state?.key) return;
  try {
    storage.setItem(
      DAILY_ZEN_QUOTE_POOL_V2_STORAGE_KEY,
      JSON.stringify({
        dateKey: state.dateKey,
        key: state.key,
        opened: state.opened === true
      })
    );
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @param {string} dateKey YYYY-MM-DD
 * @param {readonly string[]} [keys]
 * @returns {string}
 */
export function pickDailyZenQuoteKey(
  dateKey,
  keys = listMixedDailyZenQuoteKeys()
) {
  const list =
    keys && keys.length ? keys : listMixedDailyZenQuoteKeys();
  if (!list?.length) return 'DAILY_ZEN_QUOTE_1';
  const parts = String(dateKey || '').split('-').map((n) => Number(n));
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return list[0];
  }
  const dayIndex = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  const idx = ((dayIndex % list.length) + list.length) % list.length;
  return list[idx];
}

/**
 * Stable-per-day still from the wallpaper/animation gallery (Quiet Line card bg).
 * @param {string} [dateKey]
 * @returns {string}
 */
export function pickDailyZenQuoteBackdropSrc(dateKey) {
  const list = DIGITAL_WALLPAPER_STILLS;
  if (!list.length) return '';
  const parts = String(dateKey || '').split('-').map((n) => Number(n));
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  const dayIndex =
    Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)
      ? Math.floor(Date.UTC(y, m - 1, d) / 86_400_000)
      : 0;
  const stillIdx = ((dayIndex + 3) % list.length + list.length) % list.length;
  return list[stillIdx]?.src || '';
}

/**
 * @param {{
 *   date?: Date,
 *   locale?: string,
 *   storage?: Storage | null,
 *   classicKeys?: readonly string[],
 *   insightKeys?: readonly string[]
 * }} [opts]
 * @returns {{
 *   dateKey: string,
 *   key: string,
 *   text: string,
 *   locale: string,
 *   insightSpark: boolean
 * }}
 */
export function resolveDailyZenQuote(opts = {}) {
  const dateKey = getLocalDateKey(opts.date ?? new Date());
  const mixed = listMixedDailyZenQuoteKeys(opts.classicKeys, opts.insightKeys);
  const storage = defaultQuoteStorage(opts.storage);
  const stored = readDailyZenQuotePoolV2(storage);
  let key;
  if (stored?.dateKey === dateKey && mixed.includes(stored.key)) {
    key = stored.key;
  } else {
    key = pickDailyZenQuoteKey(dateKey, mixed);
    writeDailyZenQuotePoolV2(storage, {
      dateKey,
      key,
      opened: stored?.dateKey === dateKey ? stored.opened : false
    });
  }
  const locale = opts.locale || getLocale();
  // Product quotes are en+ja only; other locales fall back via tInLocale → en.
  const text =
    locale === 'en' || locale === 'ja' ? tInLocale(locale, key) : t(key);
  return {
    dateKey,
    key,
    text,
    locale,
    insightSpark: isInsightZenQuoteKey(key, opts.insightKeys)
  };
}

/**
 * True only after Quiet Line was opened today *and* today’s line is insight-seed.
 * @param {{ date?: Date, storage?: Storage | null, insightKeys?: readonly string[] }} [opts]
 * @returns {boolean}
 */
export function hasOpenedInsightSparkToday(opts = {}) {
  const dateKey = getLocalDateKey(opts.date ?? new Date());
  const stored = readDailyZenQuotePoolV2(defaultQuoteStorage(opts.storage));
  if (!stored || stored.dateKey !== dateKey || stored.opened !== true) {
    return false;
  }
  return isInsightZenQuoteKey(stored.key, opts.insightKeys);
}

/**
 * Quiet Line open = 当场触达. Persist same-day pick; stamp Journey Log if insight.
 * @param {{
 *   date?: Date,
 *   locale?: string,
 *   storage?: Storage | null,
 *   classicKeys?: readonly string[],
 *   insightKeys?: readonly string[]
 * }} [opts]
 * @returns {ReturnType<typeof resolveDailyZenQuote> & { opened: boolean }}
 */
export function noteDailyZenQuoteOpened(opts = {}) {
  const storage = defaultQuoteStorage(opts.storage);
  const resolved = resolveDailyZenQuote({ ...opts, storage });
  writeDailyZenQuotePoolV2(storage, {
    dateKey: resolved.dateKey,
    key: resolved.key,
    opened: true
  });
  if (resolved.insightSpark) {
    stampJourneyLogInsightSparkForDate(storage, resolved.dateKey);
  }
  return { ...resolved, opened: true };
}

/**
 * Wrap text for canvas fillText.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @returns {string[]}
 */
export function wrapCanvasText(ctx, text, maxWidth) {
  const raw = String(text || '').trim();
  if (!raw) return [];
  // CJK / no-space scripts: wrap by grapheme-ish code units.
  if (!/\s/.test(raw)) {
    /** @type {string[]} */
    const lines = [];
    let line = '';
    for (const ch of raw) {
      const next = line + ch;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
  const words = raw.split(/\s+/);
  /** @type {string[]} */
  const lines = [];
  let line = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = `${line} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      lines.push(line);
      line = words[i];
    }
  }
  lines.push(line);
  return lines;
}

/**
 * @param {object} opts
 * @param {string} opts.quoteText
 * @param {string} [opts.title]
 * @param {string} [opts.footer]
 * @param {string} [opts.dateKey]
 * @param {typeof document.createElement} [opts.createElement]
 * @returns {HTMLCanvasElement}
 */
export function renderDailyZenQuoteCanvas(opts) {
  const createElement =
    opts.createElement ||
    (typeof document !== 'undefined'
      ? document.createElement.bind(document)
      : null);
  if (!createElement) {
    throw new Error('renderDailyZenQuoteCanvas requires document');
  }
  const canvas = createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');

  // Soft dusk gradient — calm gift card, not a scoreboard.
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#2a2438');
  grad.addColorStop(0.55, '#3d3348');
  grad.addColorStop(1, '#1e1a28');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,252,245,.08)';
  ctx.fillRect(72, 72, canvas.width - 144, canvas.height - 144);

  ctx.fillStyle = 'rgba(255,236,210,.92)';
  ctx.font = '500 42px "Iowan Old Style", "Palatino Linotype", Palatino, serif';
  ctx.textAlign = 'left';
  ctx.fillText(opts.title || 'A quiet line', 120, 200);

  ctx.fillStyle = 'rgba(255,248,235,.95)';
  ctx.font = '400 56px "Iowan Old Style", "Palatino Linotype", Palatino, serif';
  const lines = wrapCanvasText(ctx, opts.quoteText, canvas.width - 240);
  let y = 360;
  for (const line of lines) {
    ctx.fillText(line, 120, y);
    y += 78;
  }

  ctx.fillStyle = 'rgba(255,236,210,.55)';
  ctx.font = '400 32px system-ui, -apple-system, sans-serif';
  ctx.fillText(opts.footer || 'Focus Tiger · with Yin', 120, canvas.height - 160);
  if (opts.dateKey) {
    ctx.fillText(opts.dateKey, 120, canvas.height - 110);
  }

  return canvas;
}

/**
 * Trigger a PNG download from a canvas (save-image v1; not social share).
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 * @param {{
 *   createElement?: typeof document.createElement,
 *   createObjectURL?: (blob: Blob) => string,
 *   revokeObjectURL?: (url: string) => void,
 *   toBlob?: (canvas: HTMLCanvasElement, type?: string) => Promise<Blob | null>
 * }} [deps]
 * @returns {Promise<boolean>}
 */
export async function downloadCanvasPng(canvas, filename, deps = {}) {
  const createElement =
    deps.createElement ||
    (typeof document !== 'undefined'
      ? document.createElement.bind(document)
      : null);
  if (!createElement) return false;

  const toBlob =
    deps.toBlob ||
    ((c, type = 'image/png') =>
      new Promise((resolve) => {
        if (typeof c.toBlob === 'function') {
          c.toBlob((b) => resolve(b), type);
        } else {
          resolve(null);
        }
      }));

  const blob = await toBlob(canvas, 'image/png');
  if (!blob) {
    // Fallback data URL path for test doubles without toBlob
    const dataUrl =
      typeof canvas.toDataURL === 'function'
        ? canvas.toDataURL('image/png')
        : '';
    if (!dataUrl) return false;
    const a = createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.rel = 'noopener';
    a.click();
    return true;
  }

  const createObjectURL =
    deps.createObjectURL ||
    ((b) =>
      typeof URL !== 'undefined' && URL.createObjectURL
        ? URL.createObjectURL(b)
        : '');
  const revokeObjectURL =
    deps.revokeObjectURL ||
    ((url) => {
      if (typeof URL !== 'undefined' && URL.revokeObjectURL) {
        URL.revokeObjectURL(url);
      }
    });

  const url = createObjectURL(blob);
  if (!url) return false;
  const a = createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.click();
  revokeObjectURL(url);
  return true;
}

/**
 * @param {{ date?: Date, locale?: string } & Parameters<typeof downloadCanvasPng>[2]} [opts]
 * @returns {Promise<{ ok: boolean, filename: string, key: string }>}
 */
export async function saveDailyZenQuoteImage(opts = {}) {
  const resolved = resolveDailyZenQuote(opts);
  const title = t('DAILY_ZEN_QUOTE_CARD_TITLE');
  const footer = t('DAILY_ZEN_QUOTE_IMAGE_FOOTER');
  const canvas = renderDailyZenQuoteCanvas({
    quoteText: resolved.text,
    title,
    footer,
    dateKey: resolved.dateKey,
    createElement: opts.createElement
  });
  const filename = `focus-tiger-quiet-line-${resolved.dateKey}.png`;
  const ok = await downloadCanvasPng(canvas, filename, opts);
  return { ok, filename, key: resolved.key };
}
