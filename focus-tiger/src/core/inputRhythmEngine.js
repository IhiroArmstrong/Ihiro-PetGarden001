/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { shouldSuppressAwayReminders } from './FocusSession.js';
import { AWAKEN_COOLDOWN_MS } from './InterventionOrchestrator.js';

export const RHYTHM_LEVEL = Object.freeze({
  L0: 'L0',
  L1: 'L1'
});

export const RHYTHM_COOLDOWN_ADVANCE_MS = 2 * 60 * 1000;
export const RHYTHM_LONG_SIT_ADVANCE_MS = 60 * 1000;
export const RHYTHM_BACKSPACE_EARLY_RATIO = 0.25;
export const RHYTHM_MIN_COOLDOWN_MS = 60 * 1000;
export const RHYTHM_WINDOW_SECONDS = 300;

/**
 * @param {object} input
 * @returns {{
 *   level: 'L0'|'L1',
 *   cooldownAdjustMs: number,
 *   longSitAdvanceMs: number,
 *   allowEarlyAwayInvite: boolean,
 *   reason: string
 * }}
 */
export function decideRhythmTiming(input = {}) {
  const enabled = input.enabled === true;
  const authorized = input.authorized === true;
  const helperAlive = input.helperAlive === true;
  if (!enabled || !authorized || !helperAlive) {
    return {
      level: RHYTHM_LEVEL.L0,
      cooldownAdjustMs: 0,
      longSitAdvanceMs: 0,
      allowEarlyAwayInvite: false,
      reason: 'sb-21'
    };
  }

  if (shouldSuppressAwayReminders(input.companionMode)) {
    return {
      level: RHYTHM_LEVEL.L1,
      cooldownAdjustMs: 0,
      longSitAdvanceMs: 0,
      allowEarlyAwayInvite: false,
      reason: 'flow-protect'
    };
  }

  const keys = Math.max(0, Number(input.keyCount5m) || 0);
  const backs = Math.max(0, Number(input.backspaceCount5m) || 0);
  const backspaceRatio =
    typeof input.backspaceRatio === 'number'
      ? input.backspaceRatio
      : keys > 0
        ? backs / keys
        : 0;
  const switchedAway =
    input.awayFromTaskApp === true || (Number(input.switchCount5m) || 0) >= 1;
  const elevatedBackspace = backspaceRatio >= RHYTHM_BACKSPACE_EARLY_RATIO;
  const allowEarly = elevatedBackspace && switchedAway;

  return {
    level: RHYTHM_LEVEL.L1,
    cooldownAdjustMs: allowEarly ? -RHYTHM_COOLDOWN_ADVANCE_MS : 0,
    longSitAdvanceMs: allowEarly ? RHYTHM_LONG_SIT_ADVANCE_MS : 0,
    allowEarlyAwayInvite: allowEarly,
    reason: allowEarly ? 'early-away-and-backspace' : 'neutral'
  };
}

/**
 * @param {{ cooldownAdjustMs?: number }} timing
 * @returns {number}
 */
export function effectiveAwakenCooldownMs(timing = {}) {
  const adjusted = AWAKEN_COOLDOWN_MS + (Number(timing.cooldownAdjustMs) || 0);
  return Math.max(RHYTHM_MIN_COOLDOWN_MS, adjusted);
}

/**
 * @param {{ keys: number, backs: number, switches: number }} totals
 * @returns {{ switchCount: number, backspaceBand: 'few'|'some', switchBand: 'few'|'some' }}
 */
export function observationalRhythmStats(totals = {}) {
  const keys = Math.max(0, Number(totals.keys) || 0);
  const backs = Math.max(0, Number(totals.backs) || 0);
  const switches = Math.max(0, Number(totals.switches) || 0);
  const ratio = keys > 0 ? backs / keys : 0;
  return {
    switchCount: switches,
    backspaceBand: ratio >= RHYTHM_BACKSPACE_EARLY_RATIO ? 'some' : 'few',
    switchBand: switches >= 2 ? 'some' : 'few'
  };
}

/**
 * Rolling 5-minute second buckets. In-memory only.
 */
export class InputRhythmWindow {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    /** @type {Map<number, { keys: number, backs: number, switches: number }>} */
    this.buckets = new Map();
  }

  /**
   * @param {{ t?: number, keys?: number, backs?: number, switches?: number }} sample
   */
  ingest(sample) {
    const t = Number(sample?.t) || this.now();
    const sec = Math.floor(t / 1000);
    const prev = this.buckets.get(sec) || { keys: 0, backs: 0, switches: 0 };
    this.buckets.set(sec, {
      keys: prev.keys + Math.max(0, Number(sample.keys) || 0),
      backs: prev.backs + Math.max(0, Number(sample.backs) || 0),
      switches: prev.switches + Math.max(0, Number(sample.switches) || 0)
    });
    this.prune(t);
  }

  prune(now = this.now()) {
    const cutoff = Math.floor(now / 1000) - RHYTHM_WINDOW_SECONDS;
    for (const key of this.buckets.keys()) {
      if (key < cutoff) this.buckets.delete(key);
    }
  }

  totals(now = this.now()) {
    this.prune(now);
    let keys = 0;
    let backs = 0;
    let switches = 0;
    for (const row of this.buckets.values()) {
      keys += row.keys;
      backs += row.backs;
      switches += row.switches;
    }
    return { keys, backs, switches };
  }

  clear() {
    this.buckets.clear();
  }
}
