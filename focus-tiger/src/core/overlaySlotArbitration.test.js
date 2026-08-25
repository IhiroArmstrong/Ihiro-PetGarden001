/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { STATES } from './StateManager.js';
import { computePostSessionOverlayActive } from './SessionUiGate.js';
import { isReminderBusySession } from './InAppReminderBannerController.js';
import { isHonestyPhaseBusy, isHonestyUiBusy } from './sessionChromeSync.js';
import {
  FIRST_CARD_DEFER_PRIORITY,
  OVERLAY_SLOT_KIND,
  OVERLAY_SOURCES,
  OVERLAY_SOURCE_CONTRACTS
} from './overlaySlotContractRegistry.js';
import {
  buildOverlaySnapshot,
  deriveSceneAnimOverlayBusy,
  deriveOverlayBusyForSprite,
  derivePostSessionOverlayFromSources,
  derivePostSessionOverlayActiveTarget,
  deriveReminderBusySession,
  deriveReminderBusySessionTarget,
  deriveTeaBubbleBusy,
  deriveTeaBubbleBusyTarget,
  deriveMomentWhisperBusy,
  deriveFocusAwarenessCardBusy,
  deriveIdleYinTapOverlayBusy,
  derivePracticeBackupBusy,
  deriveConfideOpenBlocked,
  deriveSeasonalThemeBusy,
  deriveElectronIdleContextMenuBlocked,
  deriveHonestyIdleEntryBlocked,
  requestOverlaySlot,
  canAttemptFirstCard
} from './overlaySlotArbitration.js';

/** Inline replica of main.isSceneAnimOverlayBusy (pre-PR-2). */
function legacySceneAnimOverlayBusy(flags) {
  return (
    flags.honestyPhase !== 'hidden' ||
    flags.arrivalOpen ||
    flags.reflectionOpen ||
    flags.microRitualOpen ||
    flags.focusDurationPickerOpen
  );
}

/** Inline replica of main contextual tea isBusy. */
function legacyTeaBubbleBusy(flags) {
  return (
    flags.tipJarOpen ||
    flags.supportModalOpen ||
    flags.sanctuaryOpen ||
    flags.membershipOpen ||
    flags.mustardSeedOpen ||
    flags.reflectionOpen ||
    flags.arrivalOpen ||
    flags.compassOpen
  );
}

/** Inline replica of main.isMomentWhisperBusy. */
function legacyMomentWhisperBusy(flags, forKey) {
  if (flags.compassOpen) return true;
  if (flags.sessionState === STATES.CELEBRATE) return true;
  if (flags.microRitualOpen) return true;
  if (
    forKey !== 'arrive' &&
    flags.honestyPhase &&
    flags.honestyPhase !== 'hidden'
  ) {
    return true;
  }
  if (flags.companionPickerOpen) return true;
  if (forKey !== 'arrive' && flags.arrivalOpen) return true;
  if (forKey !== 'reflect' && flags.reflectionOpen) return true;
  return false;
}

describe('buildOverlaySnapshot', () => {
  it('defaults to idle / hidden honesty', () => {
    const s = buildOverlaySnapshot();
    assert.equal(s.sessionState, STATES.IDLE);
    assert.equal(s.honestyPhase, 'hidden');
    assert.equal(s.arrivalOpen, false);
  });
});

