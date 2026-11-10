/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Enumerated Confide open paths for Plan A (mount off) dead-end audits.
 * SSOT for “does this entry give feedback when the panel cannot open?”
 *
 * @typedef {'hidden-when-blocked' | 'gated-before-open' | 'visible-must-feedback'} ConfideOpenEntryPolicy
 *
 * @typedef {object} ConfideOpenEntryRow
 * @property {string} id stable slug (kebab-case)
 * @property {ConfideOpenEntryPolicy} policy
 * @property {string} note one-line grounding for PO / audit
 */

/** @type {ReadonlyArray<ConfideOpenEntryRow>} */
export const CONFIDE_OPEN_ENTRY_REGISTRY = Object.freeze([
  Object.freeze({
    id: 'idle-menu-confide',
    policy: 'hidden-when-blocked',
    note: 'Idle wide-more / narrow drawer row omitted when canOpenConfidePanel is false'
  }),
  Object.freeze({
    id: 'confide-ear-chrome',
    policy: 'hidden-when-blocked',
    note: 'Wide ear / narrow ActionBar confide control uses shouldShowConfideEarChrome'
  }),
  Object.freeze({
    id: 'keyboard-confide-shortcut',
    policy: 'gated-before-open',
    note: 'productKeyboardShortcuts only fires onConfide when confideAllowed'
  }),
  Object.freeze({
    id: 'contemplative-inquiry-crisis',
    policy: 'visible-must-feedback',
    note: 'CI_EX1_TALK routes onCrisis → confideToYinUI.open; mount off must toast T92'
  }),
  Object.freeze({
    id: 'desktop-companion-paid-wide',
    policy: 'hidden-when-blocked',
    note: 'When entitled, row visible and opens — not a dead end for that cohort (Plan A option 1 will close separately)'
  }),
  Object.freeze({
    id: 'voice-crisis-to-confide',
    policy: 'visible-must-feedback',
    note:
      'Push-to-talk → submitVoiceCommandRaw → ConfideToYinUI.open; mount off → onOpenBlocked T92 toast (Plan A §6)'
  }),
  Object.freeze({
    id: 'help-center-ask-crisis-redirect',
    policy: 'visible-must-feedback',
    note:
      'Help Center ask safety policy → help-center-ask-safety-t92 inline T92 (confidePlanAHelpCenterAskSafety)'
  })
]);

/**
 * @returns {ReadonlyArray<ConfideOpenEntryRow>}
 */
export function listConfideOpenEntries() {
  return CONFIDE_OPEN_ENTRY_REGISTRY;
}
