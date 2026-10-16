/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A8 · Page guardrails for leaked template values in visible copy (R5).
 *
 * @see docs/root-cause-audit-2026-10-12.md A8
 */

import { resolveHandlerStrictEnv } from './idleChromeOrchestration.js';

/** Matches whole tokens only — not substrings inside normal words. */
export const VISIBLE_TEXT_POISON_RE =
  /\bundefined\b|\bNaN\b|\[object Object\]/;

/**
 * @param {string} text
 * @returns {string | null} matched poison token
 */
export function findVisibleTextPoison(text) {
  const haystack = String(text ?? '');
  const match = haystack.match(VISIBLE_TEXT_POISON_RE);
  return match ? match[0] : null;
}

/**
 * @param {string} text
 * @param {string} [context]
 */
export function assertNoVisibleTextPoison(text, context = 'visible text') {
  const hit = findVisibleTextPoison(text);
  if (hit) {
    throw new Error(`[visible-text-poison] ${context}: found "${hit}"`);
  }
}

/**
 * @param {string} label
 * @param {unknown} value
 * @param {{ strict?: boolean }} [opts]
 * @returns {boolean} true when value is nullish and was logged/thrown
 */
function reportNullishDomValue(label, value, opts) {
  if (value != null) return false;
  const kind = value === undefined ? 'undefined' : 'null';
  const message = `[dom-safe] ${label} is ${kind}`;
  const strict = (opts ?? {}).strict ?? resolveHandlerStrictEnv();
  if (strict) throw new Error(message);
  console.error(message);
  return true;
}

/**
 * Append a child only when it exists; nullish children fail loud in dev/test.
 *
 * @param {ParentNode} parent
 * @param {Node | null | undefined} child
 * @param {string} [label]
 * @param {{ strict?: boolean }} [opts]
 * @returns {ParentNode}
 */
export function appendDomChild(parent, child, label = 'child', opts) {
  if (reportNullishDomValue(label, child, opts)) return parent;
  parent.appendChild(child);
  return parent;
}

/**
 * Set `textContent` from a defined value; nullish fails loud in dev/test.
 *
 * @param {HTMLElement} element
 * @param {string | number | null | undefined} text
 * @param {string} [label]
 * @param {{ strict?: boolean }} [opts]
 */
export function setDomText(element, text, label = 'text', opts) {
  if (reportNullishDomValue(label, text, opts)) return;
  element.textContent = String(text);
}
