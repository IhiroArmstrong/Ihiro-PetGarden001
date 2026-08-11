/**
 * Monetization intent funnel · opt-in consent (default off).
 * @see docs/task-briefs/task-monetization-intent-funnel-opt-in.md
 * @see docs/MVP_PRODUCT_DEFINITION.md §六
 */

export const MONETIZATION_FUNNEL_OPT_IN_STORAGE_KEY =
  'focus-tiger.monetization-funnel-opt-in.v1';

/**
 * @typedef {{
 *   enabled: boolean,
 *   consentedAt: string | null,
 *   clientId: string | null,
 *   lastUploadAt: string | null,
 *   lastUploadError: string | null
 * }} MonetizationFunnelOptInState
 */

/**
 * @param {unknown} raw
 * @returns {MonetizationFunnelOptInState}
 */
export function normalizeMonetizationFunnelOptInState(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      enabled: false,
      consentedAt: null,
      clientId: null,
      lastUploadAt: null,
      lastUploadError: null
    };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  return {
    enabled: o.enabled === true,
    consentedAt:
      typeof o.consentedAt === 'string' && o.consentedAt ? o.consentedAt : null,
    clientId:
      typeof o.clientId === 'string' && o.clientId.trim()
        ? o.clientId.trim()
        : null,
    lastUploadAt:
      typeof o.lastUploadAt === 'string' && o.lastUploadAt
        ? o.lastUploadAt
        : null,
    lastUploadError:
      typeof o.lastUploadError === 'string' && o.lastUploadError
        ? o.lastUploadError
        : null
  };
}

function getDefaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {MonetizationFunnelOptInState}
 */
export function readMonetizationFunnelOptInState(storage) {
  if (!storage) return normalizeMonetizationFunnelOptInState(null);
  try {
    const raw = storage.getItem(MONETIZATION_FUNNEL_OPT_IN_STORAGE_KEY);
    if (!raw) return normalizeMonetizationFunnelOptInState(null);
    return normalizeMonetizationFunnelOptInState(JSON.parse(raw));
  } catch {
    return normalizeMonetizationFunnelOptInState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {MonetizationFunnelOptInState} state
 */
export function writeMonetizationFunnelOptInState(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(
      MONETIZATION_FUNNEL_OPT_IN_STORAGE_KEY,
      JSON.stringify(normalizeMonetizationFunnelOptInState(state))
    );
  } catch {
    /* ignore */
  }
}

/**
 * @returns {string}
 */
export function createMonetizationFunnelClientId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `ft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Ensure a stable anonymous clientId when enabling (or reading while enabled).
 * @param {Storage | null | undefined} storage
 * @param {() => Date} [now]
 * @returns {MonetizationFunnelOptInState}
 */
export function ensureMonetizationFunnelClientId(
  storage,
  now = () => new Date()
) {
  const state = readMonetizationFunnelOptInState(storage);
  if (state.clientId) return state;
  const next = {
    ...state,
    clientId: createMonetizationFunnelClientId()
  };
  // Do not invent consentedAt just for id mint.
  void now;
  writeMonetizationFunnelOptInState(storage, next);
  return next;
}

/**
 * Explicit consent on/off. Default off. Enabling mints clientId + consentedAt.
 * @param {Storage | null | undefined} storage
 * @param {boolean} enabled
 * @param {() => Date} [now]
 * @returns {MonetizationFunnelOptInState}
 */
export function setMonetizationFunnelOptIn(
  storage,
  enabled,
  now = () => new Date()
) {
  const prev = readMonetizationFunnelOptInState(storage);
  if (enabled) {
    const next = {
      enabled: true,
      consentedAt: prev.consentedAt || now().toISOString(),
      clientId: prev.clientId || createMonetizationFunnelClientId(),
      lastUploadAt: prev.lastUploadAt,
      lastUploadError: prev.lastUploadError
    };
    writeMonetizationFunnelOptInState(storage, next);
    return next;
  }
  const next = {
    ...prev,
    enabled: false
  };
  writeMonetizationFunnelOptInState(storage, next);
  return next;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {boolean}
 */
export function isMonetizationFunnelOptInEnabled(storage) {
  return readMonetizationFunnelOptInState(storage).enabled === true;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ at?: string | null, error?: string | null }} patch
 * @returns {MonetizationFunnelOptInState}
 */
export function patchMonetizationFunnelUploadMeta(storage, patch = {}) {
  const prev = readMonetizationFunnelOptInState(storage);
  const next = {
    ...prev,
    lastUploadAt:
      patch.at === undefined
        ? prev.lastUploadAt
        : patch.at
          ? String(patch.at)
          : null,
    lastUploadError:
      patch.error === undefined
        ? prev.lastUploadError
        : patch.error
          ? String(patch.error)
          : null
  };
  writeMonetizationFunnelOptInState(storage, next);
  return next;
}
