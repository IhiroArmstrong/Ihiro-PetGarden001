import { FOCUS_SESSION_DEFAULT_MINUTES } from '../utils/Constants.js';

/**
 * Soft daily “shared sitting” fill for progress-bar (一炷香-style ceiling).
 * Incomplete day stays quiet — never a fail state.
 *
 * @param {{
 *   completedMinutes?: number,
 *   liveSessionMinutes?: number,
 *   softTargetMinutes?: number
 * }} input
 * @returns {number} 0..100
 */
export function sharedSittingProgressPercent({
  completedMinutes = 0,
  liveSessionMinutes = 0,
  softTargetMinutes = FOCUS_SESSION_DEFAULT_MINUTES
} = {}) {
  const done = Math.max(0, Number(completedMinutes) || 0);
  const live = Math.max(0, Number(liveSessionMinutes) || 0);
  const target = Math.max(1, Number(softTargetMinutes) || FOCUS_SESSION_DEFAULT_MINUTES);
  return Math.min(100, ((done + live) / target) * 100);
}
