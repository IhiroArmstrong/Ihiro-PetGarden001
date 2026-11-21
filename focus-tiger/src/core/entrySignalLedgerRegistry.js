/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Entry signal ledger rows (SSOT for L1 machine block).
 *
 * @typedef {object} EntrySignalLedgerRow
 * @property {string} controlId
 * @property {string} selector
 * @property {string} visibleLabel
 * @property {'none' | 'native-title' | 'glass-ear' | 'glass-legacy-dark' | 'hint-host-hover'} tooltip
 * @property {string} pulse — `none` or `mint-float:hintId` or `mint-inline:hintId`
 * @property {string} oneShot
 * @property {string} touch
 * @property {string} stackExempt
 */

import { ONBOARDING_HINT_REGISTRY } from './onboardingHintRegistry.js';
import {
  ENTRY_SIGNAL_NO_MINT_HINT_IDS,
  ENTRY_SIGNAL_PROTECTED_SELECTORS
} from './entrySignalLedgerContract.js';

/**
 * Curated controls not fully described by hint registry alone.
 * @type {ReadonlyArray<EntrySignalLedgerRow>}
 */
const ENTRY_SIGNAL_LEDGER_STATIC = Object.freeze([
  {
    controlId: 'home-sit-wide',
    selector: '#ft-wide-home-sit',
    visibleLabel: 'Sit/Rise (icon)',
    tooltip: 'glass-ear',
    pulse: 'none',
    oneShot: 'none',
    touch: 'execute-plus-first-toast',
    stackExempt: ''
  },
  {
    controlId: 'home-sit-narrow',
    selector: '#ft-narrow-home-sit',
    visibleLabel: 'Sit/Rise (icon)',
    tooltip: 'glass-ear',
    pulse: 'none',
    oneShot: 'none',
    touch: 'execute-plus-first-toast',
    stackExempt: ''
  },
  {
    controlId: 'home-honesty-wide',
    selector: '#ft-wide-home-honesty',
    visibleLabel: 'Honesty (icon)',
    tooltip: 'glass-ear',
    pulse: 'none',
    oneShot: 'none',
    touch: 'execute-plus-first-toast',
    stackExempt: ''
  },
  {
    controlId: 'home-honesty-narrow',
    selector: '#ft-narrow-home-honesty',
    visibleLabel: 'Honesty (icon)',
    tooltip: 'glass-ear',
    pulse: 'none',
    oneShot: 'none',
    touch: 'execute-plus-first-toast',
    stackExempt: ''
  },
  {
    controlId: 'confide-ear-chrome',
    selector: '#confide-ear-chrome',
    visibleLabel: '无',
    tooltip: 'glass-ear',
    pulse: 'none',
    oneShot: 'none',
    touch: 'execute-plus-first-toast',
    stackExempt: ''
  },
  {
    controlId: 'btn-focus',
    selector: '#btn-focus',
    visibleLabel: 'Sit/Rise text',
    tooltip: 'none',
    pulse: 'none',
    oneShot: 'none',
    touch: 'label-enough',
    stackExempt: ''
  },
  {
    controlId: 'transition-moment-trigger',
    selector: '#transition-moment-trigger',
    visibleLabel: '无',
    tooltip: 'glass-legacy-dark',
    pulse: 'none',
    oneShot: 'none',
    touch: 'execute-plus-first-toast',
    stackExempt: ''
  }
]);

/**
 * @param {import('./onboardingHintRegistry.js').OnboardingHintRegistryEntry} entry
 * @returns {EntrySignalLedgerRow | null}
 */
function ledgerRowFromHint(entry) {
  const { id, anchor, triggerMode } = entry;
  const selector = anchor?.selector;
  if (!selector) return null;

  let pulse = 'none';
  if (triggerMode === 'click' && !ENTRY_SIGNAL_NO_MINT_HINT_IDS.has(id)) {
    const hostIsMenu =
      id === 'how-shall-we-sit' ||
      selector.includes('ft-narrow') ||
      selector.includes('wide-more') ||
      selector.includes('session-start-dock');
    const kind = hostIsMenu && id !== 'ambient-soundscape' ? 'mint-inline' : 'mint-float';
    pulse = `${kind}:${id}`;
  }

  let tooltip = 'none';
  if (triggerMode === 'click' || triggerMode === 'manual') {
    tooltip = 'hint-host-hover';
  }

  let touch = 'pulse-click';
  if (id === 'help-affordance') touch = 'pulse-click';
  if (pulse === 'none' && tooltip === 'hint-host-hover') {
    touch = 'label-enough';
  }

  return {
    controlId: `hint:${id}`,
    selector,
    visibleLabel: entry.localeKey,
    tooltip,
    pulse,
    oneShot: 'none',
    touch,
    stackExempt: ''
  };
}

/**
 * @param {string} selector
 * @returns {EntrySignalLedgerRow}
 */
function protectedPaymentRow(selector) {
  const slug = selector.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return {
    controlId: `protected:${slug}`,
    selector,
    visibleLabel: 'payment/support',
    tooltip: 'none',
    pulse: 'none',
    oneShot: 'none',
    touch: 'label-enough',
    stackExempt: 'protected-payment-path'
  };
}

/**
 * @returns {ReadonlyArray<EntrySignalLedgerRow>}
 */
export function buildEntrySignalLedgerRows() {
  /** @type {EntrySignalLedgerRow[]} */
  const rows = [];
  const seen = new Set();

  for (const entry of ONBOARDING_HINT_REGISTRY) {
    const row = ledgerRowFromHint(entry);
    if (!row) continue;
    if (seen.has(row.controlId)) continue;
    seen.add(row.controlId);
    rows.push(row);
  }

  for (const row of ENTRY_SIGNAL_LEDGER_STATIC) {
    if (seen.has(row.controlId)) continue;
    seen.add(row.controlId);
    rows.push(row);
  }

  for (const selector of ENTRY_SIGNAL_PROTECTED_SELECTORS) {
    const row = protectedPaymentRow(selector);
    if (seen.has(row.controlId)) continue;
    seen.add(row.controlId);
    rows.push(row);
  }

  rows.sort((a, b) => a.controlId.localeCompare(b.controlId));
  return Object.freeze(rows);
}

/**
 * @param {ReadonlyArray<EntrySignalLedgerRow>} rows
 * @returns {ReadonlySet<string>}
 */
export function collectRegisteredPulseClasses(rows) {
  /** @type {Set<string>} */
  const registered = new Set();
  for (const row of rows) {
    if (row.pulse === 'none') continue;
    if (row.pulse.startsWith('mint-float:')) {
      registered.add('onboarding-hint-badge');
      registered.add('has-hint-mint');
    }
    if (row.pulse.startsWith('mint-inline:')) {
      registered.add('ft-secondary-menu-hint-dot');
      registered.add('has-hint-mint');
    }
  }
  return registered;
}