describe('legacy derive equivalence (Phase A regression)', () => {
  const phases = ['hidden', 'prompt', 'duration', 'breath', 'thanks'];

  for (const honestyPhase of phases) {
    for (const arrivalOpen of [false, true]) {
      for (const reflectionOpen of [false, true]) {
        for (const microRitualOpen of [false, true]) {
          for (const focusDurationPickerOpen of [false, true]) {
            it(`sceneAnim busy parity phase=${honestyPhase}`, () => {
              const flags = {
                honestyPhase,
                arrivalOpen,
                reflectionOpen,
                microRitualOpen,
                focusDurationPickerOpen
              };
              const snapshot = buildOverlaySnapshot(flags);
              assert.equal(
                deriveSceneAnimOverlayBusy(snapshot),
                legacySceneAnimOverlayBusy(flags)
              );
              assert.equal(
                deriveOverlayBusyForSprite(snapshot),
                legacySceneAnimOverlayBusy(flags)
              );
            });
          }
        }
      }
    }
  }

  it('postSession sources match computePostSessionOverlayActive array', () => {
    const combos = [
      [true, false, false, false, false],
      [false, true, false, true, false],
      [false, false, true, false, true]
    ];
    for (const [a, r, m, rf, fdp] of combos) {
      const snapshot = buildOverlaySnapshot({
        arrivalOpen: a,
        reflectionOpen: r,
        microRitualOpen: m,
        ritualFlowOpen: rf,
        focusDurationPickerOpen: fdp
      });
      assert.equal(
        derivePostSessionOverlayFromSources(snapshot),
        computePostSessionOverlayActive([a, r, m, rf, fdp])
      );
    }
  });

  it('mustard-seed NOT in legacy postSession sources (C1 gap preserved)', () => {
    const snapshot = buildOverlaySnapshot({
      mustardSeedOpen: true,
      arrivalOpen: false,
      reflectionOpen: false
    });
    assert.equal(derivePostSessionOverlayFromSources(snapshot), false);
  });

  it('reminder busy matches isReminderBusySession', () => {
    const states = [STATES.IDLE, STATES.FOCUSING, STATES.CELEBRATE];
    for (const sessionState of states) {
      for (const arrivalOpen of [false, true]) {
        const snapshot = buildOverlaySnapshot({ sessionState, arrivalOpen });
        assert.equal(
          deriveReminderBusySession(snapshot),
          isReminderBusySession({
            state: sessionState,
            arrivalOpen,
            reflectionOpen: false,
            microRitualOpen: false
          })
        );
      }
    }
  });

  it('tea bubble busy parity', () => {
    const flags = {
      tipJarOpen: true,
      supportModalOpen: false,
      sanctuaryOpen: false,
      membershipOpen: false,
      mustardSeedOpen: false,
      reflectionOpen: true,
      arrivalOpen: false,
      compassOpen: false
    };
    const snapshot = buildOverlaySnapshot(flags);
    assert.equal(deriveTeaBubbleBusy(snapshot), legacyTeaBubbleBusy(flags));
  });

  it('tea bubble legacy gap: honesty breath NOT busy (C2 pre-fix)', () => {
    const snapshot = buildOverlaySnapshot({ honestyPhase: 'breath' });
    assert.equal(deriveTeaBubbleBusy(snapshot), false);
  });

  it('moment whisper key-aware parity', () => {
    const flags = {
      compassOpen: false,
      sessionState: STATES.IDLE,
      microRitualOpen: false,
      honestyPhase: 'prompt',
      companionPickerOpen: false,
      arrivalOpen: true,
      reflectionOpen: true
    };
    const snapshot = buildOverlaySnapshot(flags);
    assert.equal(
      deriveMomentWhisperBusy(snapshot, 'arrive'),
      legacyMomentWhisperBusy(flags, 'arrive')
    );
    assert.equal(
      deriveMomentWhisperBusy(snapshot, 'reflect'),
      legacyMomentWhisperBusy(flags, 'reflect')
    );
    assert.equal(
      deriveMomentWhisperBusy(snapshot, 'focus'),
      legacyMomentWhisperBusy(flags, 'focus')
    );
  });

  it('focus awareness busy includes all honesty phases', () => {
    const snapshot = buildOverlaySnapshot({
      honestyPhase: 'prompt',
      arrivalOpen: false
    });
    assert.equal(deriveFocusAwarenessCardBusy(snapshot), true);
  });

  it('idle yin tap uses gate flag and honesty phase subset', () => {
    const gateOnly = buildOverlaySnapshot({
      postSessionOverlayActive: true,
      honestyPhase: 'prompt'
    });
    assert.equal(deriveIdleYinTapOverlayBusy(gateOnly), true);

    const phaseOnly = buildOverlaySnapshot({
      honestyPhase: 'duration',
      postSessionOverlayActive: false
    });
    assert.equal(deriveIdleYinTapOverlayBusy(phaseOnly), true);

    const promptOnly = buildOverlaySnapshot({
      honestyPhase: 'prompt',
      postSessionOverlayActive: false
    });
    assert.equal(deriveIdleYinTapOverlayBusy(promptOnly), false);
  });

  it('practice backup busy parity', () => {
    const snapshot = buildOverlaySnapshot({
      sessionState: STATES.IDLE,
      arrivalOpen: true,
      honestyPhase: 'hidden',
      postSessionOverlayActive: false
    });
    const d = derivePracticeBackupBusy(snapshot);
    assert.equal(d.busy, true);
    assert.equal(d.retry, true);
  });

  it('confide blocked when bridge visible', () => {
    const snapshot = buildOverlaySnapshot({ honestyBridgeVisible: true });
    assert.equal(deriveConfideOpenBlocked(snapshot), true);
  });

  it('seasonal theme busy is arrival|reflection|micro only', () => {
    assert.equal(
      deriveSeasonalThemeBusy(buildOverlaySnapshot({ ritualFlowOpen: true })),
      false
    );
    assert.equal(
      deriveSeasonalThemeBusy(buildOverlaySnapshot({ microRitualOpen: true })),
      true
    );
  });

  it('electron context menu blocked when honesty prompt', () => {
    const snapshot = buildOverlaySnapshot({ honestyPhase: 'prompt' });
    assert.equal(deriveElectronIdleContextMenuBlocked(snapshot), true);
  });

  it('honesty idle entry blocked includes focusing', () => {
    const snapshot = buildOverlaySnapshot({ sessionState: STATES.FOCUSING });
    assert.equal(deriveHonestyIdleEntryBlocked(snapshot), true);
  });
});

