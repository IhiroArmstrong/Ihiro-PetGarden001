/**
 * Mindful Reflection Echo — observational companion lines (not coaching).
 * Pool selected by local calendar day + light salt (stable within a day, varies across answers).
 */

export const REFLECTION_ECHO_KEYS = Object.freeze([
  'REFLECTION_ECHO_1',
  'REFLECTION_ECHO_2',
  'REFLECTION_ECHO_3',
  'REFLECTION_ECHO_4',
  'REFLECTION_ECHO_5',
  'REFLECTION_ECHO_6',
  'REFLECTION_ECHO_7'
]);

/**
 * @param {string} [raw]
 * @returns {boolean}
 */
export function shouldShowReflectionEcho(raw) {
  return typeof raw === 'string' && raw.trim().length > 0;
}

/**
 * @param {string} isoDate YYYY-MM-DD local
 * @returns {number}
 */
export function localDateSeed(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate || ''));
  if (!m) return 0;
  return Number(m[1]) * 372 + Number(m[2]) * 31 + Number(m[3]);
}

/**
 * @param {object} [opts]
 * @param {string} [opts.localDate] YYYY-MM-DD
 * @param {number} [opts.salt] e.g. stepIndex or answer length
 * @param {readonly string[]} [opts.keys]
 * @returns {string | null} locale key, or null if pool empty
 */
export function pickReflectionEchoKey({
  localDate = '',
  salt = 0,
  keys = REFLECTION_ECHO_KEYS
} = {}) {
  if (!keys?.length) return null;
  const n = keys.length;
  const idx = Math.abs(localDateSeed(localDate) + (Number(salt) || 0)) % n;
  return keys[idx];
}

/**
 * @param {() => Date} [now]
 * @returns {string} YYYY-MM-DD in local time
 */
export function formatLocalDateYmd(now = () => new Date()) {
  const d = now();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
