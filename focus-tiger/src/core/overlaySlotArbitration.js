/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Unified overlay slot arbitration: callers report intent; this module decides
 * who may occupy the screen. Sprite-channel occupancy stays in
 * `spriteChannelArbitration.js`.
 *
 * PR-1: snapshot + legacy derive helpers (equivalent to main.js inline OR lists)
 * + target `requestOverlaySlot` matrix. main.js wiring lands in PR-2+.
 *
 * @see docs/SHARED_RESOURCES.md §4 (target)
 * @see overlaySlotContractRegistry.js
 */

import { computePostSessionOverlayActive } from './SessionUiGate.js';
import { STATES } from './StateManager.js';
import { isHonestyPhaseBusy, isHonestyUiBusy } from './sessionChromeSync.js';
import {
  FIRST_CARD_DEFER_PRIORITY,
  OVERLAY_SLOT_KIND,
  OVERLAY_SOURCES
} from './overlaySlotContractRegistry.js';

export { OVERLAY_SOURCES, OVERLAY_SLOT_KIND } from './overlaySlotContractRegistry.js';

/**
 * @typedef {object} OverlaySnapshotInput
 * @property {string} [sessionState]
 * @property {boolean} [completionPending]
 * @property {string|null} [honestyPhase]
 * @property {boolean} [honestyBridgeVisible]
 * @property {boolean} [arrivalOpen]
 * @property {boolean} [reflectionOpen]
 * @property {boolean} [microRitualOpen]
 * @property {boolean} [ritualFlowOpen]
 * @property {boolean} [focusDurationPickerOpen]
 * @property {boolean} [companionPickerOpen]
 * @property {boolean} [postSessionOverlayActive] Gate field (may include mustard bypass)
 * @property {boolean} [compassOpen]
 * @property {boolean} [mustardSeedOpen]
 * @property {boolean} [tipJarOpen]
 * @property {boolean} [supportModalOpen]
 * @property {boolean} [sanctuaryOpen]
 * @property {boolean} [membershipOpen]
 * @property {boolean} [flowerWelcomeVisible]
 * @property {boolean} [secondaryMenuOpen]
 */

/**
 * @typedef {Required<Pick<OverlaySnapshotInput,
 *   'sessionState' | 'completionPending' | 'honestyPhase' | 'honestyBridgeVisible' |
 *   'arrivalOpen' | 'reflectionOpen' | 'microRitualOpen' | 'ritualFlowOpen' |
 *   'focusDurationPickerOpen' | 'companionPickerOpen' | 'postSessionOverlayActive' |
 *   'compassOpen' | 'mustardSeedOpen' | 'tipJarOpen' | 'supportModalOpen' |
 *   'sanctuaryOpen' | 'membershipOpen' | 'flowerWelcomeVisible' | 'secondaryMenuOpen'
 * >>} OverlaySnapshot
 */

/**
 * Normalize raw UI flags into a snapshot (no DOM).
 *
 * @param {OverlaySnapshotInput} [input]
 * @returns {OverlaySnapshot}
 */
export function buildOverlaySnapshot(input = {}) {
  return {
    sessionState: input.sessionState ?? STATES.IDLE,
    completionPending: Boolean(input.completionPending),
    honestyPhase:
      typeof input.honestyPhase === 'string' ? input.honestyPhase : 'hidden',
    honestyBridgeVisible: Boolean(input.honestyBridgeVisible),
    arrivalOpen: Boolean(input.arrivalOpen),
    reflectionOpen: Boolean(input.reflectionOpen),
    microRitualOpen: Boolean(input.microRitualOpen),
    ritualFlowOpen: Boolean(input.ritualFlowOpen),
    focusDurationPickerOpen: Boolean(input.focusDurationPickerOpen),
    companionPickerOpen: Boolean(input.companionPickerOpen),
    postSessionOverlayActive: Boolean(input.postSessionOverlayActive),
    compassOpen: Boolean(input.compassOpen),
    mustardSeedOpen: Boolean(input.mustardSeedOpen),
    tipJarOpen: Boolean(input.tipJarOpen),
    supportModalOpen: Boolean(input.supportModalOpen),
    sanctuaryOpen: Boolean(input.sanctuaryOpen),
    membershipOpen: Boolean(input.membershipOpen),
    flowerWelcomeVisible: Boolean(input.flowerWelcomeVisible),
    secondaryMenuOpen: Boolean(input.secondaryMenuOpen)
  };
}

