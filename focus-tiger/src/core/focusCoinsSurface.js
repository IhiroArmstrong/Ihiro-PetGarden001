/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L3 Yin's Collections surface helpers — shop rows + specific shortfall copy.
 * Overlay SKUs stay in the ledger for already-owned ids but never appear here.
 */

import {
  evaluateFocusCoinRedeem,
  listShopFocusCoinSkus
} from './focusCoinsLedger.js';

/** @type {Readonly<Record<string, string>>} */
export const FOCUS_COIN_SKU_NAME_KEYS = Object.freeze({
  'title.sits-with-yin': 'YIN_COIN_SKU_SITS_WITH_YIN',
  'title.returned-gently': 'YIN_COIN_SKU_RETURNED_GENTLY',
  'title.long-sitter': 'YIN_COIN_SKU_LONG_SITTER',
  'badge.rare.quiet-pebble': 'YIN_COIN_SKU_QUIET_PEBBLE',
  'collection.porcelain.qing-vase': 'YIN_COIN_SKU_QING_VASE',
  'collection.bronze.ritual-vessel': 'YIN_COIN_SKU_BRONZE_VESSEL',
  'gesture.wave-hello': 'YIN_COIN_SKU_WAVE_HELLO'
});

/**
 * @param {number} n
 * @returns {number}
 */
function nonNegInt(n) {
  const v = Math.floor(Number(n) || 0);
  return v > 0 ? v : 0;
}

/**
 * @param {import('./focusCoinsLedger.js').FocusCoinSku | null | undefined} sku
 * @param {string[]} [ownedIds]
 * @returns {boolean}
 */
export function isFocusCoinSkuOwned(sku, ownedIds) {
  if (!sku) return false;
  const owned = Array.isArray(ownedIds) ? ownedIds : [];
  return owned.includes(sku.id) || sku.grants.every((id) => owned.includes(id));
}

/**
 * All remaining display gaps (not evaluate's first-deny short-circuit).
 * @param {import('./focusCoinsLedger.js').FocusCoinSku} sku
 * @param {Parameters<typeof evaluateFocusCoinRedeem>[1]} [ctx]
 * @returns {Array<{
 *   kind: string,
 *   need?: number,
 *   needDays?: number
 * }>}
 */
export function listFocusCoinRedeemGaps(sku, ctx = {}) {
  if (!sku) return [];
  if (isFocusCoinSkuOwned(sku, ctx.ownedIds)) return [];

  /** @type {Array<{ kind: string, need?: number, needDays?: number }>} */
  const gaps = [];
  const balance = nonNegInt(ctx.balance);
  if (balance < sku.price) {
    gaps.push({ kind: 'balance', need: sku.price - balance });
  }
  if (sku.minLifetimeMinutes != null) {
    const have = nonNegInt(ctx.lifetimeMinutes);
    if (have < sku.minLifetimeMinutes) {
      gaps.push({ kind: 'minutes', need: sku.minLifetimeMinutes - have });
    }
  }
  if (sku.requireIncense) {
    const daysOk =
      nonNegInt(ctx.practiceDayCount) >= nonNegInt(sku.minPracticeDays);
    if (ctx.hasIncense !== true && !daysOk) {
      gaps.push({
        kind: 'incense',
        needDays: Math.max(
          0,
          nonNegInt(sku.minPracticeDays) - nonNegInt(ctx.practiceDayCount)
        )
      });
    }
  } else if (sku.minPracticeDays != null) {
    const have = nonNegInt(ctx.practiceDayCount);
    if (have < sku.minPracticeDays) {
      gaps.push({ kind: 'practice-days', need: sku.minPracticeDays - have });
    }
  }
  if (sku.requireLotusBloom && ctx.hasLotusBloom !== true) {
    gaps.push({ kind: 'lotus-bloom' });
  }
  if (sku.requireHonestyWake && ctx.hasHonestyWake !== true) {
    gaps.push({ kind: 'honesty-wake' });
  }
  if (sku.requireActiveRecover && ctx.hasActiveRecover !== true) {
    gaps.push({ kind: 'active-recover' });
  }
  return gaps;
}

/**
 * @param {Array<{ kind: string, need?: number, needDays?: number }>} gaps
 * @param {(key: string) => string} lookup
 * @returns {string}
 */
export function formatFocusCoinGapMessage(gaps, lookup) {
  if (!Array.isArray(gaps) || gaps.length === 0) return '';
  const read = typeof lookup === 'function' ? lookup : () => '';
  const parts = gaps.map((gap) => {
    if (gap.kind === 'balance') {
      return read('YIN_COIN_GAP_BALANCE').replaceAll(
        '{n}',
        String(gap.need ?? 0)
      );
    }
    if (gap.kind === 'minutes') {
      return read('YIN_COIN_GAP_MINUTES').replaceAll(
        '{n}',
        String(gap.need ?? 0)
      );
    }
    if (gap.kind === 'practice-days') {
      return read('YIN_COIN_GAP_PRACTICE_DAYS').replaceAll(
        '{n}',
        String(gap.need ?? 0)
      );
    }
    if (gap.kind === 'incense') {
      return read('YIN_COIN_GAP_INCENSE').replaceAll(
        '{n}',
        String(gap.needDays ?? 0)
      );
    }
    if (gap.kind === 'lotus-bloom') return read('YIN_COIN_GAP_LOTUS');
    if (gap.kind === 'honesty-wake') return read('YIN_COIN_GAP_HONESTY');
    if (gap.kind === 'active-recover') return read('YIN_COIN_GAP_RECOVER');
    return '';
  });
  return parts.filter(Boolean).join(' ');
}

/**
 * One row per shop SKU — retired overlays never appear.
 * @param {Parameters<typeof evaluateFocusCoinRedeem>[1] & {
 *   equippedTitle?: string | null
 * }} [ctx]
 */
export function listFocusCoinSurfaceRows(ctx = {}) {
  const equippedTitle =
    typeof ctx.equippedTitle === 'string' ? ctx.equippedTitle : null;
  return listShopFocusCoinSkus().map((sku) => {
    const owned = isFocusCoinSkuOwned(sku, ctx.ownedIds);
    const evaluated = evaluateFocusCoinRedeem(sku.id, ctx);
    const titleIds = sku.grants.filter((id) => id.startsWith('title.'));
    return {
      id: sku.id,
      kind: sku.kind,
      price: sku.price,
      nameKey: FOCUS_COIN_SKU_NAME_KEYS[sku.id],
      owned,
      canRedeem: evaluated.ok === true,
      reason: evaluated.reason,
      gaps: listFocusCoinRedeemGaps(sku, ctx),
      titleIds,
      showWear: owned && titleIds.length > 0,
      wearingTitleId: titleIds.find((id) => id === equippedTitle) ?? null,
      showPlay: owned && sku.id === 'gesture.wave-hello',
      playBusy:
        owned && sku.id === 'gesture.wave-hello' && ctx.playBusy === true,
      ceremonial: sku.kind === 'badge.rare' || sku.kind === 'collection'
    };
  });
}
