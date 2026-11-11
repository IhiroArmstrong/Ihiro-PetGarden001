/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T93 D4 wiring kept out of main.js (architecture line cap).
 */

import { isDesktopShellRuntime } from '../core/desktopShell.js';
import { resolveUpdateChannel } from '../core/desktopUpdaterChannel.js';
import {
  OVERLAY_SLOT_KIND,
  OVERLAY_SOURCES
} from '../core/overlaySlotContractRegistry.js';
import { evaluateEmailJourneyEmptyLibraryChip } from '../core/practiceBackup/emailJourneyEmptyLibrary.js';
import {
  evaluateEmailJourneySitCompletePrompt,
  recordEmailJourneySitCompletePromptDismiss
} from '../core/practiceBackup/emailJourneySitCompletePrompt.js';
import { EmailJourneyEmptyLibraryChipUI } from './EmailJourneyEmptyLibraryChipUI.js';
import { EmailJourneySitCompletePromptUI } from './EmailJourneySitCompletePromptUI.js';

/**
 * @param {object} deps
 * @param {HTMLElement} deps.overlayRoot
 * @param {typeof import('../core/overlaySlotArbitration.js').requestOverlaySlot} deps.requestOverlaySlot
 * @param {(overrides?: object) => object} deps.buildLiveOverlaySnapshot
 * @param {() => void} deps.onOpenRestore
 * @param {() => number} deps.getPracticedDateCount
 * @param {{ state: string }} deps.stateManager
 * @param {{ FOCUSING: string }} deps.STATES
 * @param {(snapshot: object) => boolean} deps.deriveReminderBusySessionTarget
 * @param {() => boolean} [deps.isPracticeStudyInviteVisible]
 */
export function mountEmailJourneyD4Chrome(deps) {
  let sitPromptSlotHeld = false;
  const storage = () =>
    typeof localStorage !== 'undefined' ? localStorage : null;

  function requestEmailJourneySitPromptOverlaySlot() {
    const decision = deps.requestOverlaySlot({
      source: OVERLAY_SOURCES.EMAIL_JOURNEY_SIT_PROMPT,
      kind: OVERLAY_SLOT_KIND.VISUAL_SECONDARY,
      intent: 'show',
      snapshot: deps.buildLiveOverlaySnapshot({
        emailJourneySitPromptOpen: false
      })
    });
    if (!decision.canShow) return false;
    sitPromptSlotHeld = true;
    return true;
  }

  function releaseEmailJourneySitPromptOverlaySlot() {
    sitPromptSlotHeld = false;
  }

  const sitPromptUI = new EmailJourneySitCompletePromptUI(deps.overlayRoot, {
    requestSlot: requestEmailJourneySitPromptOverlaySlot,
    releaseSlot: releaseEmailJourneySitPromptOverlaySlot,
    onSave: () => {
      recordEmailJourneySitCompletePromptDismiss(storage());
      deps.onOpenRestore();
    },
    onDismiss: () => {
      recordEmailJourneySitCompletePromptDismiss(storage());
    }
  });

  const emptyChipUI = new EmailJourneyEmptyLibraryChipUI(deps.overlayRoot, {
    onRestore: () => deps.onOpenRestore()
  });

  function isSitPromptVisible() {
    return sitPromptSlotHeld || sitPromptUI.isVisible();
  }

  function sync() {
    const snapshot = deps.buildLiveOverlaySnapshot();
    const channel = resolveUpdateChannel(
      typeof process !== 'undefined' ? process.env : {}
    );
    const sit = evaluateEmailJourneySitCompletePrompt({
      storage: storage(),
      hasQualifiedPractice: deps.getPracticedDateCount() >= 1,
      focusing: deps.stateManager.state === deps.STATES.FOCUSING,
      sessionBusy: deps.deriveReminderBusySessionTarget(snapshot),
      otherPostSitInviteVisible: deps.isPracticeStudyInviteVisible?.() === true,
      coldStartGoalOpen: snapshot.coldStartGoalOpen,
      postSessionOverlayActive: snapshot.postSessionOverlayActive,
      completionPending: snapshot.completionPending,
      supportModalOpen: snapshot.supportModalOpen,
      sessionState: snapshot.sessionState,
      channel
    });
    if (sit.shouldShow) {
      if (!sitPromptUI.isVisible()) sitPromptUI.tryShow();
    } else if (sitPromptUI.isVisible()) {
      sitPromptUI.hide({ immediate: true });
    }

    const empty = evaluateEmailJourneyEmptyLibraryChip({
      storage: storage(),
      isDesktop: isDesktopShellRuntime(),
      firstSceneOpen: snapshot.coldStartGoalOpen === true,
      welcomeSequencePlaying: snapshot.welcomeSequencePlaying === true,
      focusing: deps.stateManager.state === deps.STATES.FOCUSING,
      sessionState: snapshot.sessionState,
      channel
    });
    emptyChipUI.setVisible(empty.shouldShow);
  }

  const api = {
    sync,
    isSitPromptVisible,
    requestOverlaySlot: deps.requestOverlaySlot
  };
  if (typeof window !== 'undefined') {
    window.__emailJourneyD4 = api;
  }
  return api;
}