// ── Legacy derive (Phase A equivalence — mirrors main.js inline OR lists) ──

/**
 * `main.isSceneAnimOverlayBusy()` equivalent (pre-PR-2).
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveSceneAnimOverlayBusy(snapshot) {
  return (
    snapshot.honestyPhase !== 'hidden' ||
    snapshot.arrivalOpen ||
    snapshot.reflectionOpen ||
    snapshot.microRitualOpen ||
    snapshot.focusDurationPickerOpen
  );
}

/** @deprecated alias for sprite channel consumers */
export const deriveOverlayBusyForSprite = deriveSceneAnimOverlayBusy;

/**
 * `sessionChromeSync.getPostSessionOverlaySources()` OR aggregate (pre-PR-2;
 * mustard-seed NOT in sources — C1 gap preserved until PR-2).
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function derivePostSessionOverlayFromSources(snapshot) {
  return computePostSessionOverlayActive([
    snapshot.arrivalOpen,
    snapshot.reflectionOpen,
    snapshot.microRitualOpen,
    snapshot.ritualFlowOpen,
    snapshot.focusDurationPickerOpen
  ]);
}

/**
 * `InAppReminderBannerController.isReminderBusySession` equivalent (pre-PR-2).
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveReminderBusySession(snapshot) {
  if (
    snapshot.arrivalOpen ||
    snapshot.reflectionOpen ||
    snapshot.microRitualOpen
  ) {
    return true;
  }
  return (
    snapshot.sessionState === STATES.FOCUSING ||
    snapshot.sessionState === STATES.CELEBRATE
  );
}

/**
 * Contextual tea bubble `isBusy` in main.js (pre-PR-2).
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveTeaBubbleBusy(snapshot) {
  return (
    snapshot.tipJarOpen ||
    snapshot.supportModalOpen ||
    snapshot.sanctuaryOpen ||
    snapshot.membershipOpen ||
    snapshot.mustardSeedOpen ||
    snapshot.reflectionOpen ||
    snapshot.arrivalOpen ||
    snapshot.compassOpen
  );
}

/**
 * `main.isMomentWhisperBusy(forKey)` equivalent.
 *
 * @param {OverlaySnapshot} snapshot
 * @param {string} [forKey]
 * @returns {boolean}
 */
export function deriveMomentWhisperBusy(snapshot, forKey = '') {
  if (snapshot.compassOpen) return true;
  if (snapshot.sessionState === STATES.CELEBRATE) return true;
  if (snapshot.microRitualOpen) return true;
  if (
    forKey !== 'arrive' &&
    snapshot.honestyPhase &&
    snapshot.honestyPhase !== 'hidden'
  ) {
    return true;
  }
  if (snapshot.companionPickerOpen) return true;
  if (forKey !== 'arrive' && snapshot.arrivalOpen) return true;
  if (forKey !== 'reflect' && snapshot.reflectionOpen) return true;
  return false;
}

/**
 * `main.isFocusAwarenessCardBusy()` equivalent.
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveFocusAwarenessCardBusy(snapshot) {
  if (snapshot.compassOpen) return true;
  if (snapshot.mustardSeedOpen) return true;
  if (snapshot.sessionState === STATES.CELEBRATE) return true;
  if (snapshot.microRitualOpen) return true;
  if (snapshot.ritualFlowOpen) return true;
  if (snapshot.honestyPhase && snapshot.honestyPhase !== 'hidden') return true;
  if (snapshot.companionPickerOpen) return true;
  if (snapshot.arrivalOpen) return true;
  if (snapshot.reflectionOpen) return true;
  if (snapshot.focusDurationPickerOpen) return true;
  return false;
}

/**
 * `main.isIdleYinTapOverlayBusy()` equivalent.
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveIdleYinTapOverlayBusy(snapshot) {
  return (
    snapshot.postSessionOverlayActive === true ||
    snapshot.honestyPhase === 'duration' ||
    snapshot.honestyPhase === 'breath' ||
    snapshot.honestyPhase === 'thanks' ||
    snapshot.supportModalOpen ||
    snapshot.tipJarOpen ||
    snapshot.sanctuaryOpen ||
    snapshot.membershipOpen
  );
}

/**
 * `setPracticeBackupBusyProbe` callback equivalent.
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {{ busy: boolean, retry: boolean }}
 */
