/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Artwork purchase rules for this slice.
 * A valid email may start checkout. Nothing here writes ownership.
 * Email is required; there is no device-only ownership path.
 */

import { findArtSheet } from './artCollectionCatalog.js';
import { findArtEditionSet } from './artEditionCatalog.js';

export const ART_PURCHASE_REQUIRES_EMAIL = true;

/**
 * @param {unknown} email
 * @returns {string} Empty when the address cannot be used to restore a purchase.
 */
export function normalizeArtPurchaseEmail(email) {
  const value = String(email ?? '').trim().toLowerCase();
  const at = value.indexOf('@');
  if (at <= 0 || at !== value.lastIndexOf('@') || at === value.length - 1) {
    return '';
  }
  return value;
}

/**
 * @param {{ sheetId?: string, email?: unknown }} [input]
 * @returns {{
 *   ok: false,
 *   reason: 'unknown_sheet' | 'email_required',
 *   wroteOwnership: false
 * } | {
 *   ok: true,
 *   sheetId: string,
 *   email: string,
 *   wroteOwnership: false
 * }}
 */
export function requestArtPurchase(input = {}) {
  const set = findArtEditionSet(String(input.sheetId || ''));
  if (!set) {
    return { ok: false, reason: 'unknown_sheet', wroteOwnership: false };
  }
  const email = normalizeArtPurchaseEmail(input.email);
  if (!email) {
    return { ok: false, reason: 'email_required', wroteOwnership: false };
  }
  return { ok: true, sheetId: set.id, email, wroteOwnership: false };
}

/**
 * High-resolution bytes are never returned from the public tree.
 * Without an emailed ownership record the answer is 403.
 * @param {{ sheetId?: string, ownership?: ReadonlyArray<{ sheetId?: string, email?: string, revoked?: boolean }> }} [input]
 * @returns {{ ok: false, status: 403 | 404, bytes: null }}
 */
export function resolveArtHd(input = {}) {
  const sheet = findArtSheet(String(input.sheetId || ''));
  if (!sheet) return { ok: false, status: 404, bytes: null };
  const rows = Array.isArray(input.ownership) ? input.ownership : [];
  const owned = rows.some(
    (row) =>
      row &&
      row.sheetId === sheet.id &&
      row.revoked !== true &&
      normalizeArtPurchaseEmail(row.email) !== ''
  );
  if (!owned) return { ok: false, status: 403, bytes: null };
  return { ok: false, status: 404, bytes: null };
}
