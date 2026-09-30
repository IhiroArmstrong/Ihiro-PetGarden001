/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Mid-sit pause / add-minutes phrases (Brief task-focus-sit-adjust).
 * English whole-utterance rules. Does not end a sit.
 */

/**
 * @typedef {'pause' | 'resume' | 'add' | 'refuse'} FocusSitAdjustKind
 * @typedef {{
 *   kind: FocusSitAdjustKind,
 *   minutes?: number,
 *   reason?: string
 * }} FocusSitAdjustParse
 */

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
 * @param {unknown} text
 * @returns {FocusSitAdjustParse}
 */
export function parseFocusSitAdjust(text) {
  const normalized = normalizeUtterance(text);
  if (!normalized) return { kind: 'refuse', reason: 'empty' };
  if (
    /^(please )?(im done|i am done|end( this)? focus|rise|stop|cancel)( please)?$/.test(
      normalized
    )
  ) {
    return { kind: 'refuse', reason: 'use_rise' };
  }
  if (/^(please )?(pause|pause the timer|pause this sit)( please)?$/.test(normalized)) {
    return { kind: 'pause' };
  }
  if (/^(please )?(resume|resume the timer)( please)?$/.test(normalized)) {
    return { kind: 'resume' };
  }
  const add = normalized.match(/^(?:please )?add (5|10|five|ten) minutes(?: please)?$/);
  if (add) {
    const token = add[1];
    const minutes = token === '5' || token === 'five' ? 5 : 10;
    return { kind: 'add', minutes };
  }
  return { kind: 'refuse', reason: 'unknown' };
}

/**
 * @param {{
 *   isPaused: () => boolean,
 *   isRunning: boolean,
 *   isOpenEnded: () => boolean,
 *   pause: () => void,
 *   resume: () => void,
 *   extendTargetMinutes: (n: number) => { applied: boolean, kind: 'add', reason?: string, minutes?: number }
 * }} session
 * @param {FocusSitAdjustParse} parsed
 */
export function applyFocusSitAdjust(session, parsed) {
  if (parsed.kind === 'pause') {
    if (session.isPaused()) return { applied: false, kind: 'pause', reason: 'already_paused' };
    if (!session.isRunning) return { applied: false, kind: 'pause', reason: 'not_running' };
    session.pause();
    return { applied: true, kind: 'pause' };
  }
  if (parsed.kind === 'resume') {
    if (!session.isPaused()) return { applied: false, kind: 'resume', reason: 'not_paused' };
    session.resume();
    return { applied: true, kind: 'resume' };
  }
  if (parsed.kind === 'add') {
    return session.extendTargetMinutes(parsed.minutes || 0);
  }
  return { applied: false, kind: 'refuse', reason: parsed.reason || 'unknown' };
}

/**
 * @param {{ applied?: boolean, kind?: string, reason?: string, minutes?: number }} result
 * @returns {{ key: string, minutes?: number }}
 */
export function focusSitAdjustStatus(result) {
  if (result.reason === 'use_rise') return { key: 'VOICE_ADJUST_USE_RISE' };
  if (result.reason === 'open_ended') return { key: 'FOCUS_SIT_OPEN_NO_ADD' };
  if (result.reason === 'at_cap') return { key: 'FOCUS_SIT_AT_CAP' };
  if (result.kind === 'pause' || result.reason === 'already_paused') {
    return { key: 'FOCUS_SIT_PAUSED' };
  }
  if (result.kind === 'resume' || result.reason === 'not_paused') {
    return { key: 'FOCUS_SIT_RESUMED' };
  }
  if (result.kind === 'add' && result.applied) {
    return { key: 'FOCUS_SIT_ADDED', minutes: result.minutes };
  }
  return { key: 'VOICE_ADJUST_REFUSE' };
}
