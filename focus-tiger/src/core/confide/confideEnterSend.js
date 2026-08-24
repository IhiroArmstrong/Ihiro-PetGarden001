/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Enter sends Confide (same as Share). Shift+Enter keeps a newline.
 * IME composing Enter must not submit.
 *
 * @param {{ key?: string, shiftKey?: boolean, isComposing?: boolean, keyCode?: number } | null | undefined} event
 * @returns {boolean}
 */
export function shouldSubmitConfideOnEnter(event) {
  if (!event || event.key !== 'Enter' || event.shiftKey) return false;
  if (event.isComposing || event.keyCode === 229) return false;
  return true;
}
