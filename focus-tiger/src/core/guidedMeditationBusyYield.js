/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Guided Meditation must not stack on Focusing, Honesty, or Breath.
 * The menu row stays clickable (escape hatch) and shows a reason.
 *
 * @param {{ focusing?: boolean, honestyBusy?: boolean, breathBusy?: boolean }} [input]
 * @returns {'busy' | 'open'}
 */
export function resolveGuidedMeditationMenuClick(input = {}) {
  if (
    input.focusing === true ||
    input.honestyBusy === true ||
    input.breathBusy === true
  ) {
    return 'busy';
  }
  return 'open';
}
