/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Journey row → PNG daily card. Free. Not Daily Wisdom. Not a social deep link.
 * Same-day Quiet Line text wins; otherwise a short stable line for that date.
 */

import { downloadCanvasPng, readDailyZenQuotePoolV2 } from './dailyZenQuote.js';

export const JOURNEY_DAILY_CARD_STILL =
  '/sprites/tiger-cub/monk-robe-default/idle-breathing/frame_024.png';

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
  if (card.image) {
    const size = Math.min(w - 120, 420);
    ctx.drawImage(card.image, (w - size) / 2, 80, size, size);
  }
  ctx.fillStyle = '#2c1f14';
  ctx.font = '600 42px system-ui, sans-serif';
  ctx.fillText(String(card.dateKey || ''), 60, card.image ? 560 : 180);
  ctx.font = '400 32px system-ui, sans-serif';
  ctx.fillText(`${Number(card.minutes) || 0} min`, 60, card.image ? 620 : 240);
  ctx.font = '400 28px "Iowan Old Style", Palatino, serif';
  const quote = String(card.quote || '');
  const max = w - 120;
  let line = '';
  let y = card.image ? 700 : 340;
  for (const word of quote.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max) {
      ctx.fillText(line, 60, y);
      y += 40;
      line = word;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, 60, y);
  ctx.font = '400 22px system-ui, sans-serif';
  ctx.fillText('Focus Tiger', 60, h - 70);
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
  const filename = `focus-tiger-daily-card-${opts.dateKey || 'day'}.png`;
  const download = opts.download || downloadCanvasPng;
  return download(canvas, filename);
}
