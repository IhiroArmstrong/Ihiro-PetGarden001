/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Memorial seal card → PNG download (Quiet Line pattern; not in-app social share).
 * @see docs/task-briefs/task-brand-seal-export-surfaces.md
 */

import { getLocale, t } from '../locales/i18n.js';
import { resolveBrandYinWaySeal } from './brandYinWaySeal.js';
import { downloadCanvasPng, wrapCanvasText } from './dailyZenQuote.js';
import {
  getMustardSeedSealCase,
  mustardSeedSealBadgeSrc,
  mustardSeedSealZhIsPrimaryLocale
} from './mustardSeedSeal.js';

export const MUSTARD_SEAL_EXPORT_CARD = Object.freeze({
  width: 1080,
  height: 1350,
  paper: '#f4eee3',
  titleInk: '#3d2e22',
  ink: '#2c1f14',
  inkMuted: 'rgba(92,67,48,0.88)',
  padX: 72,
  badgeSize: 280
});

/**
 * @param {string} src
 * @param {object} [deps]
 * @param {typeof Image} [deps.Image]
 * @returns {Promise<CanvasImageSource | null>}
 */
export async function loadMustardSeedBadgeImage(src, deps = {}) {
  const ImageCtor =
    deps.Image ||
    (typeof globalThis !== 'undefined' ? globalThis.Image : null);
  if (!ImageCtor || !src) return null;
  return new Promise((resolve) => {
    const img = new ImageCtor();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {string[]} opts.primaryLines
 * @param {string[]} opts.secondaryLines
 * @param {string} opts.attribution
 * @param {string} [opts.footer]
 * @param {CanvasImageSource | null} [opts.badgeImage]
 * @param {typeof document.createElement} [opts.createElement]
 * @returns {HTMLCanvasElement}
 */
export function renderMustardSeedSealCanvas(opts) {
  const createElement =
    opts.createElement ||
    (typeof document !== 'undefined'
      ? document.createElement.bind(document)
      : null);
  if (!createElement) {
    throw new Error('renderMustardSeedSealCanvas requires document');
  }

  const canvas = createElement('canvas');
  canvas.width = MUSTARD_SEAL_EXPORT_CARD.width;
  canvas.height = MUSTARD_SEAL_EXPORT_CARD.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');

  ctx.fillStyle = MUSTARD_SEAL_EXPORT_CARD.paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padX = MUSTARD_SEAL_EXPORT_CARD.padX;
  let y = 88;

  ctx.textAlign = 'center';
  ctx.fillStyle = MUSTARD_SEAL_EXPORT_CARD.titleInk;
  ctx.font =
    '600 44px "Iowan Old Style", "Palatino Linotype", Palatino, serif';
  ctx.fillText(opts.title || '', canvas.width / 2, y);
  y += 56;

  const badgeSize = MUSTARD_SEAL_EXPORT_CARD.badgeSize;
  const badgeX = (canvas.width - badgeSize) / 2;
  const badgeY = y;
  const badge = opts.badgeImage;
  const srcW =
    Number(badge && badge.naturalWidth) || Number(badge && badge.width) || 0;
  const srcH =
    Number(badge && badge.naturalHeight) || Number(badge && badge.height) || 0;
  if (badge && srcW > 0 && srcH > 0 && typeof ctx.drawImage === 'function') {
    ctx.drawImage(badge, badgeX, badgeY, badgeSize, badgeSize);
  } else {
    ctx.strokeStyle = 'rgba(212,165,116,0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(badgeX, badgeY, badgeSize, badgeSize);
  }
  y += badgeSize + 48;

  const maxTextW = canvas.width - padX * 2;
  const footerY = canvas.height - 96;

  ctx.fillStyle = MUSTARD_SEAL_EXPORT_CARD.ink;
  ctx.font =
    '500 40px "Iowan Old Style", "Palatino Linotype", Palatino, serif';
  for (const line of opts.primaryLines || []) {
    const wrapped = wrapCanvasText(ctx, line, maxTextW);
    for (const row of wrapped) {
      if (y > footerY - 220) break;
      ctx.fillText(row, canvas.width / 2, y);
      y += 52;
    }
  }

  y += 12;
  ctx.fillStyle = MUSTARD_SEAL_EXPORT_CARD.inkMuted;
  ctx.font =
    '400 30px "Iowan Old Style", "Palatino Linotype", Palatino, serif';
  for (const line of opts.secondaryLines || []) {
    const wrapped = wrapCanvasText(ctx, line, maxTextW);
    for (const row of wrapped) {
      if (y > footerY - 120) break;
      ctx.fillText(row, canvas.width / 2, y);
      y += 40;
    }
  }

  y = Math.min(y + 20, footerY - 72);
  ctx.font = '400 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(opts.attribution || '', canvas.width / 2, y);

  ctx.fillStyle = MUSTARD_SEAL_EXPORT_CARD.inkMuted;
  ctx.font = '400 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    opts.footer || 'Walking the Yin Way. · Focus Tiger',
    canvas.width / 2,
    footerY
  );

  return canvas;
}

/**
 * @param {string} caseId
 * @param {string} locale
 * @returns {{ primaryLines: string[], secondaryLines: string[] }}
 */
export function mustardSeedSealPoemLinesForExport(caseId, locale) {
  const verse = getMustardSeedSealCase(caseId);
  if (!verse) {
    return { primaryLines: [], secondaryLines: [] };
  }
  const zhPrimary = mustardSeedSealZhIsPrimaryLocale(locale);
  return {
    primaryLines: zhPrimary ? verse.poemZh : verse.poemEn,
    secondaryLines: zhPrimary ? verse.poemEn : verse.poemZh
  };
}

/**
 * @param {string} caseId
 * @returns {string}
 */
export function mustardSeedSealExportFilename(caseId) {
  const safe = String(caseId || 'mustard-seed')
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `focus-tiger-mustard-seed-${safe || 'seal'}.png`;
}

/**
 * @param {{
 *   caseId?: string,
 *   locale?: string,
 *   badgeImage?: CanvasImageSource | null,
 *   loadImage?: (src: string) => Promise<CanvasImageSource | null>,
 * } & Parameters<typeof downloadCanvasPng>[2]} [opts]
 * @returns {Promise<{ ok: boolean, filename: string, caseId: string }>}
 */
export async function saveMustardSeedSealImage(opts = {}) {
  const caseId = opts.caseId || 'mustard-seed-sumeru';
  const verse = getMustardSeedSealCase(caseId);
  if (!verse) {
    return { ok: false, filename: '', caseId };
  }

  const locale = opts.locale || getLocale();
  const title = t('MUSTARD_SEED_SEAL_CARD_TITLE');
  const footer = resolveBrandYinWaySeal({ t });
  const { primaryLines, secondaryLines } = mustardSeedSealPoemLinesForExport(
    caseId,
    locale
  );
  const attribution = `${verse.attributionZh} · ${verse.attributionEn}`;

  const loadImage = opts.loadImage || loadMustardSeedBadgeImage;
  let badgeImage = opts.badgeImage || null;
  if (!badgeImage) {
    badgeImage = await loadImage(mustardSeedSealBadgeSrc());
  }

  const canvas = renderMustardSeedSealCanvas({
    title,
    primaryLines,
    secondaryLines,
    attribution,
    footer,
    badgeImage,
    createElement: opts.createElement
  });
  const filename = mustardSeedSealExportFilename(caseId);
  const ok = await downloadCanvasPng(canvas, filename, opts);
  return { ok, filename, caseId };
}
