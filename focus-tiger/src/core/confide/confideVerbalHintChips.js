/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide verbal-hint chips: tap fills a gold sentence that already routes.
 * shipped=true only after end-to-end human verification — not regex-only.
 * SSOT: docs/CONFIDE_EXECUTABLE_INTENTS.md · Verbal hint chips.
 */

export const CONFIDE_VERBAL_HINT_CHIP_ID = Object.freeze({
  FORGET_THIS: 'forget_this',
  DONT_SAVE_THIS: 'dont_save_this',
  PRACTICE_DURATION: 'practice_duration',
  PRESENCE_TREND: 'presence_trend'
});

/**
 * Catalog. Unlock a later chip by setting shipped: true after its QA row closes.
 * presence_trend: "two weeks" is a classifier phrase; the tool window is the
 * default 14-day ledger, not a parsed span from the sentence.
 * @type {readonly {
 *   id: string,
 *   fillKey: string,
 *   requiresMemoryBridge: boolean,
 *   shipped: boolean
 * }[]}
 */
export const CONFIDE_VERBAL_HINT_CHIPS = Object.freeze([
  Object.freeze({
    id: CONFIDE_VERBAL_HINT_CHIP_ID.FORGET_THIS,
    fillKey: 'CONFIDE_CHIP_FILL_FORGET_THIS',
    requiresMemoryBridge: true,
    shipped: true
  }),
  Object.freeze({
    id: CONFIDE_VERBAL_HINT_CHIP_ID.DONT_SAVE_THIS,
    fillKey: 'CONFIDE_CHIP_FILL_DONT_SAVE_THIS',
    requiresMemoryBridge: true,
    shipped: false
  }),
  Object.freeze({
    id: CONFIDE_VERBAL_HINT_CHIP_ID.PRACTICE_DURATION,
    fillKey: 'CONFIDE_CHIP_FILL_PRACTICE_DURATION',
    requiresMemoryBridge: false,
    shipped: false
  }),
  Object.freeze({
    id: CONFIDE_VERBAL_HINT_CHIP_ID.PRESENCE_TREND,
    fillKey: 'CONFIDE_CHIP_FILL_PRESENCE_TREND',
    requiresMemoryBridge: false,
    shipped: false
  })
]);

/**
 * @param {{ hasMemoryBridge?: boolean }} [opts]
 * @returns {typeof CONFIDE_VERBAL_HINT_CHIPS[number][]}
 */
export function listShippedConfideVerbalHintChips(opts = {}) {
  const hasMemoryBridge = Boolean(opts.hasMemoryBridge);
  return CONFIDE_VERBAL_HINT_CHIPS.filter(
    (chip) =>
      chip.shipped === true &&
      (chip.requiresMemoryBridge !== true || hasMemoryBridge)
  );
}
