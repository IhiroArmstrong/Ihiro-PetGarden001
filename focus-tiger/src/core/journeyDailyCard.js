/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Journey row → PNG daily card. Free. Not Daily Wisdom. Not a social deep link.
 * Same-day Quiet Line text wins; otherwise a short stable line for that date.
 */

import { downloadCanvasPng, readDailyZenQuotePoolV2 } from './dailyZenQuote.js';

export const JOURNEY_DAILY_CARD_STILL =
  '/ui/tiger-badge-silver-gold-rim-sparkle.png';

/** Independent of the Daily Wisdom pool. */
export const JOURNEY_DAILY_CARD_FALLBACK_LINES = Object.freeze([
  'A quiet day, kept.',
  'Minutes sat. Nothing extra.',
  'This day stayed with Yin.',
  'One sitting, written down.'
]);

/**
 * @param {{ dateKey?: string, sameDayQuietLine?: string }} input
 */
export function quoteForJourneyDailyCard({ dateKey, sameDayQuietLine } = {}) {
  const line = typeof sameDayQuietLine === 'string' ? sameDayQuietLine.trim() : '';
  if (line) return line;
  const lines = JOURNEY_DAILY_CARD_FALLBACK_LINES;
  const key = String(dateKey || '');
  let n = 0;
  for (let i = 0; i < key.length; i += 1) n = (n + key.charCodeAt(i)) % lines.length;
  return lines[n];
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} dateKey
 * @param {(key: string) => string} translate
 */
export function sameDayQuietLineText(storage, dateKey, translate) {
  const pool = readDailyZenQuotePoolV2(storage);
  if (!pool || pool.dateKey !== dateKey || !pool.key) return '';
  const text = translate(pool.key);
  if (!text || text === pool.key) return '';
  return text;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{
 *   dateKey: string,
 *   minutes: number,
 *   quote: string,
 *   image?: CanvasImageSource | null
 * }} card
 */
export function paintJourneyDailyCard(ctx, card) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.fillStyle = '#e8dfd2';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let textTop = 180;
  if (card.image) {
    const iw = card.image.naturalWidth || card.image.width || 420;
    const ih = card.image.naturalHeight || card.image.height || 420;
    const maxW = Math.min(w - 160, 360);
    const maxH = 340;
    const scale = Math.min(maxW / iw, maxH / ih);
    const dw = Math.max(1, iw * scale);
    const dh = Math.max(1, ih * scale);
    const y = 64;
    ctx.drawImage(card.image, (w - dw) / 2, y, dw, dh);
    textTop = y + dh + 64;
  }
  const cx = w / 2;
  ctx.fillStyle = '#2c1f14';
  ctx.font = '600 42px system-ui, sans-serif';
  ctx.fillText(String(card.dateKey || ''), cx, textTop);
  ctx.font = '400 32px system-ui, sans-serif';
  ctx.fillText(`${Number(card.minutes) || 0} min`, cx, textTop + 58);
  ctx.font = '400 28px "Iowan Old Style", Palatino, serif';
  const quote = String(card.quote || '');
  const max = w - 140;
  let line = '';
  let y = textTop + 128;
  for (const word of quote.split(/\s+/)) {
    if (!word) continue;
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      ctx.fillText(line, cx, y);
      y += 40;
      line = word;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, cx, y);
  ctx.font = '400 22px system-ui, sans-serif';
  ctx.fillText('Focus Tiger', cx, h - 70);
  ctx.textAlign = 'left';
}

/**
 * @param {{
 *   dateKey: string,
 *   minutes: number,
 *   quote: string,
 *   image?: CanvasImageSource | null,
 *   createCanvas?: () => HTMLCanvasElement,
 *   download?: typeof downloadCanvasPng
 * }} opts
 */
/**
 * @param {string} src
 * @returns {Promise<HTMLImageElement | null>}
 */
export function loadDailyCardStill(src) {
  if (typeof Image === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function saveJourneyDailyCard(opts) {
  const createCanvas =
    opts.createCanvas ||
    (typeof document !== 'undefined'
      ? () => document.createElement('canvas')
      : null);
  if (!createCanvas) return false;
  const canvas = createCanvas();
  canvas.width = 720;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  paintJourneyDailyCard(ctx, opts);
  const filename = journeyDailyCardFilename(opts);
  const download = opts.download || downloadCanvasPng;
  return download(canvas, filename);
}

/**
 * Same calendar day can hold more than one sitting. The clock stamp keeps
 * the second download from replacing the first file.
 * @param {{ dateKey?: string, at?: string, kind?: string }} opts
 */
export function journeyDailyCardFilename(opts = {}) {
  const day = String(opts.dateKey || 'day').replace(/[^\d-]/g, '') || 'day';
  const kind = String(opts.kind || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
  const when = opts.at ? new Date(opts.at) : new Date();
  const d = Number.isNaN(when.getTime()) ? new Date() : when;
  const pad = (n, width = 2) => String(n).padStart(width, '0');
  const stamp = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${pad(d.getMilliseconds(), 3)}`;
  return `focus-tiger-daily-card-${day}${kind ? `-${kind}` : ''}-${stamp}.png`;
}
