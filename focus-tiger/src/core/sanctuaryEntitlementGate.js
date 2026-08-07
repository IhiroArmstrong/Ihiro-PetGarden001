/**
 * Yin's Sanctuary · Lifetime entitlement gate (content unlock).
 *
 * ZERO COUPLING (Brief §2.6 · code-review gate):
 * This module and consumers MUST NOT import, read, or depend on the A-track
 * tip-jar gate module or its local tip counters. Unlock decisions are
 * independent. No "prior tip ⇒ discount / bonus unlock" without a separate Brief.
 *
 * Verification: real paid unlocks require server-confirmed Checkout Session.
 * Do NOT reuse optimistic tip-return query patterns here.
 */

export const SANCTUARY_STORAGE_KEY = 'focus-tiger.sanctuary-entitlement.v1';

export const SANCTUARY_LIFETIME_ITEM_ID = 'yin-sanctuary-lifetime';

/**
 * @typedef {{
 *   unlocked: boolean,
 *   unlockedVia: 'payment' | 'preview' | null,
 *   unlockedAt: string | null,
 *   itemId: string
 * }} SanctuaryEntitlement
 */

/**
 * @param {unknown} raw
 * @returns {SanctuaryEntitlement}
 */
export function normalizeSanctuaryEntitlement(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      unlocked: false,
      unlockedVia: null,
      unlockedAt: null,
      itemId: SANCTUARY_LIFETIME_ITEM_ID
    };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const unlockedVia =
    o.unlockedVia === 'payment' || o.unlockedVia === 'preview'
      ? o.unlockedVia
      : null;
  return {
    unlocked: Boolean(o.unlocked),
    unlockedVia,
    unlockedAt:
      typeof o.unlockedAt === 'string' && o.unlockedAt ? o.unlockedAt : null,
    itemId:
      typeof o.itemId === 'string' && o.itemId
        ? o.itemId
        : SANCTUARY_LIFETIME_ITEM_ID
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {SanctuaryEntitlement}
 */
export function readSanctuaryEntitlement(storage) {
  if (!storage) return normalizeSanctuaryEntitlement(null);
  try {
    const raw = storage.getItem(SANCTUARY_STORAGE_KEY);
    if (!raw) return normalizeSanctuaryEntitlement(null);
    return normalizeSanctuaryEntitlement(JSON.parse(raw));
  } catch {
    return normalizeSanctuaryEntitlement(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {SanctuaryEntitlement} entitlement
 */
export function writeSanctuaryEntitlement(storage, entitlement) {
  if (!storage) return;
  try {
    const n = normalizeSanctuaryEntitlement(entitlement);
    storage.setItem(
      SANCTUARY_STORAGE_KEY,
      JSON.stringify({
        unlocked: Boolean(n.unlocked),
        unlockedVia: n.unlockedVia,
        unlockedAt: n.unlockedAt,
        itemId: n.itemId
      })
    );
  } catch {
    // ignore
  }
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @returns {boolean}
 */
export function isSanctuaryUnlocked({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null
} = {}) {
  return readSanctuaryEntitlement(storage).unlocked === true;
}

/**
 * Preview / lab gift only — not a payment path.
 *
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {() => Date} [opts.now]
 */
export function markSanctuaryPreview(
  storage,
  { now = () => new Date() } = {}
) {
  writeSanctuaryEntitlement(storage, {
    unlocked: true,
    unlockedVia: 'preview',
    unlockedAt: now().toISOString(),
    itemId: SANCTUARY_LIFETIME_ITEM_ID
  });
}

/**
 * Call only after server confirms Checkout Session.
 *
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {() => Date} [opts.now]
 */
export function markSanctuaryFromPayment(
  storage,
  { now = () => new Date() } = {}
) {
  writeSanctuaryEntitlement(storage, {
    unlocked: true,
    unlockedVia: 'payment',
    unlockedAt: now().toISOString(),
    itemId: SANCTUARY_LIFETIME_ITEM_ID
  });
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearSanctuaryEntitlement(storage) {
  writeSanctuaryEntitlement(storage, normalizeSanctuaryEntitlement(null));
}

/**
 * After Checkout return: read `sanctuary_session` query, confirm with server,
 * then unlock locally. Never unlock from the query alone.
 *
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => string} [opts.getSearch]
 * @param {(path: string) => void} [opts.replaceUrl]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 * @returns {Promise<{ consumed: boolean, unlocked: boolean, outcome: 'success' | 'cancel' | 'failed' | null }>}
 */
export async function confirmSanctuaryReturnQuery({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  getSearch = () =>
    typeof location !== 'undefined' ? location.search || '' : '',
  replaceUrl = (path) => {
    if (typeof history !== 'undefined' && history.replaceState) {
      history.replaceState(null, '', path);
    }
  },
  postJson
} = {}) {
  const params = new URLSearchParams(getSearch().replace(/^\?/, ''));
  const cancel = params.get('sanctuary') === 'cancel';
  const sessionId = params.get('sanctuary_session') || '';

  const strip = () => {
    params.delete('sanctuary');
    params.delete('sanctuary_session');
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
  };

  if (cancel) {
    strip();
    return { consumed: true, unlocked: false, outcome: 'cancel' };
  }
  if (!sessionId.startsWith('cs_')) {
    return { consumed: false, unlocked: false, outcome: null };
  }

  strip();

  if (typeof postJson !== 'function') {
    return { consumed: true, unlocked: false, outcome: 'failed' };
  }

  try {
    const body = await postJson('/api/confirm-sanctuary-session', {
      body: JSON.stringify({ sessionId })
    });
    const unlocked =
      body &&
      typeof body === 'object' &&
      /** @type {{ unlocked?: unknown }} */ (body).unlocked === true;
    if (unlocked) {
      markSanctuaryFromPayment(storage);
      return { consumed: true, unlocked: true, outcome: 'success' };
    }
    return { consumed: true, unlocked: false, outcome: 'failed' };
  } catch {
    return { consumed: true, unlocked: false, outcome: 'failed' };
  }
}
