/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Growth pack ③ — daily quiet-line quote (local pool + canvas save).
 * Deterministic by local YYYY-MM-DD; does not use soft-schedule / cloud.
 * Pool v2 mixes classic Quiet Line lines with a small insight-spark seed.
 * Save image = 4:5 postcard (gallery still above, quote on warm paper).
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
 * Postcard footer date. English uses US month-day-year, not ISO YYYY-MM-DD.
 * Filename / storage still use `dateKey`.
 * @param {string} dateKey YYYY-MM-DD
 * @param {string} [localeId]
 * @returns {string}
 */
export function formatQuietLineFooterDate(dateKey, localeId = getLocale()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ''));
  if (!m) return String(dateKey || '');
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const dt = new Date(year, month - 1, day);
  if (Number.isNaN(dt.getTime())) return String(dateKey);
  const loc =
    localeId === 'ja' ? 'ja-JP' : localeId === 'zh' ? 'zh-CN' : 'en-US';
  try {
    return new Intl.DateTimeFormat(loc, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dt);
  } catch {
    return `${month}/${day}/${year}`;
  }
}

/** 4:5 keepsake — still above, quote on warm paper (not a dialog screenshot). */
export const QUIET_LINE_CARD = Object.freeze({
  width: 1080,
  height: 1350,
  imageBandRatio: 0.58,
  paper: '#f4eee3',
  ink: '#3d2e22',
  inkMuted: 'rgba(61, 46, 34, 0.62)',
  titleInk: '#5c4330',
  focusX: 0.5,
  focusY: 0.28,
  padX: 88,
  seamFade: 72
});

/**
 * CSS object-fit:cover source crop. focusX/Y match object-position (0–1).
 * @param {number} srcW
 * @param {number} srcH
 * @param {number} destW
 * @param {number} destH
 * @param {number} [focusX]
 * @param {number} [focusY]
 * @returns {{ sx: number, sy: number, sw: number, sh: number }}
 */
export function coverSourceRect(
  srcW,
  srcH,
  destW,
  destH,
  focusX = QUIET_LINE_CARD.focusX,
  focusY = QUIET_LINE_CARD.focusY
) {
  const sw0 = Number(srcW) || 0;
  const sh0 = Number(srcH) || 0;
  const dw = Number(destW) || 0;
  const dh = Number(destH) || 0;
  if (sw0 <= 0 || sh0 <= 0 || dw <= 0 || dh <= 0) {
    return { sx: 0, sy: 0, sw: Math.max(1, sw0), sh: Math.max(1, sh0) };
  }
  const scale = Math.max(dw / sw0, dh / sh0);
  const scaledW = sw0 * scale;
  const scaledH = sh0 * scale;
  const fx = Math.min(1, Math.max(0, Number(focusX) || 0));
  const fy = Math.min(1, Math.max(0, Number(focusY) || 0));
  const sx = Math.max(0, -(dw - scaledW) * fx / scale);
  const sy = Math.max(0, -(dh - scaledH) * fy / scale);
  const sw = Math.min(sw0 - sx, dw / scale);
  const sh = Math.min(sh0 - sy, dh / scale);
  return { sx, sy, sw: Math.max(1, sw), sh: Math.max(1, sh) };
}

/**
 * @param {string} src
 * @param {{
 *   loadImage?: (src: string) => Promise<CanvasImageSource | null>,
 *   Image?: typeof Image
 * }} [deps]
 * @returns {Promise<CanvasImageSource | null>}
 */
