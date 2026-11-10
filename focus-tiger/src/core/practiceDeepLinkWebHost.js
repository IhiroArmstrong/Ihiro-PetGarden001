/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  classifyPracticeDeepLinkSearch,
  resolvePracticeDeepLinkApply
} from './practiceDeepLinkApply.js';
import { armPracticeDeepLinkFocusMinutes } from './practiceDeepLinkSessionMinutes.js';

export const PRACTICE_DEEP_LINK_TOAST_TESTID = 'practice-deep-link-toast';

/**
 * @param {object} deps
 * @param {() => string} deps.getSearch
 * @param {() => boolean} deps.isUiReady
 * @param {() => boolean} deps.isOverlayBusy
 * @param {() => string} deps.getSessionState
 * @param {() => boolean} deps.isCompletionPending
 * @param {() => boolean} deps.isDeferColdStart
 * @param {() => boolean} deps.isAlreadyOnSitPath
 * @param {() => 'ignore' | 'start-arrival' | string} deps.resolveSitClickWhenIdle
 * @param {() => boolean} deps.startSitArrival
 * @param {(kind: 'discard' | 'busy') => void} deps.showToast
 * @param {(fn: () => void, ms: number) => unknown} [deps.schedule]
 * @param {(id: unknown) => void} [deps.clearSchedule]
 */
export function createPracticeDeepLinkWebHost(deps) {
  let pending = /** @type {{ start: string, minutes: number } | null} */ (null);
  let consumed = false;
  let pollId = /** @type {unknown} */ (null);
  const schedule = deps.schedule ?? ((fn, ms) => setInterval(fn, ms));
  const clearSchedule = deps.clearSchedule ?? ((id) => clearInterval(id));

  function stopPoll() {
    if (pollId != null) {
      clearSchedule(pollId);
      pollId = null;
    }
  }

  function finish() {
    consumed = true;
    pending = null;
    stopPoll();
  }

  function classifiedNow() {
    return classifyPracticeDeepLinkSearch(deps.getSearch());
  }

  function tryApply() {
    if (consumed) return 'ignore';
    const classified = pending
      ? { kind: 'sit', intent: pending }
      : classifiedNow();
    if (classified.kind === 'sit' && classified.intent) {
      pending = classified.intent;
    }
    const result = resolvePracticeDeepLinkApply({
      classified: pending
        ? { kind: 'sit', intent: pending }
        : classified,
      uiReady: deps.isUiReady(),
      overlayBusy: deps.isOverlayBusy(),
      sessionState: deps.getSessionState(),
      completionPending: deps.isCompletionPending(),
      deferColdStart: deps.isDeferColdStart(),
      alreadyOnSitPath: deps.isAlreadyOnSitPath(),
      sitAction: deps.resolveSitClickWhenIdle()
    });

    if (result.action === 'defer') {
      if (pollId == null) {
        pollId = schedule(() => {
          tryApply();
        }, 400);
      }
      return 'defer';
    }

    if (result.action === 'ignore') {
      return 'ignore';
    }
    if (result.action === 'discard-silent') {
      finish();
      return 'discard-silent';
    }
    if (result.action === 'toast-discard') {
      deps.showToast('discard');
      finish();
      return 'toast-discard';
    }
    if (result.action === 'toast-busy') {
      deps.showToast('busy');
      finish();
      return 'toast-busy';
    }
    if (result.action === 'consume-quiet') {
      finish();
      return 'consume-quiet';
    }
    if (result.action === 'apply-sit' && result.intent) {
      armPracticeDeepLinkFocusMinutes(result.intent.minutes);
      deps.startSitArrival();
      finish();
      return 'apply-sit';
    }
    return result.action;
  }

  function noteReady() {
    return tryApply();
  }

  return { noteReady, tryApply };
}
