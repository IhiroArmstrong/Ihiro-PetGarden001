/**
 * Contextual Buy Yin a Tea tip bubble — frequency / dismiss gate (A-track).
 * Soft highlight offers only; does not unlock content; zero Sanctuary coupling.
 *
 * @see docs/task-briefs/task-tech-direction-v1-shell-monetization.md §2.1
 */

export const CONTEXTUAL_TEA_TIP_STORAGE_KEY =
  'focus-tiger.contextual-tea-tip.v1';

/** @typedef {'session-complete' | 'milestone'} ContextualTeaTipReason */

/** @type {readonly ContextualTeaTipReason[]} */
export const CONTEXTUAL_TEA_TIP_REASONS = Object.freeze([
  'session-complete',
  'milestone'
]);

/**
 * @typedef {{
 *   lastShownLocalDay: string | null,
 *   lastShownReason: ContextualTeaTipReason | null,
 *   lastShownAt: string | null,
 *   dismissedCount: number
 * }} ContextualTeaTipState
 */

/**
 * @param {Date | number} [now]
 * @returns {string} YYYY-MM-DD local
 */
export function localDayKey(now = Date.now()) {
  const d = now instanceof Date ? now : new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * @param {unknown} raw
 * @returns {ContextualTeaTipState}
 */
export function normalizeContextualTeaTipState(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      lastShownLocalDay: null,
      lastShownReason: null,
      lastShownAt: null,
      dismissedCount: 0
    };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const reason =
    o.lastShownReason === 'session-complete' || o.lastShownReason === 'milestone'
      ? o.lastShownReason
      : null;
  return {
    lastShownLocalDay:
      typeof o.lastShownLocalDay === 'string' && o.lastShownLocalDay
        ? o.lastShownLocalDay
        : null,
    lastShownReason: reason,
    lastShownAt:
      typeof o.lastShownAt === 'string' && o.lastShownAt ? o.lastShownAt : null,
    dismissedCount: Math.max(0, Number(o.dismissedCount) || 0)
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {ContextualTeaTipState}
 */
export function readContextualTeaTipState(storage) {
  if (!storage) return normalizeContextualTeaTipState(null);
  try {
    const raw = storage.getItem(CONTEXTUAL_TEA_TIP_STORAGE_KEY);
    if (!raw) return normalizeContextualTeaTipState(null);
    return normalizeContextualTeaTipState(JSON.parse(raw));
  } catch {
    return normalizeContextualTeaTipState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {ContextualTeaTipState} state
 */
export function writeContextualTeaTipState(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(
      CONTEXTUAL_TEA_TIP_STORAGE_KEY,
      JSON.stringify(normalizeContextualTeaTipState(state))
    );
  } catch {
    /* ignore */
  }
}

/**
 * Soft offer gate: at most once per local calendar day.
 *
 * @param {Storage | null | undefined} storage
 * @param {ContextualTeaTipReason} reason
 * @param {object} [opts]
 * @param {Date | number} [opts.now]
 * @param {boolean} [opts.busy] overlays / tip card already open
 * @returns {boolean}
 */
export function shouldOfferContextualTeaTip(
  storage,
  reason,
  { now = Date.now(), busy = false } = {}
) {
  if (busy) return false;
  if (!CONTEXTUAL_TEA_TIP_REASONS.includes(reason)) return false;
  const state = readContextualTeaTipState(storage);
  const day = localDayKey(now);
  if (state.lastShownLocalDay === day) return false;
  return true;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {ContextualTeaTipReason} reason
 * @param {object} [opts]
 * @param {Date | number} [opts.now]
 */
export function markContextualTeaTipShown(
  storage,
  reason,
  { now = Date.now() } = {}
) {
  const prev = readContextualTeaTipState(storage);
  const at = (now instanceof Date ? now : new Date(now)).toISOString();
  writeContextualTeaTipState(storage, {
    ...prev,
    lastShownLocalDay: localDayKey(now),
    lastShownReason: reason,
    lastShownAt: at
  });
}

/**
 * @param {Storage | null | undefined} storage
 */
export function markContextualTeaTipDismissed(storage) {
  const prev = readContextualTeaTipState(storage);
  writeContextualTeaTipState(storage, {
    ...prev,
    dismissedCount: prev.dismissedCount + 1
  });
}
