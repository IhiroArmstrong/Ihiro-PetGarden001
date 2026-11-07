/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T81 — Practice Study consent store (independent of T54 Privacy).
 * T82 UI writes here; until then default off. Lab fixture is explicit test-only.
 */

export const CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY =
  'focus-tiger.co-practice-research-consent.v1';

/** DEV / unit-test fixture — must stay off in production builds (never auto-read on boot). */
export const CO_PRACTICE_RESEARCH_DEV_FIXTURE_KEY =
  'focus-tiger.dev-co-practice-research-consent-fixture.v1';

export const CO_PRACTICE_RESEARCH_CONSENT_VERSION = 1;

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * @param {unknown} storage
 * @returns {Storage | null}
 */
function resolveStorage(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} raw
 */
export function isCoPracticeResearchStudyId(raw) {
  return typeof raw === 'string' && UUID_V4_RE.test(raw.trim());
}

/**
 * @param {unknown} raw
 * @returns {{
 *   granted: boolean,
 *   consentedAt: string | null,
 *   studyId: string | null,
 *   consentVersion: number,
 *   tier2: boolean
 * }}
 */
export function normalizeCoPracticeResearchConsent(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      granted: false,
      consentedAt: null,
      studyId: null,
      consentVersion: CO_PRACTICE_RESEARCH_CONSENT_VERSION,
      tier2: false
    };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const studyId =
    typeof o.studyId === 'string' && isCoPracticeResearchStudyId(o.studyId)
      ? o.studyId.trim()
      : null;
  return {
    granted: o.granted === true,
    consentedAt:
      typeof o.consentedAt === 'string' && o.consentedAt ? o.consentedAt : null,
    studyId,
    consentVersion:
      typeof o.consentVersion === 'number' && o.consentVersion >= 1
        ? Math.floor(o.consentVersion)
        : CO_PRACTICE_RESEARCH_CONSENT_VERSION,
    tier2: o.tier2 === true
  };
}

/**
 * @param {Storage | null | undefined} storage
 */
export function readCoPracticeResearchConsent(storage) {
  const store = resolveStorage(storage);
  if (!store) return normalizeCoPracticeResearchConsent(null);
  try {
    const raw = store.getItem(CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY);
    if (!raw) return normalizeCoPracticeResearchConsent(null);
    return normalizeCoPracticeResearchConsent(JSON.parse(raw));
  } catch {
    return normalizeCoPracticeResearchConsent(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function hasCoPracticeResearchConsent(storage) {
  const state = readCoPracticeResearchConsent(storage);
  return state.granted === true && Boolean(state.studyId);
}

function mintStudyId() {
  try {
    if (globalThis.crypto?.randomUUID) {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return '00000000-0000-4000-8000-000000000000';
}

/**
 * Lab / tests only — not called from product UI in this slice.
 *
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {string} [opts.studyId]
 * @param {() => Date} [opts.now]
 * @param {boolean} [opts.tier2]
 */
export function grantCoPracticeResearchConsent(storage, opts = {}) {
  const store = resolveStorage(storage);
  const now = opts.now ? opts.now() : new Date();
  const prev = readCoPracticeResearchConsent(store);
  const studyId =
    opts.studyId && isCoPracticeResearchStudyId(opts.studyId)
      ? opts.studyId.trim()
      : prev.studyId && isCoPracticeResearchStudyId(prev.studyId)
        ? prev.studyId
        : mintStudyId();
  const next = {
    granted: true,
    consentedAt: prev.consentedAt || now.toISOString(),
    studyId,
    consentVersion: CO_PRACTICE_RESEARCH_CONSENT_VERSION,
    tier2: opts.tier2 === true
  };
  if (store) {
    try {
      store.setItem(CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

/**
 * Clears local consent + studyId. Returns prior studyId for DELETE Bearer (may be null).
 *
 * @param {Storage | null | undefined} storage
 */
export function revokeCoPracticeResearchConsent(storage) {
  const store = resolveStorage(storage);
  const prev = readCoPracticeResearchConsent(store);
  const studyId = prev.studyId;
  if (store) {
    try {
      store.removeItem(CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  return { studyId, revoked: true };
}