export function derivePracticeBackupBusy(snapshot) {
  const focusing =
    snapshot.sessionState === STATES.FOCUSING ||
    snapshot.sessionState === STATES.CELEBRATE;
  const overlay =
    Boolean(snapshot.postSessionOverlayActive) ||
    snapshot.arrivalOpen ||
    isHonestyPhaseBusy(snapshot.honestyPhase);
  return {
    busy: focusing || overlay,
    retry: overlay && !focusing
  };
}

/**
 * `main.canOpenConfideNow` busy half (before entitlement gate).
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveConfideOpenBlocked(snapshot) {
  return (
    snapshot.sessionState === STATES.FOCUSING ||
    snapshot.arrivalOpen ||
    snapshot.reflectionOpen ||
    snapshot.microRitualOpen ||
    snapshot.honestyBridgeVisible ||
    Boolean(snapshot.honestyPhase && snapshot.honestyPhase !== 'hidden')
  );
}

/**
 * `bootSeasonalThemeChrome.isBusy` equivalent.
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveSeasonalThemeBusy(snapshot) {
  return (
    snapshot.arrivalOpen ||
    snapshot.reflectionOpen ||
    snapshot.microRitualOpen
  );
}

/**
 * `bindElectronIdleContextMenu.getIsIdleContextMenuAllowed` negated.
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveElectronIdleContextMenuBlocked(snapshot) {
  if (snapshot.sessionState !== STATES.IDLE) return true;
  if (snapshot.secondaryMenuOpen) return true;
  if (snapshot.arrivalOpen) return true;
  if (snapshot.reflectionOpen) return true;
  if (snapshot.microRitualOpen) return true;
  if (isHonestyUiBusy(snapshot.honestyPhase)) return true;
  if (snapshot.companionPickerOpen) return true;
  return false;
}

/**
 * `sessionChromeSync.syncHonestyIdleEntry` blocked predicate.
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveHonestyIdleEntryBlocked(snapshot) {
  return (
    snapshot.arrivalOpen ||
    snapshot.honestyBridgeVisible ||
    snapshot.reflectionOpen ||
    snapshot.microRitualOpen ||
    snapshot.ritualFlowOpen ||
    snapshot.focusDurationPickerOpen ||
    snapshot.sessionState === STATES.FOCUSING ||
    snapshot.sessionState === STATES.CELEBRATE
  );
}

// ── Target derive (PR-2 wiring) ──

/**
 * postSessionOverlayActive from sources — target includes mustard-seed (C1 fix).
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function derivePostSessionOverlayActiveTarget(snapshot) {
  return computePostSessionOverlayActive([
    snapshot.arrivalOpen,
    snapshot.reflectionOpen,
    snapshot.microRitualOpen,
    snapshot.ritualFlowOpen,
    snapshot.focusDurationPickerOpen,
    snapshot.mustardSeedOpen
  ]);
}

/**
 * Reminder busy — target extends legacy with compass / mustard / honesty panel.
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveReminderBusySessionTarget(snapshot) {
  if (deriveReminderBusySession(snapshot)) return true;
  if (snapshot.compassOpen) return true;
  if (snapshot.mustardSeedOpen) return true;
  if (isHonestyUiBusy(snapshot.honestyPhase)) return true;
  if (snapshot.companionPickerOpen) return true;
  if (snapshot.ritualFlowOpen) return true;
  if (snapshot.focusDurationPickerOpen) return true;
  if (snapshot.flowerWelcomeVisible) return true;
  return false;
}

/**
 * Tea bubble busy — target adds honesty panel/prompt + micro/ritual/companion.
 *
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function deriveTeaBubbleBusyTarget(snapshot) {
  if (deriveTeaBubbleBusy(snapshot)) return true;
  if (isHonestyUiBusy(snapshot.honestyPhase)) return true;
  if (snapshot.microRitualOpen) return true;
  if (snapshot.ritualFlowOpen) return true;
  if (snapshot.companionPickerOpen) return true;
  return false;
}

// ── Snapshot occupancy helpers (target matrix) ──

/**
 * @param {OverlaySnapshot} snapshot
 * @returns {string|null}
 */
