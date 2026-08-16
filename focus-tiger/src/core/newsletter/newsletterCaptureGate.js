/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Stay in touch · local flags only (no email stored).
 * Soft prompt dismiss is reserved for Phase 2 — not wired this slice.
 *
 * ZERO COUPLING: do not import tip-jar / sanctuary / entitlement gate modules.
 */

export const NEWSLETTER_CAPTURE_STORAGE_KEY =
  'focus-tiger.newsletter-capture.v1';

/**
 * @typedef {{
 *   submitted: boolean
 * }} NewsletterCaptureState
 */

/**
 * @param {unknown} raw
 * @returns {NewsletterCaptureState}
 */
export function normalizeNewsletterCaptureState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { submitted: false };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  return { submitted: Boolean(o.submitted) };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {NewsletterCaptureState}
 */
export function readNewsletterCaptureState(storage) {
  if (!storage) return normalizeNewsletterCaptureState(null);
  try {
    const raw = storage.getItem(NEWSLETTER_CAPTURE_STORAGE_KEY);
    if (!raw) return normalizeNewsletterCaptureState(null);
    return normalizeNewsletterCaptureState(JSON.parse(raw));
  } catch {
    return normalizeNewsletterCaptureState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {NewsletterCaptureState} state
 */
export function writeNewsletterCaptureState(storage, state) {
  if (!storage) return;
  try {
    const normalized = normalizeNewsletterCaptureState(state);
    storage.setItem(
      NEWSLETTER_CAPTURE_STORAGE_KEY,
      JSON.stringify({ submitted: Boolean(normalized.submitted) })
    );
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @returns {boolean}
 */
export function hasSubmittedNewsletter({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null
} = {}) {
  return readNewsletterCaptureState(storage).submitted === true;
}

/**
 * Mark successful subscribe. Never stores the email address.
 * @param {Storage | null | undefined} storage
 */
export function markNewsletterSubmitted(storage) {
  writeNewsletterCaptureState(storage, { submitted: true });
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearNewsletterCaptureState(storage) {
  writeNewsletterCaptureState(storage, { submitted: false });
}

/**
 * Lightweight client-side shape check (not a full RFC validator).
 * @param {string} email
 * @returns {boolean}
 */
export function isPlausibleNewsletterEmail(email) {
  const e = String(email || '')
    .trim()
    .toLowerCase();
  if (e.length < 5 || e.length > 254) return false;
  const at = e.indexOf('@');
  if (at < 1 || at !== e.lastIndexOf('@')) return false;
  const domain = e.slice(at + 1);
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}
