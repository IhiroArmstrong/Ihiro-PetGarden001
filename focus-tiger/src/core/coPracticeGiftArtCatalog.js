/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T68 — co-practice gift-art catalog (gift rail, never for sale).
 * Gate 4 lock (2026-10-30 PO): only piece 1 is an active product constant.
 * Pieces 2–3 stay in the catalog with provisional A and grantEnabled false.
 */

import { ART_EDITION_SETS, TEA_GIFT_ART } from './artEditionCatalog.js';

export const CO_PRACTICE_GIFT_ART_STORAGE_KEY = 'focus-tiger.co-practice-gift-art.v1';

/** User-visible card + persist grant. Off until a dedicated switch PR. */
export const CO_PRACTICE_GIFT_ART_SURFACE_ENABLED = false;

/**
 * Collections block is hidden while the surface is off and nothing has
 * been granted (C-11: do not advertise an unimplemented gift).
 *
 * @param {{ surfaceEnabled?: boolean, grantCount?: number }} [opts]
 */
export function shouldShowGiftArtCollectionSection(opts = {}) {
  const surfaceEnabled =
    opts.surfaceEnabled ?? CO_PRACTICE_GIFT_ART_SURFACE_ENABLED;
  const grantCount = Number(opts.grantCount) || 0;
  return surfaceEnabled === true || grantCount > 0;
}

export const CO_PRACTICE_GIFT_ART_C = Object.freeze({
  bandwidthRatio: 0.2,
  sampleSize: 10,
  minHitRatio: 0.7
});

/**
 * @param {string} id
 * @param {number} order
 * @param {number} aMinutes
 * @param {number} bDays
 * @param {number} bSpanDays
 * @param {boolean} grantEnabled
 * @param {boolean} aProvisional
 */
function piece(id, order, aMinutes, bDays, bSpanDays, grantEnabled, aProvisional) {
  return Object.freeze({
    id,
    order,
    aMinutes,
    bDays,
    bSpanDays,
    grantEnabled,
    aProvisional,
    titleKey: `CO_PRACTICE_GIFT_ART_${id.replace(/-/g, '_').toUpperCase()}_TITLE`,
    storyKey: `CO_PRACTICE_GIFT_ART_${id.replace(/-/g, '_').toUpperCase()}_STORY`,
    previewSrc: `/ui/co-practice-gift-art/${id}.png`
  });
}

/** Sit ceremony order: mustard → imprint → this card. */
export const CO_PRACTICE_GIFT_ART_CEREMONY_ORDER = Object.freeze([
  'mustard-seed',
  'practice-imprint',
  'co-practice-gift-art'
]);

export const CO_PRACTICE_GIFT_ART_PIECES = Object.freeze([
  piece('mountain-boat-tray', 1, 150, 3, 21, true, false),
  piece('peony-phoenix-plate', 2, 480, 4, 28, false, true),
  piece('peach-crane-disc', 3, 1200, 5, 35, false, true)
]);

/**
 * @returns {string[]}
 */
export function listForSaleArtIds() {
  /** @type {string[]} */
  const ids = [TEA_GIFT_ART.id];
  for (const set of ART_EDITION_SETS) {
    ids.push(set.id);
    for (const sheet of set.sheets) ids.push(sheet.id);
  }
  return ids;
}

/**
 * @returns {string[]}
 */
export function listGiftArtIds() {
  return CO_PRACTICE_GIFT_ART_PIECES.map((row) => row.id);
}

/**
 * @param {string} id
 */
export function findGiftArtPiece(id) {
  return CO_PRACTICE_GIFT_ART_PIECES.find((row) => row.id === id) || null;
}
