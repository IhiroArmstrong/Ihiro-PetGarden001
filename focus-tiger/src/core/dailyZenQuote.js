/**
 * Growth pack ③ — daily quiet-line quote (local pool + canvas save).
 * Deterministic by local YYYY-MM-DD; does not use soft-schedule / cloud.
 * @see docs/task-briefs/task-growth-content-pack-decision.md
 */

import { COPY_POOLS, getLocale, t, tInLocale } from '../locales/i18n.js';
import { getLocalDateKey } from '../utils/localDate.js';

export const DAILY_ZEN_QUOTE_POOL_KEY = 'DAILY_ZEN_QUOTE';

/**
 * @param {string} dateKey YYYY-MM-DD
 * @param {readonly string[]} [keys]
 * @returns {string}
 */
export function pickDailyZenQuoteKey(
  dateKey,
  keys = COPY_POOLS[DAILY_ZEN_QUOTE_POOL_KEY]
) {
  const list = keys && keys.length ? keys : COPY_POOLS[DAILY_ZEN_QUOTE_POOL_KEY];
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
 * @param {{ date?: Date, locale?: string }} [opts]
 * @returns {{ dateKey: string, key: string, text: string, locale: string }}
 */
export function resolveDailyZenQuote(opts = {}) {
  const dateKey = getLocalDateKey(opts.date ?? new Date());
  const key = pickDailyZenQuoteKey(dateKey);
  const locale = opts.locale || getLocale();
  // Product quotes are en+ja only; other locales fall back via tInLocale → en.
  const text =
    locale === 'en' || locale === 'ja' ? tInLocale(locale, key) : t(key);
  return { dateKey, key, text, locale };
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