describe('target matrix (C1–C6 · PR-2 contract)', () => {
  it('C1: mustard-seed in target postSession sources', () => {
    const snapshot = buildOverlaySnapshot({ mustardSeedOpen: true });
    assert.equal(derivePostSessionOverlayActiveTarget(snapshot), true);
    assert.equal(derivePostSessionOverlayFromSources(snapshot), false);
  });

  it('C2: tea bubble target blocks honesty breath', () => {
    const snapshot = buildOverlaySnapshot({ honestyPhase: 'breath' });
    assert.equal(deriveTeaBubbleBusyTarget(snapshot), true);
    assert.equal(deriveTeaBubbleBusy(snapshot), false);
  });

  it('C3: tea bubble target blocks micro ritual', () => {
    const snapshot = buildOverlaySnapshot({ microRitualOpen: true });
    assert.equal(deriveTeaBubbleBusyTarget(snapshot), true);
  });

  it('C4: reminder target blocks compass open', () => {
    const snapshot = buildOverlaySnapshot({ compassOpen: true });
    assert.equal(deriveReminderBusySession(snapshot), false);
    assert.equal(deriveReminderBusySessionTarget(snapshot), true);
    const d = requestOverlaySlot({
      source: OVERLAY_SOURCES.REMINDER_BANNER,
      kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
      intent: 'show',
      snapshot
    });
    assert.equal(d.canShow, false);
    assert.ok(d.mustYieldTo.includes(OVERLAY_SOURCES.GROWTH_COMPASS));
  });

  it('C5: reminder target blocks mustard seed', () => {
    const snapshot = buildOverlaySnapshot({ mustardSeedOpen: true });
    assert.equal(deriveReminderBusySessionTarget(snapshot), true);
    const d = requestOverlaySlot({
      source: OVERLAY_SOURCES.REMINDER_BANNER,
      intent: 'show',
      snapshot
    });
    assert.equal(d.canShow, false);
  });

  it('C6: first-card queue flower > compass > wellness', () => {
    assert.deepEqual(FIRST_CARD_DEFER_PRIORITY, [
      OVERLAY_SOURCES.FLOWER_WELCOME,
      OVERLAY_SOURCES.GROWTH_COMPASS,
      OVERLAY_SOURCES.WELLNESS_FIRST
    ]);

    const withFlower = buildOverlaySnapshot({ flowerWelcomeVisible: true });
    assert.equal(
      canAttemptFirstCard(OVERLAY_SOURCES.GROWTH_COMPASS, withFlower),
      false
    );
    assert.equal(
      canAttemptFirstCard(OVERLAY_SOURCES.WELLNESS_FIRST, withFlower),
      false
    );

    const withCompass = buildOverlaySnapshot({ compassOpen: true });
    assert.equal(
      canAttemptFirstCard(OVERLAY_SOURCES.WELLNESS_FIRST, withCompass),
      false
    );
    assert.equal(
      canAttemptFirstCard(OVERLAY_SOURCES.GROWTH_COMPASS, withCompass),
      true
    );
  });
});