export async function loadQuietLineBackdropImage(src, deps = {}) {
  if (!src) return null;
  if (typeof deps.loadImage === 'function') {
    try {
      return (await deps.loadImage(src)) || null;
    } catch {
      return null;
    }
  }
  const ImageCtor =
    deps.Image || (typeof Image !== 'undefined' ? Image : null);
  if (!ImageCtor) return null;
  return new Promise((resolve) => {
    const img = new ImageCtor();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
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
 * @param {string} [opts.locale]
 * @param {CanvasImageSource | null} [opts.backdropImage]
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
  canvas.width = QUIET_LINE_CARD.width;
  canvas.height = QUIET_LINE_CARD.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');

  const imageBandH = Math.round(
    canvas.height * QUIET_LINE_CARD.imageBandRatio
  );

  ctx.fillStyle = QUIET_LINE_CARD.paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = opts.backdropImage;
  const srcW =
    Number(img && img.naturalWidth) || Number(img && img.width) || 0;
  const srcH =
    Number(img && img.naturalHeight) || Number(img && img.height) || 0;
  if (img && srcW > 0 && srcH > 0 && typeof ctx.drawImage === 'function') {
    const crop = coverSourceRect(
      srcW,
      srcH,
      canvas.width,
      imageBandH,
      QUIET_LINE_CARD.focusX,
      QUIET_LINE_CARD.focusY
    );
    ctx.drawImage(
      img,
      crop.sx,
      crop.sy,
      crop.sw,
      crop.sh,
      0,
      0,
      canvas.width,
      imageBandH
    );
  } else {
    const dusk = ctx.createLinearGradient(0, 0, 0, imageBandH);
    dusk.addColorStop(0, '#2a2438');
    dusk.addColorStop(1, '#3d3348');
    ctx.fillStyle = dusk;
    ctx.fillRect(0, 0, canvas.width, imageBandH);
  }

  const seam = QUIET_LINE_CARD.seamFade;
  const fade = ctx.createLinearGradient(
    0,
    imageBandH - seam,
    0,
    imageBandH
  );
  fade.addColorStop(0, 'rgba(244, 238, 227, 0)');
  fade.addColorStop(1, QUIET_LINE_CARD.paper);
  ctx.fillStyle = fade;
  ctx.fillRect(0, imageBandH - seam, canvas.width, seam);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  const padX = QUIET_LINE_CARD.padX;
  const textTop = imageBandH + 56;
  ctx.fillStyle = QUIET_LINE_CARD.titleInk;
  ctx.font = '500 36px "Iowan Old Style", "Palatino Linotype", Palatino, serif';
  ctx.fillText(opts.title || 'A quiet line', padX, textTop);

  ctx.fillStyle = QUIET_LINE_CARD.ink;
  ctx.font = '400 48px "Iowan Old Style", "Palatino Linotype", Palatino, serif';
  const lines = wrapCanvasText(ctx, opts.quoteText, canvas.width - padX * 2);
  let y = textTop + 72;
  const lineH = 64;
  const footerY = canvas.height - 110;
  const quoteMaxY = footerY - 90;
  for (const line of lines) {
    if (y > quoteMaxY) break;
    ctx.fillText(line, padX, y);
    y += lineH;
  }

  ctx.fillStyle = QUIET_LINE_CARD.inkMuted;
  ctx.font = '400 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(opts.footer || 'Focus Tiger · with Yin', padX, footerY);
  if (opts.dateKey) {
    ctx.fillText(
      formatQuietLineFooterDate(opts.dateKey, opts.locale),
      padX,
      footerY + 42
    );
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
 * @param {{
 *   date?: Date,
 *   locale?: string,
 *   backdropImage?: CanvasImageSource | null,
 *   loadImage?: (src: string) => Promise<CanvasImageSource | null>,
 *   Image?: typeof Image
 * } & Parameters<typeof downloadCanvasPng>[2]} [opts]
 * @returns {Promise<{
 *   ok: boolean,
 *   filename: string,
 *   key: string,
 *   usedBackdrop: boolean
 * }>}
 */
export async function saveDailyZenQuoteImage(opts = {}) {
  const resolved = resolveDailyZenQuote(opts);
  const title = t('DAILY_ZEN_QUOTE_CARD_TITLE');
  const footer = t('DAILY_ZEN_QUOTE_IMAGE_FOOTER');
  const backdropSrc = pickDailyZenQuoteBackdropSrc(resolved.dateKey);
  let image = opts.backdropImage || null;
  if (!image && backdropSrc) {
    image = await loadQuietLineBackdropImage(backdropSrc, opts);
  }
  const canvas = renderDailyZenQuoteCanvas({
    quoteText: resolved.text,
    title,
    footer,
    dateKey: resolved.dateKey,
    locale: resolved.locale,
    backdropImage: image,
    createElement: opts.createElement
  });
  const filename = `focus-tiger-quiet-line-${resolved.dateKey}.png`;
  const ok = await downloadCanvasPng(canvas, filename, opts);
  return { ok, filename, key: resolved.key, usedBackdrop: Boolean(image) };
}
