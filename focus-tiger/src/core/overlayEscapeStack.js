/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Escape dismiss stack — only the topmost registered layer closes on Esc.
 * Prevents chained closes (e.g. menu + Reflection both dismissing).
 */

/** @typedef {{ id: string, dismiss: () => void }} OverlayEscapeLayer */

/** @type {OverlayEscapeLayer[]} */
const stack = [];

let bound = false;

/**
 * @param {KeyboardEvent} event
 * @returns {boolean} true when a layer was dismissed
 */
export function dispatchOverlayEscape(event) {
  if (event.key !== 'Escape') return false;
  const top = stack[stack.length - 1];
  if (!top) return false;
  top.dismiss();
  event.preventDefault();
  event.stopImmediatePropagation();
  return true;
}

/**
 * One global capture listener for the product shell.
 * @returns {void}
 */
export function ensureOverlayEscapeListener() {
  if (bound) return;
  if (typeof document === 'undefined') return;
  document.addEventListener('keydown', dispatchOverlayEscape, true);
  bound = true;
}

/**
 * @param {{ id: string, dismiss: () => void }} layer
 * @returns {() => void} pop — call on close/dispose
 */
export function pushOverlayEscapeLayer({ id, dismiss }) {
  const layer = { id: String(id || 'overlay'), dismiss };
  stack.push(layer);
  return () => {
    const idx = stack.lastIndexOf(layer);
    if (idx >= 0) stack.splice(idx, 1);
  };
}

/**
 * Test helper — clear stack between cases.
 * @returns {void}
 */
export function resetOverlayEscapeStackForTests() {
  stack.length = 0;
}

/**
 * @returns {string[]}
 */
export function peekOverlayEscapeStackIds() {
  return stack.map((layer) => layer.id);
}