describe('requestOverlaySlot', () => {
  it('honesty prompt show granted without postSession yield', () => {
    const snapshot = buildOverlaySnapshot({ honestyPhase: 'prompt' });
    const d = requestOverlaySlot({
      source: OVERLAY_SOURCES.HONESTY_PROMPT,
      kind: OVERLAY_SLOT_KIND.BUSY_ONLY,
      intent: 'show',
      snapshot
    });
    assert.equal(d.canShow, true);
    assert.equal(d.reason, 'honesty-prompt-not-post-session');
  });

  it('arrival blocks compass first card', () => {
    const snapshot = buildOverlaySnapshot({ arrivalOpen: true });
    const d = requestOverlaySlot({
      source: OVERLAY_SOURCES.GROWTH_COMPASS,
      kind: OVERLAY_SLOT_KIND.GROWTH_CARD,
      intent: 'show',
      snapshot
    });
    assert.equal(d.canShow, false);
    assert.ok(d.mustYieldTo.includes(OVERLAY_SOURCES.ARRIVAL));
  });

  it('focus awareness allowed during focusing', () => {
    const snapshot = buildOverlaySnapshot({ sessionState: STATES.FOCUSING });
    const d = requestOverlaySlot({
      source: OVERLAY_SOURCES.FOCUS_AWARENESS,
      kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
      intent: 'show',
      snapshot
    });
    assert.equal(d.canShow, true);
  });

  it('reminder blocked during focusing via session hard gate', () => {
    const snapshot = buildOverlaySnapshot({ sessionState: STATES.FOCUSING });
    const d = requestOverlaySlot({
      source: OVERLAY_SOURCES.REMINDER_BANNER,
      intent: 'show',
      snapshot
    });
    assert.equal(d.canShow, false);
    assert.ok(d.mustYieldTo.includes('session-hard-gate'));
  });
});

describe('overlaySlotContractRegistry', () => {
  it('every OVERLAY_SOURCES used in contracts is registered', () => {
    const registered = new Set(OVERLAY_SOURCE_CONTRACTS.map((c) => c.id));
    for (const value of Object.values(OVERLAY_SOURCES)) {
      if (value === OVERLAY_SOURCES.SOFT_UPDATE) continue;
      if (value === OVERLAY_SOURCES.SEASONAL_WHISPER) continue;
      assert.ok(registered.has(value), `missing contract for ${value}`);
    }
  });

  it('honesty prompt contract is BUSY_ONLY', () => {
    const row = OVERLAY_SOURCE_CONTRACTS.find(
      (c) => c.id === OVERLAY_SOURCES.HONESTY_PROMPT
    );
    assert.equal(row?.kind, OVERLAY_SLOT_KIND.BUSY_ONLY);
  });
});

describe('honesty phase helpers alignment', () => {
  it('isHonestyPhaseBusy excludes prompt', () => {
    assert.equal(isHonestyPhaseBusy('prompt'), false);
    assert.equal(isHonestyPhaseBusy('duration'), true);
  });

  it('isHonestyUiBusy includes prompt', () => {
    assert.equal(isHonestyUiBusy('prompt'), true);
    assert.equal(isHonestyUiBusy('hidden'), false);
  });
});
