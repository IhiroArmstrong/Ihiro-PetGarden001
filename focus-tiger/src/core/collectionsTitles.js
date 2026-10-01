/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Companion titles tab — catalog titles only.
 * Bond shop rows keep their own Wear controls.
 */

import { FOCUS_COIN_CATALOG } from './focusCoinsLedger.js';
import { FOCUS_COIN_SKU_NAME_KEYS } from './focusCoinsSurface.js';

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
    nameKey: FOCUS_COIN_SKU_NAME_KEYS[sku.id] || sku.id,
    owned: owned.has(sku.id) || sku.grants.every((id) => owned.has(id)),
    equipped: equipped === sku.id
  }));
}
