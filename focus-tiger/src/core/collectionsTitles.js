/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Companion titles tab — catalog titles only.
 * Bond shop rows keep their own Wear controls.
 */

import { FOCUS_COIN_CATALOG } from './focusCoinsLedger.js';

/** Desk rows keep the object names. The titles tab uses these. */
const COMPANION_TITLE_NAME_KEYS = Object.freeze({
  'title.sits-with-yin': 'YIN_COIN_TITLE_NAME_SITS_WITH_YIN',
  'title.returned-gently': 'YIN_COIN_TITLE_NAME_RETURNED_GENTLY',
  'title.long-sitter': 'YIN_COIN_TITLE_NAME_LONG_SITTER'
});

/**
 * @typedef {{
 *   id: string,
 *   nameKey: string,
 *   owned: boolean,
 *   equipped: boolean
 * }} CompanionTitleRow
 */

/**
 * @param {{ ownedIds?: string[], equippedTitle?: string | null }} ctx
 * @returns {CompanionTitleRow[]}
 */
export function listCompanionTitleRows(ctx = {}) {
  const owned = new Set(Array.isArray(ctx.ownedIds) ? ctx.ownedIds : []);
  const equipped = typeof ctx.equippedTitle === 'string' ? ctx.equippedTitle : '';
  return FOCUS_COIN_CATALOG.filter((sku) => sku.kind === 'title').map((sku) => ({
    id: sku.id,
    nameKey: COMPANION_TITLE_NAME_KEYS[sku.id] || sku.id,
    owned: owned.has(sku.id) || sku.grants.every((id) => owned.has(id)),
    equipped: equipped === sku.id
  }));
}
