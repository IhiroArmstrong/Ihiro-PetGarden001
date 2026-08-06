/**
 * Founder Supporter Pack · local status gate (badge / memorial only).
 *
 * ---------------------------------------------------------------------------
 * VERIFICATION STRENGTH (read before reusing this gate)
 * ---------------------------------------------------------------------------
 * This verification strength is intended ONLY for badge-class unlocks with no
 * substantive content value (static badge + memorial copy).
 *
 * Optimistic local write: landing with `?supporter=1` marks the device as a
 * supporter without proving a Stripe session. Anyone can spoof that query.
 * That is an accepted trade-off for emotional/badge recognition — same restraint
 * class as flowerWelcomeGate flags (not an anti-cheat design).
 *
 * If this gate is later used to unlock real paid content (sound packs, advanced
 * emotion animations, etc.), you MUST first add
 * `POST /api/confirm-checkout-session` (server-side session validation) before
 * writing local unlock state. Do not extend optimistic `?supporter=1` to those.
 * ---------------------------------------------------------------------------
 */

export const SUPPORTER_STORAGE_KEY = 'focus-tiger.supporter-status.v1';

/** Product list price (USD). Stripe Price ID is configured on the Worker. */
export const FOUNDER_PACK_PRICE_USD = '9.99';

/**
 * @typedef {{
 *   supporter: boolean,
 *   email: string | null,
 *   purchasedAt: string | null,
 *   verifiedAt: string | null,
 *   source: 'checkout-return' | 'email-restore' | 'manual' | null
 * }} SupporterStatus
 */

/**
 * @param {unknown} raw
 * @returns {SupporterStatus}
 */
export function normalizeSupporterStatus(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      supporter: false,
      email: null,
      purchasedAt: null,
      verifiedAt: null,
      source: null
    };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const source =
    o.source === 'checkout-return' ||
    o.source === 'email-restore' ||
    o.source === 'manual'
      ? o.source
      : null;
  return {
    supporter: Boolean(o.supporter),
    email: typeof o.email === 'string' && o.email ? o.email : null,
    purchasedAt:
      typeof o.purchasedAt === 'string' && o.purchasedAt ? o.purchasedAt : null,
    verifiedAt:
      typeof o.verifiedAt === 'string' && o.verifiedAt ? o.verifiedAt : null,
    source
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {SupporterStatus}
 */
export function readSupporterStatus(storage) {
  if (!storage) return normalizeSupporterStatus(null);
  try {
    const raw = storage.getItem(SUPPORTER_STORAGE_KEY);
    if (!raw) return normalizeSupporterStatus(null);
    return normalizeSupporterStatus(JSON.parse(raw));
  } catch {
    return normalizeSupporterStatus(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {SupporterStatus} status
 */
export function writeSupporterStatus(storage, status) {
  if (!storage) return;
  try {
    const normalized = normalizeSupporterStatus(status);
    storage.setItem(
      SUPPORTER_STORAGE_KEY,
      JSON.stringify({
        supporter: Boolean(normalized.supporter),
        email: normalized.email,
        purchasedAt: normalized.purchasedAt,
        verifiedAt: normalized.verifiedAt,
        source: normalized.source
      })
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
export function isSupporter({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null
} = {}) {
  return readSupporterStatus(storage).supporter === true;
}

/**
 * Optimistic mark after Stripe success_url redirect (`?supporter=1`).
 * See file header: NOT sufficient for real paid content unlocks.
 *
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {string | null} [opts.email]
 * @param {() => Date} [opts.now]
 */
export function markSupporterFromCheckoutReturn(
  storage,
  { email = null, now = () => new Date() } = {}
) {
  const prev = readSupporterStatus(storage);
  writeSupporterStatus(storage, {
    supporter: true,
    email: email || prev.email,
    purchasedAt: prev.purchasedAt || now().toISOString(),
    verifiedAt: now().toISOString(),
    source: 'checkout-return'
  });
}

/**
 * After POST /api/verify-supporter hits.
 *
 * @param {Storage | null | undefined} storage
 * @param {object} opts
 * @param {string} opts.email
 * @param {string | null} [opts.purchasedAt]
 * @param {() => Date} [opts.now]
 */
export function markSupporterFromEmailRestore(
  storage,
  { email, purchasedAt = null, now = () => new Date() }
) {
  writeSupporterStatus(storage, {
    supporter: true,
    email: String(email || '').trim().toLowerCase() || null,
    purchasedAt: purchasedAt || now().toISOString(),
    verifiedAt: now().toISOString(),
    source: 'email-restore'
  });
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearSupporterStatus(storage) {
  writeSupporterStatus(storage, normalizeSupporterStatus(null));
}

/**
 * Consume `?supporter=1` / `supporter=cancel` from the URL and update storage.
 * Returns what happened so UI can toast once.
 *
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {string} [opts.search]
 * @param {(url: string) => void} [opts.replaceUrl] history.replaceState helper
 * @param {() => Date} [opts.now]
 * @returns {{ consumed: boolean, outcome: 'success' | 'cancel' | null }}
 */
export function consumeSupporterReturnQuery({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  search = typeof location !== 'undefined' ? location.search : '',
  replaceUrl = (next) => {
    if (typeof history !== 'undefined' && typeof location !== 'undefined') {
      history.replaceState(null, '', next);
    }
  },
  now = () => new Date()
} = {}) {
  const params = new URLSearchParams(
    String(search || '').startsWith('?')
      ? String(search).slice(1)
      : String(search || '')
  );
  const flag = params.get('supporter');
  if (flag !== '1' && flag !== 'success' && flag !== 'cancel') {
    return { consumed: false, outcome: null };
  }

  const outcome =
    flag === 'cancel' ? 'cancel' : /** @type {'success'} */ ('success');

  if (outcome === 'success') {
    markSupporterFromCheckoutReturn(storage, { now });
  }

  params.delete('supporter');
  const qs = params.toString();
  const path =
    typeof location !== 'undefined'
      ? `${location.pathname}${qs ? `?${qs}` : ''}${location.hash || ''}`
      : qs
        ? `?${qs}`
        : '/';
  try {
    replaceUrl(path);
  } catch {
    // ignore
  }

  return { consumed: true, outcome };
}

/**
 * @returns {string} Cloud API base without trailing slash, or "" if unset.
 */
export function getCloudApiBaseUrl() {
  try {
    const raw = String(import.meta.env?.VITE_CLOUD_API_BASE_URL || '').trim();
    return raw.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

/**
 * @param {string} path e.g. "/api/create-checkout-session"
 * @param {RequestInit} [init]
 */
export async function postCloudJson(path, init = {}) {
  const base = getCloudApiBaseUrl();
  if (!base) {
    throw new Error('cloud_api_unconfigured');
  }
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {})
    },
    ...init
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const detail =
      body && typeof body === 'object' && 'detail' in body
        ? String(/** @type {{ detail?: unknown }} */ (body).detail || '')
        : `HTTP ${res.status}`;
    const err = new Error(detail || `HTTP ${res.status}`);
    /** @type {any} */ (err).status = res.status;
    /** @type {any} */ (err).body = body;
    throw err;
  }
  return body;
}
