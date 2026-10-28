/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A1 · Menu full-reachability contract.
 *
 * Catalog rows come from `listSecondaryChromeEntries`. This table is the
 * expected visible result after a click. New catalog proxies fail unit tests
 * until they are listed here — the Playwright walker does not need a rewrite.
 *
 * @see docs/root-cause-audit-2026-10-12.md A1
 */

import { listSecondaryChromeEntries } from './idleChromeOrchestration.js';
import { VISIBLE_TEXT_POISON_RE } from './visibleTextPoison.js';

/**
 * @typedef {'open-panel' | 'open-external' | 'static-row' | 'locked-row'} MenuReachKind
 *
 * @typedef {object} MenuReachContract
 * @property {MenuReachKind} kind
 * @property {string} [resultSelector] panel / sheet that must be visible
 * @property {string} [popupUrlIncludes] substring of window.open URL
 */

/** @type {Readonly<Record<string, MenuReachContract>>} */
export const MENU_REACHABILITY = Object.freeze({
  'sanctuary-nav': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#home-sanctuary-nav-fan-backdrop.is-visible'
  }),
  companion: Object.freeze({
    kind: 'open-panel',
    resultSelector: '.session-start-dock__panel'
  }),
  'ground-exercise': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#ground-exercise-choice'
  }),
  'five-moments': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#five-moments-compass'
  }),
  honesty: Object.freeze({
    kind: 'open-panel',
    resultSelector: '#honesty-check-in'
  }),
  confide: Object.freeze({
    kind: 'open-panel',
    resultSelector: '#confide-to-yin-card'
  }),
  'journey-log': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#journey-log'
  }),
  'presence-signals': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#presence-signals-panel'
  }),
  'yin-coin': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#yin-coin-panel'
  }),
  'daily-quote': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#daily-zen-quote-card'
  }),
  'zen-cinema': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#zen-cinema-card'
  }),
  'mustard-seed-seal': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#mustard-seed-seal-card'
  }),
  wallpapers: Object.freeze({
    kind: 'open-panel',
    resultSelector: '#digital-wallpapers-card'
  }),
  'art-collection': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#art-collection-panel'
  }),
  'quiet-together': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#quiet-together-panel'
  }),
  'focus-circle': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#focus-circle-panel'
  }),
  reminder: Object.freeze({
    kind: 'open-panel',
    resultSelector: '#reminder-preference-panel'
  }),
  'work-end': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#work-end-preference-panel'
  }),
  language: Object.freeze({
    kind: 'open-panel',
    resultSelector: '#language-preference-panel'
  }),
  sound: Object.freeze({
    kind: 'open-panel',
    resultSelector: '.ambient-soundscape__panel'
  }),
  'always-on-top': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#always-on-top-preference'
  }),
  'input-rhythm': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#input-rhythm-preference'
  }),
  'today-direction': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#cold-start-goal-card'
  }),
  newsletter: Object.freeze({
    kind: 'open-panel',
    resultSelector: '#newsletter-capture-card'
  }),
  account: Object.freeze({
    kind: 'static-row'
  }),
  community: Object.freeze({
    kind: 'open-external',
    popupUrlIncludes: 'twinsology.com/#community'
  }),
  'help-center': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#help-center'
  }),
  'local-backup': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#local-practice-data-panel'
  }),
  membership: Object.freeze({
    kind: 'open-panel',
    resultSelector: '#yin-membership-card'
  }),
  'ritual-morning': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#ritual-flow'
  }),
  'ritual-emotional-reset': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#ritual-flow'
  }),
  'ritual-work-transition': Object.freeze({
    kind: 'open-panel',
    resultSelector: '#ritual-flow'
  })
});

/** Forbidden leftover strings in opened result text (A8 ①, reused by A1). */
export const MENU_RESULT_FORBIDDEN_TEXT = VISIBLE_TEXT_POISON_RE;

/**
 * Default Idle visibility for `?product=1` web (not Electron L1 / not Confide ship).
 * @type {import('./idleChromeOrchestration.js').SecondaryEntryVisibility}
 */
export const PRODUCT_IDLE_MENU_VISIBILITY = Object.freeze({
  microRitualVisible: true,
  companionVisible: true,
  companionEnabled: true,
  reminderAvailable: true,
  confideUserVisible: false,
  companionGeneration: false,
  mustardSeedSealUnlocked: false,
  systemTtsAvailable: false,
  alwaysOnTopAvailable: false,
  windowLayoutAvailable: false,
  inputRhythmAvailable: false,
  newsletterSubmitted: false,
  scenesEntitled: false
});

/**
 * @param {'narrow-drawer' | 'wide-more'} surface
 * @param {import('./idleChromeOrchestration.js').SecondaryEntryVisibility} [visibility]
 * @returns {Array<{
 *   proxy: string,
 *   groupKey: string | null,
 *   locked: boolean,
 *   interactive: boolean,
 *   contract: MenuReachContract
 * }>}
 */
export function listMenuReachabilityRows(
  surface,
  visibility = PRODUCT_IDLE_MENU_VISIBILITY
) {
  const entries = listSecondaryChromeEntries(surface, visibility);
  /** @type {Array<{ proxy: string, groupKey: string | null, locked: boolean, interactive: boolean, contract: MenuReachContract }>} */
  const rows = [];
  let groupKey = null;
  for (const entry of entries) {
    if (entry.kind === 'group-label') {
      groupKey = entry.labelKey;
      continue;
    }
    if (!entry.proxy) continue;
    const mapped = MENU_REACHABILITY[entry.proxy];
    if (!mapped) {
      throw new Error(
        `menu reachability: catalog proxy "${entry.proxy}" has no MENU_REACHABILITY row`
      );
    }
    const locked = entry.locked === true;
    const interactive = entry.interactive !== false;
    /** @type {MenuReachContract} */
    let contract = mapped;
    if (locked) {
      contract = Object.freeze({
        kind: 'open-panel',
        resultSelector: '#yin-membership-card'
      });
    } else if (!interactive) {
      contract = Object.freeze({ kind: 'static-row' });
    }
    rows.push({
      proxy: entry.proxy,
      groupKey,
      locked,
      interactive,
      contract
    });
  }
  return rows;
}
