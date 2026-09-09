/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/** @typedef {'questions' | 'wisdom'} ReflectionQuotePhase */

export const REFLECTION_QUOTE_PHASE = {
  QUESTIONS: 'questions',
  WISDOM: 'wisdom'
};

/**
 * Progressive disclosure: never show Calm Action affirmation and Daily Wisdom together.
 *
 * @param {ReflectionQuotePhase} phase
 * @returns {{ calmAction: boolean, dailyWisdom: boolean }}
 */
export function reflectionQuoteVisibility(phase) {
  if (phase === REFLECTION_QUOTE_PHASE.WISDOM) {
    return { calmAction: false, dailyWisdom: true };
  }
  return { calmAction: true, dailyWisdom: false };
}

/**
 * Last-question companion echo hold → advance to wisdom landing (not dismiss).
 *
 * @param {object} opts
 * @param {boolean} opts.awaitingLastEchoHold
 * @param {'continue' | 'skip' | 'skip-all' | 'escape' | 'enter'} opts.action
 * @returns {boolean}
 */
export function shouldAdvanceFromLastEchoHold({
  awaitingLastEchoHold,
  action
} = {}) {
  if (!awaitingLastEchoHold) return false;
  return (
    action === 'continue' ||
    action === 'skip' ||
    action === 'skip-all' ||
    action === 'escape' ||
    action === 'enter'
  );
}

/**
 * Wisdom landing hold → any dismiss control closes Reflection.
 *
 * @param {object} opts
 * @param {boolean} opts.awaitingWisdomHold
 * @param {'continue' | 'skip' | 'skip-all' | 'escape' | 'enter'} opts.action
 * @returns {boolean}
 */
export function shouldFinishWisdomHold({
  awaitingWisdomHold,
  action
} = {}) {
  if (!awaitingWisdomHold) return false;
  return (
    action === 'continue' ||
    action === 'skip' ||
    action === 'skip-all' ||
    action === 'escape' ||
    action === 'enter'
  );
}

/**
 * @param {HTMLElement | null} host
 * @param {boolean} visible
 * @param {{ fadeMs?: number }} [opts]
 */
export function setReflectionQuoteHostVisible(
  host,
  visible,
  { fadeMs = 260 } = {}
) {
  if (!host) return;
  const on = Boolean(visible);
  host.style.transition = `opacity ${fadeMs}ms ease`;
  host.style.opacity = on ? '1' : '0';
  host.style.pointerEvents = on ? 'auto' : 'none';
  host.hidden = !on;
  host.style.display = on ? '' : 'none';
  if (on) {
    host.removeAttribute('aria-hidden');
  } else {
    host.setAttribute('aria-hidden', 'true');
  }
}