function activeVisualPrimary(snapshot) {
  if (snapshot.arrivalOpen) return OVERLAY_SOURCES.ARRIVAL;
  if (snapshot.reflectionOpen) return OVERLAY_SOURCES.REFLECTION;
  if (snapshot.ritualFlowOpen) return OVERLAY_SOURCES.RITUAL_FLOW;
  if (snapshot.microRitualOpen) return OVERLAY_SOURCES.MICRO_RITUAL;
  if (isHonestyPhaseBusy(snapshot.honestyPhase)) {
    return OVERLAY_SOURCES.HONESTY_PANEL;
  }
  if (snapshot.focusDurationPickerOpen) {
    return OVERLAY_SOURCES.FOCUS_DURATION_PICKER;
  }
  if (snapshot.companionPickerOpen) return OVERLAY_SOURCES.COMPANION_PICKER;
  if (snapshot.honestyBridgeVisible) return OVERLAY_SOURCES.HONESTY_BRIDGE;
  return null;
}

/**
 * @param {OverlaySnapshot} snapshot
 * @returns {string|null}
 */
function activeGrowthCard(snapshot) {
  if (snapshot.mustardSeedOpen) return OVERLAY_SOURCES.GROWTH_MUSTARD_SEED;
  if (snapshot.compassOpen) return OVERLAY_SOURCES.GROWTH_COMPASS;
  return null;
}

/**
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
function isSessionHardGate(snapshot) {
  return (
    snapshot.sessionState === STATES.FOCUSING ||
    snapshot.sessionState === STATES.CELEBRATE ||
    snapshot.completionPending
  );
}

/**
 * @param {string} source
 * @returns {boolean}
 */
function isFirstCardSource(source) {
  return FIRST_CARD_DEFER_PRIORITY.includes(source);
}

/**
 * @param {OverlaySnapshot} snapshot
 * @param {string} source
 * @returns {string[]}
 */
function collectFirstCardBlockers(snapshot, source) {
  /** @type {string[]} */
  const blockers = [];
  const myIdx = FIRST_CARD_DEFER_PRIORITY.indexOf(source);
  if (myIdx < 0) return blockers;
  for (let i = 0; i < myIdx; i += 1) {
    const higher = FIRST_CARD_DEFER_PRIORITY[i];
    if (higher === OVERLAY_SOURCES.FLOWER_WELCOME && snapshot.flowerWelcomeVisible) {
      blockers.push(higher);
    }
    if (
      higher === OVERLAY_SOURCES.GROWTH_COMPASS &&
      snapshot.compassOpen
    ) {
      blockers.push(higher);
    }
  }
  return blockers;
}

/**
 * @param {object} req
 * @param {string} req.source
 * @param {string} [req.kind]
 * @param {'show' | 'occupy-busy' | 'hide'} req.intent
 * @param {string} [req.contextKey] moment-whisper key
 * @param {OverlaySnapshot} req.snapshot
 * @returns {{
 *   canShow: boolean,
 *   mustYieldTo: string[],
 *   reason: string,
 *   preempt?: string[]
 * }}
 */
