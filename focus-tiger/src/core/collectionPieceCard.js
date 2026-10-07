/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Owned Yin's Collections piece → vertical PNG.
 * Proof of sitting, not a shop poster and not a social deep link.
 * A missing acquiredOn day stays missing — never filled with today.
 */

import { getLocale, t as translate } from '../locales/i18n.js';
import { resolveBrandYinWaySeal } from './brandYinWaySeal.js';
import {
  downloadCanvasPng,
  formatQuietLineFooterDate,
  wrapCanvasText
} from './dailyZenQuote.js';

export const COLLECTION_PIECE_CARD = Object.freeze({
  width: 1080,
  height: 1350,
  paper: '#f4eee3',
  ink: '#2c1f14',
  inkMuted: 'rgba(92,67,48,0.88)',
  padX: 88
});

/**
 * @param {string | null | undefined} acquiredOn
 * @returns {string}
 */
export function collectionPieceAcquiredOn(acquiredOn) {
  const day = typeof acquiredOn === 'string' ? acquiredOn : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : '';
}

/**
 * @param {{
 *   name?: string,
 *   lifetimeMinutes?: number,
 *   acquiredOn?: string | null,
 *   locale?: string,
 *   t?: (key: string) => string
 * }} input
 */
export function collectionPieceCardLines(input = {}) {
  const read = input.t || translate;
  const minutes = Math.max(0, Math.floor(Number(input.lifetimeMinutes) || 0));
  const day = collectionPieceAcquiredOn(input.acquiredOn);
  const n = String(minutes);
  return {
    name: String(input.name || '').trim(),
    dateLine: day
      ? formatQuietLineFooterDate(day, input.locale || getLocale())
      : read('YIN_COIN_PIECE_CARD_KEPT'),
    minutesLine: read('YIN_COIN_PIECE_CARD_MINUTES').replaceAll('{n}', n),
    sentence: read('YIN_COIN_PIECE_CARD_LINE').replaceAll('{n}', n),
    hasCalendarDate: Boolean(day),
    minutes
  };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{
 *   name: string,
 *   dateLine: string,
 *   minutesLine: string,
 *   sentence: string,
 *   footer?: string,
 *   image?: CanvasImageSource | null
 * }} card
 */
export function paintCollectionPieceCard(ctx, card) {
  const { width, height, paper, ink, inkMuted, padX } = COLLECTION_PIECE_CARD;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  if (card.image) {
    const size = 520;
    ctx.drawImage(card.image, (width - size) / 2, 96, size, size);
  }
  const textTop = card.image ? 680 : 180;
  ctx.fillStyle = ink;
  ctx.font = '600 48px "Iowan Old Style", Palatino, serif';
  const nameLines = wrapCanvasText(ctx, card.name, width - padX * 2);
  let y = textTop;
  for (const line of nameLines.slice(0, 2)) {
    ctx.fillText(line, padX, y);
    y += 58;
  }
  ctx.fillStyle = inkMuted;
  ctx.font = '400 32px system-ui, sans-serif';
  ctx.fillText(card.dateLine, padX, y + 12);
  ctx.fillText(card.minutesLine, padX, y + 64);
  ctx.fillStyle = ink;
  ctx.font = '400 36px "Iowan Old Style", Palatino, serif';
  const sentenceLines = wrapCanvasText(ctx, card.sentence, width - padX * 2);
  let sy = y + 140;
  for (const line of sentenceLines.slice(0, 4)) {
    ctx.fillText(line, padX, sy);
    sy += 48;
  }
  ctx.fillStyle = inkMuted;
  ctx.font = '400 26px system-ui, sans-serif';
  if (card.footer) ctx.fillText(card.footer, padX, height - 88);
}

/**
 * @param {string} src
 * @param {{ Image?: typeof Image }} [deps]
 * @returns {Promise<CanvasImageSource | null>}
 */
export function loadCollectionPieceImage(src, deps = {}) {
  const ImageCtor =
    deps.Image ||
    (typeof globalThis !== 'undefined' ? globalThis.Image : null);
  if (!src || !ImageCtor) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new ImageCtor();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * @param {{
 *   skuId?: string,
 *   owned?: boolean,
 *   name?: string,
 *   lifetimeMinutes?: number,
 *   acquiredOn?: string | null,
 *   locale?: string,
 *   thumbSrc?: string | null,
 *   image?: CanvasImageSource | null,
 *   t?: (key: string) => string,
 *   createCanvas?: () => HTMLCanvasElement,
 *   download?: typeof downloadCanvasPng,
 *   Image?: typeof Image
 * }} opts
 * @returns {Promise<boolean>}
 */
export async function saveCollectionPieceCard(opts = {}) {
  if (opts.owned !== true) return false;
  const skuId = typeof opts.skuId === 'string' ? opts.skuId.trim() : '';
  if (!skuId) return false;
  const createCanvas =
    opts.createCanvas ||
    (typeof document !== 'undefined'
      ? () => document.createElement('canvas')
      : null);
  if (!createCanvas) return false;
  const canvas = createCanvas();
  canvas.width = COLLECTION_PIECE_CARD.width;
  canvas.height = COLLECTION_PIECE_CARD.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const lines = collectionPieceCardLines(opts);
  let image = opts.image || null;
  if (!image && opts.thumbSrc) {
    image = await loadCollectionPieceImage(opts.thumbSrc, opts);
  }
  paintCollectionPieceCard(ctx, {
    ...lines,
    footer: resolveBrandYinWaySeal({ t: opts.t || translate }),
    image
  });
  const filename = `focus-tiger-collection-piece-${skuId}.png`;
  const download = opts.download || downloadCanvasPng;
  return download(canvas, filename, opts);
}
