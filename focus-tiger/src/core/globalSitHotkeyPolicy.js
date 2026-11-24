/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Global sit hotkey rules (T101). No Electron import — unit-testable.
 * Default must not include Control+Option (VoiceOver) or Control+Shift+Y (T10).
 */

export const DEFAULT_GLOBAL_SIT_ACCELERATOR = 'Command+Control+Shift+S';

export const T10_VOICE_PTT_ACCELERATOR = 'Control+Shift+Y';

export const GLOBAL_SIT_HOTKEY_MINUTES = 5;

/** @type {ReadonlySet<string>} */
const MODIFIER_CANON = new Set(['Command', 'Control', 'Option', 'Alt', 'Shift', 'Super', 'Meta']);

const MODIFIER_ORDER = Object.freeze([
  'Control',
  'Option',
  'Alt',
  'Shift',
  'Command',
  'Super',
  'Meta'
]);

/**
 * @param {string} token
 * @returns {string}
 */
function canonToken(token) {
  const raw = String(token || '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (lower === 'cmd' || lower === 'command' || lower === 'meta' || lower === 'super') {
    return lower === 'super' ? 'Super' : lower === 'meta' ? 'Meta' : 'Command';
  }
  if (lower === 'ctrl' || lower === 'control') return 'Control';
  if (lower === 'alt' || lower === 'option') return lower === 'alt' ? 'Alt' : 'Option';
  if (lower === 'shift') return 'Shift';
  if (raw.length === 1) return raw.toUpperCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeAccelerator(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  const parts = text.split('+').map(canonToken).filter(Boolean);
  if (parts.length < 2) return '';
  const key = parts[parts.length - 1];
  if (MODIFIER_CANON.has(key)) return '';
  const mods = parts.slice(0, -1).filter((p) => MODIFIER_CANON.has(p));
  if (mods.length !== parts.length - 1) return '';
  const unique = [...new Set(mods)];
  unique.sort(
    (a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b)
  );
  return `${unique.join('+')}+${key}`;
}

/**
 * @param {string} accelerator
 * @returns {boolean}
 */
export function acceleratorUsesControlAndOption(accelerator) {
  const parts = new Set(normalizeAccelerator(accelerator).split('+'));
  const hasControl = parts.has('Control');
  const hasOption = parts.has('Option') || parts.has('Alt');
  return hasControl && hasOption;
}

/**
 * @param {string} accelerator
 * @returns {boolean}
 */
export function acceleratorIsT10VoicePtt(accelerator) {
  return normalizeAccelerator(accelerator) === T10_VOICE_PTT_ACCELERATOR;
}

/**
 * @typedef {'ok' | 'empty' | 'control-option' | 't10-reserved' | 'invalid'} GlobalSitHotkeyRejectReason
 */

/**
 * @param {unknown} raw
 * @returns {{
 *   ok: boolean,
 *   accelerator: string,
 *   reason: GlobalSitHotkeyRejectReason
 * }}
 */
export function validateGlobalSitAccelerator(raw) {
  const accelerator = normalizeAccelerator(raw);
  if (!accelerator) {
    return {
      ok: false,
      accelerator: '',
      reason: String(raw || '').trim() ? 'invalid' : 'empty'
    };
  }
  if (acceleratorUsesControlAndOption(accelerator)) {
    return { ok: false, accelerator, reason: 'control-option' };
  }
  if (acceleratorIsT10VoicePtt(accelerator)) {
    return { ok: false, accelerator, reason: 't10-reserved' };
  }
  return { ok: true, accelerator, reason: 'ok' };
}

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function resolveGlobalSitAccelerator(raw) {
  const checked = validateGlobalSitAccelerator(raw);
  return checked.ok ? checked.accelerator : DEFAULT_GLOBAL_SIT_ACCELERATOR;
}

/**
 * @param {{
 *   key?: string,
 *   code?: string,
 *   ctrlKey?: boolean,
 *   altKey?: boolean,
 *   shiftKey?: boolean,
 *   metaKey?: boolean
 * } | null | undefined} eventLike
 * @returns {string}
 */
export function acceleratorFromKeyEvent(eventLike) {
  const e = eventLike && typeof eventLike === 'object' ? eventLike : {};
  const mods = [];
  if (e.ctrlKey) mods.push('Control');
  if (e.altKey) mods.push('Option');
  if (e.shiftKey) mods.push('Shift');
  if (e.metaKey) mods.push('Command');
  let key = '';
  const rawKey = String(e.key || '');
  if (rawKey.length === 1 && /[a-zA-Z0-9]/.test(rawKey)) {
    key = rawKey.toUpperCase();
  } else if (/^Key[A-Z]$/.test(String(e.code || ''))) {
    key = String(e.code).slice(3);
  }
  if (!mods.length || !key) return '';
  return normalizeAccelerator(`${mods.join('+')}+${key}`);
}

export function globalSitPracticeSearch() {
  return `product=1&start=sit&min=${GLOBAL_SIT_HOTKEY_MINUTES}`;
}

export function globalSitPracticeUrl() {
  return `focus-tiger://app/?${globalSitPracticeSearch()}`;
}
