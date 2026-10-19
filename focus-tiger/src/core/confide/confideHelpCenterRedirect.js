/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T23 Confide → Help Center ask-cards redirect (Brief T21 §一.10).
 * Speak-only; does not open the panel.
 */

import { overlayConfideTemplateTextForKey } from '../tasteLayerOverlay.js';
import {
  isConfideActivityHowToWithoutProductEntry,
  isConfideOperationalProductAskShape
} from './confideProductKnowledgeSemantic.js';

export const CONFIDE_HELP_CENTER_ASK_REDIRECT_KEY = 'CONFIDE_HELP_CENTER_ASK_REDIRECT';

/**
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatConfideHelpCenterAskRedirectReply(tFn) {
  const overlay = overlayConfideTemplateTextForKey(CONFIDE_HELP_CENTER_ASK_REDIRECT_KEY);
  if (overlay) return overlay;
  const t = typeof tFn === 'function' ? tFn : (key) => key;
  return t(CONFIDE_HELP_CENTER_ASK_REDIRECT_KEY);
}

/**
 * High-confidence product how-to (CR-47 operational ∧ product object / honesty).
 * Mood, personal facts, and crisis stay off this path in the caller.
 *
 * @param {{
 *   text?: string,
 *   gateAction?: 'hit' | 'honesty' | 'skip' | string | null,
 *   helpCenterAskReachable?: boolean,
 *   helpExcerptHit?: boolean
 * }} input
 * @returns {boolean}
 */
export function shouldRedirectConfideProductAskToHelpCenter(input) {
  if (!input?.helpCenterAskReachable) return false;
  const gate = input.gateAction;
  const productObject =
    gate === 'hit' || gate === 'honesty' || input.helpExcerptHit === true;
  if (!productObject) return false;
  const text = input.text;
  return (
    isConfideOperationalProductAskShape(text) ||
    isConfideActivityHowToWithoutProductEntry(text)
  );
}
