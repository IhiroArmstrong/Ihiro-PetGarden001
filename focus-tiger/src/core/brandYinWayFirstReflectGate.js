/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * One-time Reflect footer gate for brand tagline (Slice 2).
 * SSOT: `docs/task-briefs/task-brand-yin-way-tagline.md`
 */

import { RETENTION_FUNNEL_STORAGE_KEY } from './RetentionTelemetry.js';

export const BRAND_YIN_WAY_FIRST_REFLECT_STORAGE_KEY =
  'focus-tiger.brand-yin-way-first-reflect.v1';

/**
 * @typedef {{ shown: boolean }} BrandYinWayFirstReflectState
 */

/**
 * @param {unknown} raw
 * @returns {BrandYinWayFirstReflectState}
 */
export function normalizeBrandYinWayFirstReflectState(raw) {
  if (!raw || typeof raw !== 'object') return { shown: false };
  return { shown: Boolean(/** @type {{ shown?: unknown }} */ (raw).shown) };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {BrandYinWayFirstReflectState}
 */
export function readBrandYinWayFirstReflectState(storage) {
  if (!storage) return normalizeBrandYinWayFirstReflectState(null);
  try {
    const raw = storage.getItem(BRAND_YIN_WAY_FIRST_REFLECT_STORAGE_KEY);
    if (!raw) return normalizeBrandYinWayFirstReflectState(null);
    return normalizeBrandYinWayFirstReflectState(JSON.parse(raw));
  } catch {
    return normalizeBrandYinWayFirstReflectState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {BrandYinWayFirstReflectState} state
 */
export function writeBrandYinWayFirstReflectState(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(
      BRAND_YIN_WAY_FIRST_REFLECT_STORAGE_KEY,
      JSON.stringify({ shown: Boolean(state.shown) })
    );
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{
 *   emitted: { firstSession?: boolean },
 *   firstSessionCompleteAt: number | null
 * }}
 */
export function readRetentionFunnelSnapshot(storage) {
  if (!storage) {
    return { emitted: {}, firstSessionCompleteAt: null };
  }
  try {
    const parsed = JSON.parse(
      storage.getItem(RETENTION_FUNNEL_STORAGE_KEY) ?? 'null'
    );
    if (!parsed || typeof parsed !== 'object') {
      return { emitted: {}, firstSessionCompleteAt: null };
    }
    const emitted =
      parsed.emitted && typeof parsed.emitted === 'object'
        ? { ...parsed.emitted }
        : {};
    return {
      emitted,
      firstSessionCompleteAt: Number.isFinite(parsed.firstSessionCompleteAt)
        ? parsed.firstSessionCompleteAt
        : null
    };
  } catch {
    return { emitted: {}, firstSessionCompleteAt: null };
  }
}

/**
 * Show bilingual brand tagline on Reflect once after first_session_complete.
 *
 * @param {object} [opts]
 * @param {Storage | null | undefined} [opts.storage]
 * @returns {boolean}
 */
export function shouldShowBrandYinWayFirstReflect({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null
} = {}) {
  const gate = readBrandYinWayFirstReflectState(storage);
  if (gate.shown) return false;
  const retention = readRetentionFunnelSnapshot(storage);
  return (
    retention.emitted.firstSession === true &&
    retention.firstSessionCompleteAt != null
  );
}

/**
 * @param {Storage | null | undefined} storage
 */
export function markBrandYinWayFirstReflectShown(storage) {
  writeBrandYinWayFirstReflectState(storage, { shown: true });
}