export function requestOverlaySlot(req) {
  const snapshot = req.snapshot;
  const source = req.source;
  const intent = req.intent;

  if (intent === 'hide') {
    return { canShow: false, mustYieldTo: [], reason: 'hide-intent' };
  }

  if (intent === 'occupy-busy') {
    return { canShow: true, mustYieldTo: [], reason: 'busy-only-ok' };
  }

  /** @type {string[]} */
  const mustYieldTo = [];

  const primary = activeVisualPrimary(snapshot);
  if (primary && primary !== source) {
    mustYieldTo.push(primary);
  }

  const growth = activeGrowthCard(snapshot);
  if (
    growth &&
    growth !== source &&
    (req.kind === OVERLAY_SLOT_KIND.GROWTH_CARD ||
      source === OVERLAY_SOURCES.GROWTH_COMPASS ||
      source === OVERLAY_SOURCES.GROWTH_MUSTARD_SEED)
  ) {
    mustYieldTo.push(growth);
  }

  if (isSessionHardGate(snapshot)) {
    const focusingAllowed =
      source === OVERLAY_SOURCES.FOCUS_AWARENESS &&
      snapshot.sessionState === STATES.FOCUSING;
    if (!focusingAllowed) {
      mustYieldTo.push('session-hard-gate');
    }
  }

  if (source === OVERLAY_SOURCES.REMINDER_BANNER) {
    if (deriveReminderBusySessionTarget(snapshot)) {
      mustYieldTo.push('reminder-busy-target');
    }
    if (snapshot.flowerWelcomeVisible) {
      mustYieldTo.push(OVERLAY_SOURCES.FLOWER_WELCOME);
    }
    if (snapshot.compassOpen) {
      mustYieldTo.push(OVERLAY_SOURCES.GROWTH_COMPASS);
    }
    if (snapshot.mustardSeedOpen) {
      mustYieldTo.push(OVERLAY_SOURCES.GROWTH_MUSTARD_SEED);
    }
  }

  if (source === OVERLAY_SOURCES.TEA_BUBBLE) {
    if (deriveTeaBubbleBusyTarget(snapshot)) {
      mustYieldTo.push('tea-busy-target');
    }
  }

  if (source === OVERLAY_SOURCES.MOMENT_WHISPER) {
    if (deriveMomentWhisperBusy(snapshot, req.contextKey || '')) {
      mustYieldTo.push('moment-whisper-busy');
    }
  }

  if (source === OVERLAY_SOURCES.FOCUS_AWARENESS) {
    if (deriveFocusAwarenessCardBusy(snapshot)) {
      mustYieldTo.push('focus-awareness-busy');
    }
  }

  if (isFirstCardSource(source)) {
    mustYieldTo.push(...collectFirstCardBlockers(snapshot, source));
    if (primary) {
      mustYieldTo.push(primary);
    }
  }

  if (source === OVERLAY_SOURCES.HONESTY_PROMPT) {
    // Contract: prompt does NOT set postSessionOverlay; show is allowed alongside hint.
    return {
      canShow: true,
      mustYieldTo: [],
      reason: 'honesty-prompt-not-post-session'
    };
  }

  const uniqueYield = [...new Set(mustYieldTo)];
  const canShow = uniqueYield.length === 0;

  /** @type {string[]} */
  const preempt = [];
  if (
    canShow &&
    (source === OVERLAY_SOURCES.GROWTH_COMPASS ||
      source === OVERLAY_SOURCES.GROWTH_MUSTARD_SEED) &&
    growth &&
    growth !== source
  ) {
    preempt.push(growth);
  }

  return {
    canShow,
    mustYieldTo: uniqueYield,
    reason: canShow ? 'granted' : `yield:${uniqueYield.join(',')}`,
    ...(preempt.length ? { preempt } : {})
  };
}

/**
 * Whether a first-card source may attempt show now (defer queue head).
 *
 * @param {string} source
 * @param {OverlaySnapshot} snapshot
 * @returns {boolean}
 */
export function canAttemptFirstCard(source, snapshot) {
  const blockers = collectFirstCardBlockers(snapshot, source);
  if (blockers.length) return false;
  if (activeVisualPrimary(snapshot)) return false;
  return requestOverlaySlot({
    source,
    kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
    intent: 'show',
    snapshot
  }).canShow;
}
