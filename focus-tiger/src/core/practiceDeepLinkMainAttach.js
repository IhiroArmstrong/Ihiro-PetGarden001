/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  createPracticeDeepLinkWebHost,
  PRACTICE_DEEP_LINK_TOAST_TESTID
} from './practiceDeepLinkWebHost.js';
import { handleSitClickWhenIdleChrome } from './sitClickWhenIdleChrome.js';

export { handleSitClickWhenIdleChrome } from './sitClickWhenIdleChrome.js';
export { takePracticeDeepLinkFocusMinutes } from './practiceDeepLinkSessionMinutes.js';

/**
 * @param {object} ctx
 */
export function productSitIdleOpts(ctx) {
  return {
    completionPending: ctx.bootSessionChrome.sessionUiGate.completionPending,
    arrivalOpen: ctx.bootHonestyCompanion.arrivalPractice.isOpen(),
    isFocusing: ctx.stateManager.state === ctx.STATES.FOCUSING,
    microRitualOpen: ctx.isMicroRitualSitLatchActive(),
    resolveSitClickWhenIdle: (ext) =>
      ctx.bootSessionChrome.sessionUiGate.resolveSitClickWhenIdle(ext),
    cancelPending: () => ctx.sessionEndFlow.cancelPending(),
    hideHonesty: () => {
      ctx.honestyBridge?.hide();
      ctx.bootHonestyCompanion.honestyCheckInUI.hide();
    },
    startArrival: () => ctx.startArrivalPracticeFromChrome(),
    beginFocusWithSelectedMode: () =>
      ctx.requestBeginFocusWithMode(
        ctx.bootHonestyCompanion.companionModePicker.getSelectedMode()
      )
  };
}

/**
 * @param {object} ctx
 */
export function attachPracticeDeepLinkWebHost(ctx) {
  const host = createPracticeDeepLinkWebHost({
    getSearch: () => ctx.location.search,
    isUiReady: () => ctx.window.__FT_APP_READY__ === true,
    isOverlayBusy: () => ctx.isSceneAnimOverlayBusy(),
    getSessionState: () => ctx.stateManager.state,
    isCompletionPending: () =>
      ctx.bootSessionChrome.sessionUiGate.completionPending === true,
    isDeferColdStart: () =>
      ctx.isWelcomeFirstPaintPlaying() ||
      ctx.coldStartGoalCardUI?.isOpen?.() === true ||
      ctx.shouldDeferForColdStartGoal?.() === true,
    isAlreadyOnSitPath: () =>
      ctx.bootHonestyCompanion.arrivalPractice.isOpen() ||
      ctx.stateManager.state === ctx.STATES.FOCUSING,
    resolveSitClickWhenIdle: () =>
      ctx.bootSessionChrome.sessionUiGate.resolveSitClickWhenIdle({
        isFocusing: ctx.stateManager.state === ctx.STATES.FOCUSING,
        microRitualOpen: ctx.isMicroRitualSitLatchActive()
      }),
    startSitArrival: () => handleSitClickWhenIdleChrome(productSitIdleOpts(ctx)),
    showToast: (kind) => {
      ctx.mindfulToast.element.dataset.testid = PRACTICE_DEEP_LINK_TOAST_TESTID;
      ctx.mindfulToast.show(
        ctx.t(
          kind === 'busy'
            ? 'PRACTICE_DEEP_LINK_BUSY'
            : 'PRACTICE_DEEP_LINK_DISCARD'
        )
      );
    }
  });
  ctx.markAppReady(ctx.window);
  host.noteReady();
  return host;
}
