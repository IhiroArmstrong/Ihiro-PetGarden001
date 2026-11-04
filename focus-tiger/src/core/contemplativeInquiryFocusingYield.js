/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Focusing menu row stays clickable (escape hatch) but must not open the
 * sit card or act as Rise. Rise ends the session and would fight Reflection.
 *
 * @param {{ focusing?: boolean }} [input]
 * @returns {'hint-rise' | 'open'}
 */
export function resolveContemplativeInquiryMenuClick(input = {}) {
  return input.focusing === true ? 'hint-rise' : 'open';
}
