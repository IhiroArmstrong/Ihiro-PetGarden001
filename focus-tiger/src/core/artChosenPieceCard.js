/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Owned digital artwork → vertical PNG.
 * The sentence is “a piece I chose.” It never cites sitting minutes.
 * A missing purchase day stays missing.
 * The picture is the public preview. High-resolution bytes stay off this card
 * until a later delivery task hands over a checked file.
 */

import { getLocale, t as translate } from '../locales/i18n.js';
import { resolveBrandYinWaySeal } from './brandYinWaySeal.js';
import {
  downloadCanvasPng,
  formatQuietLineFooterDate,
  wrapCanvasText
} from './dailyZenQuote.js';

export const ART_CHOSEN_PIECE_CARD = Object.freeze({
  width: 1080,
  height: 1350,
  paper: '#f4eee3',
  ink: '#2c1f14',
  inkMuted: 'rgba(92,67,48,0.88)',
  padX: 88
});

/**
 * Calendar day already written on the purchase record.
 * @param {string | null | undefined} ownedAt
 * @returns {string}
 */
export function artChosenPieceDay(ownedAt) {
  const raw = typeof ownedAt === 'string' ? ownedAt.trim() : '';
  const day = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : '';
}

/**
 * @param {{
 *   name?: string,
 *   ownedAt?: string | null,
 *   locale?: string,
 *   t?: (key: string) => string
 * }} input
 */
export function artChosenPieceCardLines(input = {}) {
  const read = input.t || translate;
  const day = artChosenPieceDay(input.ownedAt);
  return {
    name: String(input.name || '').trim(),
    dateLine: day
      ? formatQuietLineFooterDate(day, input.locale || getLocale())
      : read('ART_CHOSEN_PIECE_CARD_KEPT'),
    sentence: read('ART_CHOSEN_PIECE_CARD_LINE'),
    hasCalendarDate: Boolean(day)
  };
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{
 *   name: string,
 *   dateLine: string,
 *   sentence: string,
 *   footer?: string,
 *   image?: CanvasImageSource | null
 * }} card
 */
export function paintArtChosenPieceCard(ctx, card) {
  const { width, height, paper, ink, inkMuted, padX } = ART_CHOSEN_PIECE_CARD;
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
  ctx.fillStyle = ink;
  ctx.font = '400 36px "Iowan Old Style", Palatino, serif';
  const sentenceLines = wrapCanvasText(ctx, card.sentence, width - padX * 2);
  let sy = y + 88;
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
export function loadArtChosenPieceImage(src, deps = {}) {
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
 *   sheetId?: string,
 *   owned?: boolean,
 *   name?: string,
 *   ownedAt?: string | null,
 *   locale?: string,
 *   previewSrc?: string | null,
 *   image?: CanvasImageSource | null,
 *   t?: (key: string) => string,
 *   createCanvas?: () => HTMLCanvasElement,
 *   download?: typeof downloadCanvasPng,
 *   Image?: typeof Image
 * }} opts
 * @returns {Promise<boolean>}
 */
export async function saveArtChosenPieceCard(opts = {}) {
  if (opts.owned !== true) return false;
  const sheetId = typeof opts.sheetId === 'string' ? opts.sheetId.trim() : '';
  if (!sheetId) return false;
  const createCanvas =
    opts.createCanvas ||
    (typeof document !== 'undefined'
      ? () => document.createElement('canvas')
      : null);
  if (!createCanvas) return false;
  const canvas = createCanvas();
  canvas.width = ART_CHOSEN_PIECE_CARD.width;
  canvas.height = ART_CHOSEN_PIECE_CARD.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const lines = artChosenPieceCardLines(opts);
  let image = opts.image || null;
  if (!image && opts.previewSrc) {
    image = await loadArtChosenPieceImage(opts.previewSrc, opts);
  }
  paintArtChosenPieceCard(ctx, {
    ...lines,
    footer: resolveBrandYinWaySeal({ t: opts.t || translate }),
    image
  });
  const filename = `focus-tiger-art-piece-${sheetId}.png`;
  const download = opts.download || downloadCanvasPng;
  return download(canvas, filename, opts);
}
