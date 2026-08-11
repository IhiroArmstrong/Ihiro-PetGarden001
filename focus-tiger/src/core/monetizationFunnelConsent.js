/**
 * Monetization funnel opt-in consent + anonymous install id.
 * Default off. Upload only when optedIn === true.
 *
 * @see docs/task-briefs/task-monetization-funnel-optin-upload.md
 * @see docs/MONETIZATION_INTENT_FUNNEL.md
 */

export const MONETIZATION_FUNNEL_CONSENT_STORAGE_KEY =
  'focus-tiger.monetization-funnel-consent.v1';

/**
 * @typedef {{
 *   optedIn: boolean,
 *   installId: string,
 *   lastSentCounts: Record<string, number>,
 *   lastSentAt: string | null
 * }} MonetizationFunnelConsentState
 */

/**
 * @returns {string}
 */
export function createAnonymousInstallId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * @param {unknown} raw
 * @returns {MonetizationFunnelConsentState}
 */
export function normalizeMonetizationFunnelConsent(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      optedIn: false,
      installId: createAnonymousInstallId(),
      lastSentCounts: {},
      lastSentAt: null
    };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  /** @type {Record<string, number>} */
  const lastSentCounts = {};
  if (o.lastSentCounts && typeof o.lastSentCounts === 'object') {
    for (const [k, v] of Object.entries(
      /** @type {Record<string, unknown>} */ (o.lastSentCounts)
    )) {
      const n = Number(v);
      if (k && Number.isFinite(n) && n > 0) lastSentCounts[k] = Math.floor(n);
    }
  }
  return {
    optedIn: o.optedIn === true,
    installId:
      typeof o.installId === 'string' && o.installId
        ? o.installId
        : createAnonymousInstallId(),
    lastSentCounts,
    lastSentAt:
      typeof o.lastSentAt === 'string' && o.lastSentAt ? o.lastSentAt : null
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {MonetizationFunnelConsentState}
 */
export function readMonetizationFunnelConsent(storage) {
  if (!storage) return normalizeMonetizationFunnelConsent(null);
  try {
    const raw = storage.getItem(MONETIZATION_FUNNEL_CONSENT_STORAGE_KEY);
    if (!raw) return normalizeMonetizationFunnelConsent(null);
    return normalizeMonetizationFunnelConsent(JSON.parse(raw));
  } catch {
    return normalizeMonetizationFunnelConsent(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {MonetizationFunnelConsentState} state
 */
export function writeMonetizationFunnelConsent(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(
      MONETIZATION_FUNNEL_CONSENT_STORAGE_KEY,
      JSON.stringify(normalizeMonetizationFunnelConsent(state))
    );
  } catch {
    /* ignore */
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {boolean} optedIn
 * @returns {MonetizationFunnelConsentState}
 */
export function setMonetizationFunnelOptIn(storage, optedIn) {
  const prev = readMonetizationFunnelConsent(storage);
  const next = {
    ...prev,
    optedIn: optedIn === true
  };
  writeMonetizationFunnelConsent(storage, next);
  return next;
}

/**
 * @param {Record<string, number>} current
 * @param {Record<string, number>} lastSent
 * @returns {Record<string, number>} positive deltas only
 */
export function monetizationFunnelCountDelta(current, lastSent) {
  /** @type {Record<string, number>} */
  const out = {};
  for (const [k, v] of Object.entries(current || {})) {
    const n = Math.floor(Number(v) || 0);
    const prev = Math.floor(Number(lastSent?.[k]) || 0);
    const d = n - prev;
    if (d > 0) out[k] = d;
  }
  return out;
}

/**
 * @param {Record<string, number>} counts
 * @returns {Record<string, number>}
 */
export function filterMonetizationFunnelCountsForUpload(counts) {
  /** @type {Record<string, number>} */
  const out = {};
  const allowed =
    /^(support_open|support_cta:(tea|sanctuary|membership)|checkout_start:(tea|sanctuary|membership)|checkout_complete:(tea|sanctuary|membership)|checkout_cancel:tea)$/;
  for (const [k, v] of Object.entries(counts || {})) {
    if (!allowed.test(k)) continue;
    const n = Math.floor(Number(v) || 0);
    if (n > 0) out[k] = n;
  }
  return out;
}

/**
 * @param {MonetizationFunnelConsentState} consent
 * @param {Record<string, number>} counts
 * @returns {{ schemaVersion: 1, installId: string, counts: Record<string, number> } | null}
 */
export function buildMonetizationFunnelIngestPayload(consent, counts) {
  if (!consent?.optedIn) return null;
  const safe = filterMonetizationFunnelCountsForUpload(counts);
  const last = filterMonetizationFunnelCountsForUpload(
    consent.lastSentCounts || {}
  );
  const delta = monetizationFunnelCountDelta(safe, last);
  if (Object.keys(delta).length === 0) return null;
  return {
    schemaVersion: 1,
    installId: consent.installId,
    counts: delta
  };
}
