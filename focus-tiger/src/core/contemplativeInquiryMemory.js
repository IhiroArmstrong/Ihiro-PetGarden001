/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

export const CONTEMPLATIVE_INQUIRY_STORAGE_KEY =
  'focus-tiger.contemplative-inquiry-ex1.v1';

export const CONTEMPLATIVE_INQUIRY_SIT_MS = 5 * 60 * 1000;

export const CONTEMPLATIVE_INQUIRY_SIDE_KEYS = Object.freeze([
  'CI_EX1_SIDE_2',
  'CI_EX1_SIDE_3',
  'CI_EX1_SIDE_4',
  'CI_EX1_SIDE_5'
]);

/**
 * @param {Storage | null | undefined} storage
 */
function readStore(storage) {
  if (!storage || typeof storage.getItem !== 'function') {
    return { firewallSeen: false, disabled: false, visitCount: 0 };
  }
  try {
    const raw = storage.getItem(CONTEMPLATIVE_INQUIRY_STORAGE_KEY);
    if (!raw) return { firewallSeen: false, disabled: false, visitCount: 0 };
    const parsed = JSON.parse(raw);
    return {
      firewallSeen: parsed?.firewallSeen === true,
      disabled: parsed?.disabled === true,
      visitCount: Number.isFinite(parsed?.visitCount)
        ? Math.max(0, Math.floor(parsed.visitCount))
        : 0
    };
  } catch {
    return { firewallSeen: false, disabled: false, visitCount: 0 };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ firewallSeen?: boolean, disabled?: boolean, visitCount?: number }} patch
 */
function writeStore(storage, patch) {
  if (!storage || typeof storage.setItem !== 'function') return readStore(storage);
  const next = { ...readStore(storage), ...patch };
  const payload = JSON.stringify({
    firewallSeen: next.firewallSeen === true,
    disabled: next.disabled === true,
    visitCount: Math.max(0, Math.floor(next.visitCount || 0))
  });
  const prev = storage.getItem(CONTEMPLATIVE_INQUIRY_STORAGE_KEY);
  if (prev === payload) return next;
  storage.setItem(CONTEMPLATIVE_INQUIRY_STORAGE_KEY, payload);
  return next;
}

/**
 * @param {Storage | null | undefined} [storage]
 */
export function readContemplativeInquiryMemory(storage) {
  return readStore(storage ?? (typeof localStorage !== 'undefined' ? localStorage : null));
}

/**
 * @param {Storage | null | undefined} [storage]
 */
export function isContemplativeInquiryMenuVisible(storage) {
  return readContemplativeInquiryMemory(storage).disabled !== true;
}

/**
 * @param {Storage | null | undefined} [storage]
 */
export function markContemplativeInquiryFirewallSeen(storage) {
  return writeStore(
    storage ?? (typeof localStorage !== 'undefined' ? localStorage : null),
    { firewallSeen: true }
  );
}

/**
 * @param {Storage | null | undefined} [storage]
 */
export function disableContemplativeInquiryMenu(storage) {
  return writeStore(
    storage ?? (typeof localStorage !== 'undefined' ? localStorage : null),
    { disabled: true, firewallSeen: true }
  );
}

/**
 * @param {Storage | null | undefined} [storage]
 */
export function incrementContemplativeInquiryVisit(storage) {
  const cur = readContemplativeInquiryMemory(storage);
  return writeStore(
    storage ?? (typeof localStorage !== 'undefined' ? localStorage : null),
    { visitCount: cur.visitCount + 1, firewallSeen: true }
  );
}

/**
 * Side prompt key for return visits 2–5 (visitCount 1–4 before this round starts).
 * @param {number} visitCount
 * @returns {string | null}
 */
export function contemplativeInquirySideKey(visitCount) {
  if (visitCount >= 1 && visitCount <= 4) {
    return CONTEMPLATIVE_INQUIRY_SIDE_KEYS[visitCount - 1];
  }
  return null;
}
