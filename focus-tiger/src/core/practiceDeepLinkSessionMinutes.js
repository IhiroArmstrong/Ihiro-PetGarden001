/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * In-memory this-load minutes from a Sit deep link.
 * Does not write stable-prefs or localStorage.
 */

/** @type {number | null} */
let armedMinutes = null;

/**
 * @param {number} minutes
 */
export function armPracticeDeepLinkFocusMinutes(minutes) {
  const value = Number(minutes);
  armedMinutes = Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * @returns {number | null}
 */
export function peekPracticeDeepLinkFocusMinutes() {
  return armedMinutes;
}

/**
 * @returns {number | null}
 */
export function takePracticeDeepLinkFocusMinutes() {
  const value = armedMinutes;
  armedMinutes = null;
  return value;
}
