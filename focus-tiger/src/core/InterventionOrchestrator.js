/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { shouldSuppressAwayReminders } from './FocusSession.js';

export const AWAKEN_STATES = Object.freeze({
  NEUTRAL: 'NEUTRAL',
  FLOW_PROTECT: 'FLOW_PROTECT',
  AWAY_INVITE: 'AWAY_INVITE',
  LONG_SIT_INVITE: 'LONG_SIT_INVITE'
});

export const AWAKEN_COOLDOWN_MS = 10 * 60 * 1000;
export const AWAKEN_MAX_PER_HOUR = 1;
export const AWAKEN_AUTO_DISMISS_MS = 10_000;
export const AWAKEN_EXTEND_MINUTES = 5;
export const AWAKEN_HOUR_MS = 60 * 60 * 1000;

/** Copy must not use these labels (T51 Brief). */
export const AWAKEN_FORBIDDEN_COPY =
  /焦虑|分心诊断|心流指数|分数|\banxiety\b|\bflow index\b|\bscore\b/i;

/**
 * @param {string} companionMode
 * @returns {'NEUTRAL'|'FLOW_PROTECT'}
 */
export function awakenModeState(companionMode) {
  return shouldSuppressAwayReminders(companionMode)
    ? AWAKEN_STATES.FLOW_PROTECT
    : AWAKEN_STATES.NEUTRAL;
}

/**
 * @param {object} input
 * @returns {{ show: false, reason: string } | { show: true, kind: 'pause'|'extend', state: string }}
 */
export function decideAwakenInvite(input = {}) {
  const now = Number(input.now) || 0;
  if (input.focusing !== true) return deny('not-focusing');
  if (input.trayHidden === true) return deny('sb-18');
  if (input.yieldBusy === true) return deny('sb-10');
  if (input.inviteVisible === true) return deny('already-visible');

  let hourCount = Number(input.hourCount) || 0;
  const hourWindowStart = Number(input.hourWindowStart) || 0;
  if (hourWindowStart > 0 && now - hourWindowStart >= AWAKEN_HOUR_MS) {
    hourCount = 0;
  }
  if (hourCount >= AWAKEN_MAX_PER_HOUR) return deny('hour-cap');

  const lastActiveAt = Number(input.lastActiveAt) || 0;
  if (lastActiveAt > 0 && now - lastActiveAt < AWAKEN_COOLDOWN_MS) {
    return deny('cooldown');
  }

  const flowProtect =
    awakenModeState(input.companionMode) === AWAKEN_STATES.FLOW_PROTECT;

  if (input.kind === 'extend') {
    if (!flowProtect) return deny('here-and-now-no-extend');
    if (input.sessionReachedTarget !== true) return deny('not-at-target');
    if (input.extendOfferedThisTarget === true) return deny('already-offered');
    return allow('extend', AWAKEN_STATES.FLOW_PROTECT);
  }

  if (flowProtect) return deny('sb-03');

  if (input.kind === 'long-sit') {
    if (input.stretchDue !== true) return deny('stretch-not-due');
    return allow('pause', AWAKEN_STATES.LONG_SIT_INVITE);
  }

  if (input.displayEligible !== true) return deny('below-refocus-threshold');
  if (input.refocusSlotConsumed !== true) return deny('refocus-first');
  return allow('pause', AWAKEN_STATES.AWAY_INVITE);
}

function deny(reason) {
  return { show: false, reason };
}

function allow(kind, state) {
  return { show: true, kind, state };
}

export class InterventionOrchestrator {
  /**
   * @param {{ now?: () => number }} [deps]
   */
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.state = AWAKEN_STATES.NEUTRAL;
    this.lastActiveAt = 0;
    this.hourWindowStart = 0;
    this.hourCount = 0;
    this.extendOfferedThisTarget = false;
  }

  startSession(companionMode) {
    this.state = awakenModeState(companionMode);
    this.extendOfferedThisTarget = false;
  }

  stopSession() {
    this.state = AWAKEN_STATES.NEUTRAL;
    this.extendOfferedThisTarget = false;
  }

  noteCooldownEvent() {
    const now = this.now();
    this.lastActiveAt = now;
    if (this.hourWindowStart === 0 || now - this.hourWindowStart >= AWAKEN_HOUR_MS) {
      this.hourWindowStart = now;
      this.hourCount = 0;
    }
  }

  noteInviteShown() {
    this.noteCooldownEvent();
    this.hourCount += 1;
  }

  /**
   * @param {object} input
   */
  decide(input) {
    const now = this.now();
    let hourCount = this.hourCount;
    let hourWindowStart = this.hourWindowStart;
    if (hourWindowStart > 0 && now - hourWindowStart >= AWAKEN_HOUR_MS) {
      hourCount = 0;
      hourWindowStart = 0;
    }
    const decision = decideAwakenInvite({
      ...input,
      now,
      lastActiveAt: this.lastActiveAt,
      hourCount,
      hourWindowStart,
      extendOfferedThisTarget: this.extendOfferedThisTarget
    });
    if (decision.show) this.state = decision.state;
    return decision;
  }

  markExtendOffered() {
    this.extendOfferedThisTarget = true;
  }

  clearExtendHold() {
    this.extendOfferedThisTarget = false;
  }
}
