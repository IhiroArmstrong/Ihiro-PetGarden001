/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T68 gate 2b — rate-model fixture, not a live InterventionOrchestrator run.
 * Inputs: assumed invitesPerWeek × acceptRate, plus T58 pause only on
 * always-refuse. T57 hour-cap / 10-min cooldown constants are imported
 * for documentation; this loop does not call decideAwakenInvite.
 */

import {
  AWAKEN_COOLDOWN_MS,
  AWAKEN_MAX_PER_HOUR
} from './InterventionOrchestrator.js';
import {
  YIN_ADAPTATION_DISMISS_STREAK,
  YIN_ADAPTATION_PAUSE_MS
} from './yinAdaptationStore.js';

export const CO_PRACTICE_GIFT_ART_EXPOSURE_PASS = Object.freeze({
  steadyLight55MaxWeeks: 14,
  steadyLight25MaxWeeks: 30,
  deepWeeklyMinWeeks: 3,
  deepWeeklyMaxWeeks: 6
});

/**
 * @param {{
 *   invitesPerWeek: number,
 *   acceptRate: number,
 *   minBDays?: number,
 *   minSpanDays?: number,
 *   alwaysRefuse?: boolean,
 *   maxWeeks?: number
 * }} opts
 * @returns {{ weeks: number | null, bDays: number, pausedWeeks: number }}
 */
export function simulateWeeksToFirstGiftB(opts) {
  const minBDays = opts.minBDays ?? 3;
  const minSpanDays = opts.minSpanDays ?? 21;
  const maxWeeks = opts.maxWeeks ?? 80;
  const invitesPerWeek = Math.max(0, Number(opts.invitesPerWeek) || 0);
  const acceptRate = Math.min(1, Math.max(0, Number(opts.acceptRate) || 0));
  void AWAKEN_MAX_PER_HOUR;
  void AWAKEN_COOLDOWN_MS;

  /** @type {number[]} */
  const bWeekIndex = [];
  let dismissStreak = 0;
  let pausedUntilWeek = 0;
  let pausedWeeks = 0;
  let credit = 0;

  for (let week = 1; week <= maxWeeks; week += 1) {
    if (week < pausedUntilWeek) {
      pausedWeeks += 1;
      continue;
    }
    if (opts.alwaysRefuse) {
      dismissStreak += Math.max(1, Math.round(invitesPerWeek) || 1);
      if (dismissStreak >= YIN_ADAPTATION_DISMISS_STREAK) {
        pausedUntilWeek = week + Math.ceil(YIN_ADAPTATION_PAUSE_MS / 86400000 / 7);
        dismissStreak = 0;
      }
      continue;
    }
    credit += invitesPerWeek * acceptRate;
    if (credit >= 1) {
      credit -= 1;
      bWeekIndex.push(week);
    }
    if (bWeekIndex.length >= minBDays) {
      const first = bWeekIndex[0];
      const last = bWeekIndex[bWeekIndex.length - 1];
      if ((last - first) * 7 >= minSpanDays) {
        return { weeks: last, bDays: bWeekIndex.length, pausedWeeks };
      }
    }
  }
  return { weeks: null, bDays: bWeekIndex.length, pausedWeeks };
}

export function steadyLightExposure(acceptRate) {
  return simulateWeeksToFirstGiftB({
    invitesPerWeek: 0.55,
    acceptRate
  });
}

export function deepWeeklyExposure() {
  return simulateWeeksToFirstGiftB({
    invitesPerWeek: 1.5,
    acceptRate: 0.75
  });
}

export function alwaysRefuseDeepPractitionerExposure() {
  return simulateWeeksToFirstGiftB({
    invitesPerWeek: 1.5,
    acceptRate: 0,
    alwaysRefuse: true
  });
}
