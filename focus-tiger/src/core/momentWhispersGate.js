/**
 * Moment Whisper seen-gate (Task A′).
 * Key: focus-tiger.moment-whispers-seen.v1
 */

export const MOMENT_WHISPERS_SEEN_KEY = 'focus-tiger.moment-whispers-seen.v1';

/** @typedef {'arrive' | 'focus' | 'recover' | 'transition' | 'reflect'} MomentWhisperKey */

/** @type {readonly MomentWhisperKey[]} */
export const MOMENT_WHISPER_KEYS = Object.freeze([
  'arrive',
  'focus',
  'recover',
  'transition',
  'reflect'
]);

/**
 * Runtime-playable moments. `transition` stays registered until Transition ships.
 * Active Recover (Tiger Anchor) is live → `recover` may play.
 * @type {ReadonlySet<MomentWhisperKey>}
 */
export const MOMENT_WHISPER_PLAYABLE = Object.freeze(
  new Set(/** @type {MomentWhisperKey[]} */ (['arrive', 'focus', 'recover', 'reflect']))
);

/**
 * @param {unknown} raw
 * @returns {Record<string, boolean>}
 */
export function normalizeMomentWhispersSeen(raw) {
  /** @type {Record<string, boolean>} */
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  const o = /** @type {Record<string, unknown>} */ (raw);
  for (const key of MOMENT_WHISPER_KEYS) {
    if (o[key] === true || o[key] === '1' || o[key] === 1) out[key] = true;
  }
  return out;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {Record<string, boolean>}
 */
export function readMomentWhispersSeen(storage) {
  if (!storage?.getItem) return {};
  try {
    const raw = storage.getItem(MOMENT_WHISPERS_SEEN_KEY);
    if (!raw) return {};
    return normalizeMomentWhispersSeen(JSON.parse(raw));
  } catch {
    return {};
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {Record<string, boolean>} state
 */
export function writeMomentWhispersSeen(storage, state) {
  if (!storage?.setItem) return;
  try {
    storage.setItem(MOMENT_WHISPERS_SEEN_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {MomentWhisperKey | string} key
 * @returns {boolean}
 */
export function hasSeenMomentWhisper(storage, key) {
  return readMomentWhispersSeen(storage)[key] === true;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {MomentWhisperKey | string} key
 */
export function markMomentWhisperSeen(storage, key) {
  if (!MOMENT_WHISPER_KEYS.includes(/** @type {MomentWhisperKey} */ (key))) {
    return;
  }
  const next = { ...readMomentWhispersSeen(storage), [key]: true };
  writeMomentWhispersSeen(storage, next);
}

/**
 * Pure gate: may this whisper play now?
 * @param {Storage | null | undefined} storage
 * @param {MomentWhisperKey | string} key
 * @param {{ busy?: boolean }} [opts]
 * @returns {boolean}
 */
export function shouldShowMomentWhisper(storage, key, opts = {}) {
  if (!MOMENT_WHISPER_PLAYABLE.has(/** @type {MomentWhisperKey} */ (key))) {
    return false;
  }
  if (hasSeenMomentWhisper(storage, key)) return false;
  if (opts.busy) return false;
  return true;
}
