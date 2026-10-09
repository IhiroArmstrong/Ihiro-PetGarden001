/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Companion merch waitlist — local only.
 * Suggested gates from task-companion-merch-priority.md:
 * lifetime minutes ≥ 6000, or score ≥ 84,
 * or mustard-seed case 2 revealed and at least 30 practice days.
 * No wallet, NFT, or checkout. Registration does not upload.
 */

import { listRevealedMustardSeedCaseIds } from './mustardSeedSeal.js';

export const COMPANION_MERCH_STORAGE_KEY = 'focus-tiger.companion-merch.v1';
export const COMPANION_MERCH_MINUTES = 6000;
export const COMPANION_MERCH_SCORE = 84;
export const COMPANION_MERCH_PRACTICE_DAYS = 30;
/** Second mustard-seed verse in MUSTARD_SEED_SEAL_CASES. */
export const COMPANION_MERCH_CASE_2_ID = 'hero-not-pond';

/**
 * @param {{
 *   lifetimeMinutes?: number,
 *   score?: number,
 *   practiceDayCount?: number,
 *   revealedCaseIds?: string[]
 * }} input
 */
export function companionMerchPracticeMet(input = {}) {
  const minutes = Math.max(0, Number(input.lifetimeMinutes) || 0);
  const score = Math.max(0, Number(input.score) || 0);
  const days = Math.max(0, Number(input.practiceDayCount) || 0);
  const revealed = Array.isArray(input.revealedCaseIds) ? input.revealedCaseIds : [];
  if (minutes >= COMPANION_MERCH_MINUTES) return true;
  if (score >= COMPANION_MERCH_SCORE) return true;
  return (
    revealed.includes(COMPANION_MERCH_CASE_2_ID) &&
    days >= COMPANION_MERCH_PRACTICE_DAYS
  );
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readCompanionMerchRecord(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(COMPANION_MERCH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.registeredAt !== 'string') return null;
    return {
      registeredAt: parsed.registeredAt,
      contactLater: parsed.contactLater === true
    };
  } catch {
    return null;
  }
}

/**
 * @param {{
 *   storage?: Storage | null,
 *   lifetimeMinutes?: number,
 *   score?: number,
 *   practiceDayCount?: number,
 *   revealedCaseIds?: string[],
 *   email?: string | null
 * }} input
 */
export function describeCompanionMerch(input = {}) {
  const practiceMet = companionMerchPracticeMet(input);
  const emailBound = Boolean(String(input.email || '').trim());
  const record = readCompanionMerchRecord(input.storage);
  let status = 'not-yet';
  if (!emailBound) status = 'need-email';
  else if (!practiceMet) status = 'not-yet';
  else if (record) status = 'registered';
  else status = 'eligible';
  return {
    practiceMet,
    emailBound,
    registered: Boolean(record),
    contactLater: record?.contactLater === true,
    status
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{
 *   email?: string | null,
 *   contactLater?: boolean,
 *   now?: Date,
 *   lifetimeMinutes?: number,
 *   score?: number,
 *   practiceDayCount?: number,
 *   revealedCaseIds?: string[]
 * }} input
 */
export function registerCompanionMerch(storage, input = {}) {
  const view = describeCompanionMerch({ ...input, storage });
  if (view.status === 'need-email' || view.status === 'not-yet') {
    return { ok: false, reason: view.status };
  }
  const contactLater = input.contactLater === true;
  if (view.status === 'registered' && view.contactLater === contactLater) {
    return { ok: true, unchanged: true };
  }
  if (!storage) return { ok: false, reason: 'no-storage' };
  const registeredAt = view.status === 'registered'
    ? readCompanionMerchRecord(storage).registeredAt
    : (input.now || new Date()).toISOString();
  storage.setItem(
    COMPANION_MERCH_STORAGE_KEY,
    JSON.stringify({ registeredAt, contactLater })
  );
  return { ok: true, unchanged: false };
}

export { listRevealedMustardSeedCaseIds };
