/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/** Helper stdout may only carry these keys. */
export const INPUT_RHYTHM_ALLOWED_KEYS = Object.freeze([
  'ok',
  't',
  'keys',
  'backs',
  'switches',
  'error'
]);

export const INPUT_RHYTHM_FORBIDDEN_KEY =
  /keycode|keyCode|chars?|character|title|text|window|appName|bundle|string|paste/i;

/**
 * @param {unknown} raw
 * @returns {{
 *   ok: boolean,
 *   t: number,
 *   keys: number,
 *   backs: number,
 *   switches: number,
 *   error: string | null
 * } | null}
 */
export function sanitizeInputRhythmLine(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  for (const key of Object.keys(raw)) {
    if (INPUT_RHYTHM_FORBIDDEN_KEY.test(key)) return null;
    if (!INPUT_RHYTHM_ALLOWED_KEYS.includes(key)) return null;
  }
  const ok = raw.ok !== false;
  const error = typeof raw.error === 'string' ? raw.error : null;
  if (!ok) {
    return {
      ok: false,
      t: Number(raw.t) || 0,
      keys: 0,
      backs: 0,
      switches: 0,
      error: error || 'denied'
    };
  }
  return {
    ok: true,
    t: Number(raw.t) || 0,
    keys: Math.max(0, Math.floor(Number(raw.keys) || 0)),
    backs: Math.max(0, Math.floor(Number(raw.backs) || 0)),
    switches: Math.max(0, Math.floor(Number(raw.switches) || 0)),
    error: null
  };
}

/**
 * @param {string} line
 * @returns {ReturnType<typeof sanitizeInputRhythmLine>}
 */
export function parseInputRhythmStdoutLine(line) {
  const text = String(line || '').trim();
  if (!text) return null;
  try {
    return sanitizeInputRhythmLine(JSON.parse(text));
  } catch {
    return null;
  }
}
