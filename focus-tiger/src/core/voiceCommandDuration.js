/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Voice command duration rules (Brief B · Slice 0).
 * English keyword + duration only. No model, no microphone, no start-session call.
 */

/** Fixed-length start, or open-ended count-up. */
export const VOICE_DURATION_MODES = Object.freeze({
  fixed: 'fixed',
  open: 'open'
});

const MAX_MINUTES = 24 * 60;
const POMODORO_MINUTES = 25;

const WORD_NUMBERS = Object.freeze({
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fortyfive: 45,
  fifty: 50,
  sixty: 60,
  ninety: 90
});

/**
 * @typedef {'start' | 'ask_duration' | 'refuse' | 'unsupported'} VoiceCommandAction
 * @typedef {'fixed' | 'open'} VoiceDurationMode
 * @typedef {{
 *   action: VoiceCommandAction,
 *   durationMode?: VoiceDurationMode,
 *   minutes?: number,
 *   reason?: string
 * }} VoiceCommandParse
 */

/**
 * @param {unknown} text
 * @returns {VoiceCommandParse}
 */
export function parseVoiceCommandDuration(text) {
  const normalized = normalizeUtterance(text);
  if (!normalized) return { action: 'refuse', reason: 'empty' };
  if (isBareStopOrCancel(normalized)) {
    return { action: 'unsupported', reason: 'stop_not_in_v1' };
  }
  if (!hasFocusIntent(normalized)) {
    return { action: 'refuse', reason: 'unknown' };
  }

  const openEnded = hasOpenEndedMarker(normalized);
  const minutes = extractMinutes(normalized);
  if (minutes === 'ambiguous' || (openEnded && typeof minutes === 'number')) {
    return { action: 'refuse', reason: 'ambiguous' };
  }
  if (typeof minutes === 'number' && (minutes < 1 || minutes > MAX_MINUTES)) {
    return { action: 'refuse', reason: 'over_cap' };
  }
  if (openEnded) {
    return { action: 'start', durationMode: VOICE_DURATION_MODES.open };
  }
  if (typeof minutes === 'number') {
    return {
      action: 'start',
      durationMode: VOICE_DURATION_MODES.fixed,
      minutes
    };
  }
  if (hasPomodoro(normalized)) {
    return {
      action: 'start',
      durationMode: VOICE_DURATION_MODES.fixed,
      minutes: POMODORO_MINUTES
    };
  }
  return { action: 'ask_duration' };
}

/**
 * @param {unknown} text
 * @returns {string}
 */
function normalizeUtterance(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string} normalized
 * @returns {boolean}
 */
function isBareStopOrCancel(normalized) {
  return /^(please )?(stop|cancel)( please)?$/.test(normalized);
}

/**
 * @param {string} normalized
 * @returns {boolean}
 */
function hasFocusIntent(normalized) {
  return /\bfocus(?:ing)?\b/.test(normalized) || hasPomodoro(normalized);
}

/**
 * @param {string} normalized
 * @returns {boolean}
 */
function hasPomodoro(normalized) {
  return /\bpomodoro\b/.test(normalized);
}

/**
 * @param {string} normalized
 * @returns {boolean}
 */
function hasOpenEndedMarker(normalized) {
  return (
    /\bopen ended\b/.test(normalized) ||
    /\bno time limit\b/.test(normalized) ||
    /\bunlimited\b/.test(normalized)
  );
}

/**
 * @param {string} normalized
 * @returns {number | 'ambiguous' | null}
 */
function extractMinutes(normalized) {
  /** @type {number[]} */
  const found = [];

  const minuteRe = /\b(\d+|an|a|one|twenty five|forty five|fifteen|ten|thirty|forty|fifty|sixty|ninety|zero)\s+minutes?\b/g;
  const minRe = /\b(\d+)\s+mins?\b/g;
  const hourRe = /\b(\d+|an|a|one)\s+hours?\b/g;

  for (const match of normalized.matchAll(minuteRe)) {
    const n = tokenToNumber(match[1]);
    if (n == null) return 'ambiguous';
    found.push(n);
  }
  for (const match of normalized.matchAll(minRe)) {
    found.push(Number(match[1]));
  }
  for (const match of normalized.matchAll(hourRe)) {
    const n = tokenToNumber(match[1]);
    if (n == null) return 'ambiguous';
    found.push(n * 60);
  }

  const unique = [...new Set(found)];
  if (unique.length > 1) return 'ambiguous';
  if (unique.length === 1) return unique[0];
  return null;
}

/**
 * @param {string} token
 * @returns {number | null}
 */
function tokenToNumber(token) {
  if (/^\d+$/.test(token)) return Number(token);
  if (token === 'a' || token === 'an') return 1;
  const key = token.replace(/\s+/g, '');
  return Object.prototype.hasOwnProperty.call(WORD_NUMBERS, key) ? WORD_NUMBERS[key] : null;
}
