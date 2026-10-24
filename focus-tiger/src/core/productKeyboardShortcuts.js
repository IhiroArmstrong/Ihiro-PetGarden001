/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T44 — Space start/pause + Confide accelerator (renderer keydown).
 * PO-locked: GLOSSARY对照10. Shortcut id is centralized for future rebinding.
 */

/** @type {readonly { key: string, useMeta: boolean, useCtrl: boolean }} */
export const CONFIDE_KEYBOARD_SHORTCUT = Object.freeze({
  key: 'e',
  useMeta: true,
  useCtrl: true
});

export const PRODUCT_KEYBOARD_SPACE_DEBOUNCE_MS = 500;

/**
 * @param {EventTarget | null} target
 * @returns {boolean}
 */
export function isEditableKeyboardTarget(target) {
  if (!target || typeof target !== 'object') return false;
  const el = /** @type {{ tagName?: string, isContentEditable?: boolean, closest?: (sel: string) => unknown }} */ (
    target
  );
  const tag = String(el.tagName || '').toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  if (typeof el.closest === 'function') {
    return Boolean(el.closest('[contenteditable="true"]'));
  }
  return false;
}

/**
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
export function isProductSpaceKey(event) {
  return event.code === 'Space' || event.key === ' ';
}

/**
 * @param {KeyboardEvent} event
 * @param {typeof CONFIDE_KEYBOARD_SHORTCUT} [shortcut]
 * @returns {boolean}
 */
export function isConfideKeyboardShortcut(
  event,
  shortcut = CONFIDE_KEYBOARD_SHORTCUT
) {
  const key = String(event.key || '').toLowerCase();
  if (key !== shortcut.key) return false;
  if (event.altKey || event.shiftKey) return false;
  const mod =
    (shortcut.useMeta && event.metaKey) || (shortcut.useCtrl && event.ctrlKey);
  return mod;
}

/**
 * @param {{
 *   spaceIdleAllowed?: boolean,
 *   spaceFocusToggleAllowed?: boolean,
 *   confideAllowed?: boolean
 * }} gates
 * @param {KeyboardEvent} event
 * @returns {'space-idle' | 'space-focus-toggle' | 'confide' | null}
 */
export function resolveProductKeyboardAction(gates, event) {
  if (isEditableKeyboardTarget(event.target)) return null;
  if (isConfideKeyboardShortcut(event) && gates.confideAllowed) {
    return 'confide';
  }
  if (!isProductSpaceKey(event)) return null;
  if (gates.spaceFocusToggleAllowed) return 'space-focus-toggle';
  if (gates.spaceIdleAllowed) return 'space-idle';
  return null;
}

/**
 * @param {{
 *   getGates: () => {
 *     spaceIdleAllowed?: boolean,
 *     spaceFocusToggleAllowed?: boolean,
 *     confideAllowed?: boolean
 *   },
 *   onSpaceIdle: () => void,
 *   onSpaceFocusToggle: () => void,
 *   onConfideShortcut: () => void,
 *   debounceMs?: number,
 *   now?: () => number
 * }} options
 * @returns {() => void}
 */
export function bindProductKeyboardShortcuts(options) {
  const {
    getGates,
    onSpaceIdle,
    onSpaceFocusToggle,
    onConfideShortcut,
    debounceMs = PRODUCT_KEYBOARD_SPACE_DEBOUNCE_MS,
    now = () => Date.now()
  } = options;
  let lastSpaceAt = 0;

  const onKeyDown = (event) => {
    if (event.defaultPrevented) return;
    if (event.repeat) return;
    const gates = getGates();
    const action = resolveProductKeyboardAction(gates, event);
    if (!action) return;

    if (action === 'confide') {
      event.preventDefault();
      onConfideShortcut();
      return;
    }

    const ts = now();
    if (ts - lastSpaceAt < debounceMs) {
      event.preventDefault();
      return;
    }
    lastSpaceAt = ts;
    event.preventDefault();

    if (action === 'space-focus-toggle') {
      onSpaceFocusToggle();
      return;
    }
    onSpaceIdle();
  };

  document.addEventListener('keydown', onKeyDown, true);
  return () => document.removeEventListener('keydown', onKeyDown, true);
}
