/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Read-only Growth Journey detail.
 * The dot matches the home line. Facts are lifetime minutes plus a rhythm
 * of stored practice dates. No day-count, no percentage, no score.
 */

import { growthJourneyHomeLineModel } from './growthJourneyHomeLine.js';
import {
  GROWTH_JOURNEY_STAGES,
  displayGrowthJourneyStage,
  stageForEligibleMinutes
} from './growthJourneyStage.js';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

const NEXT_STEP_KEYS = Object.freeze({
  begin: 'GROWTH_JOURNEY_NEXT_BEGIN',
  notice: 'GROWTH_JOURNEY_NEXT_NOTICE',
  practice: 'GROWTH_JOURNEY_NEXT_PRACTICE',
  steady: 'GROWTH_JOURNEY_NEXT_STEADY'
});

/**
 * @param {string} dateKey
 * @returns {number}
 */
function dateUtcMs(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/**
 * @param {string} earlier
 * @param {string} later
 * @returns {number}
 */
export function growthJourneyDateGapDays(earlier, later) {
  return Math.round((dateUtcMs(later) - dateUtcMs(earlier)) / 86400000);
}

/**
 * Practiced dates only, oldest first. A calendar gap becomes one paused mark,
 * and the next practice is marked returned.
 * @param {Iterable<unknown>} dates
 * @returns {{ kind: 'practiced' | 'paused' | 'returned', date?: string }[]}
 */
export function growthJourneyRhythmMarks(dates) {
  const keys = [
    ...new Set(
      [...dates].filter(
        (value) => typeof value === 'string' && DATE_KEY_RE.test(value)
      )
    )
  ].sort();
  /** @type {{ kind: 'practiced' | 'paused' | 'returned', date?: string }[]} */
  const marks = [];
  for (let i = 0; i < keys.length; i += 1) {
    const date = keys[i];
    if (i > 0 && growthJourneyDateGapDays(keys[i - 1], date) > 1) {
      marks.push({ kind: 'paused' });
      marks.push({ kind: 'returned', date });
      continue;
    }
    marks.push({ kind: 'practiced', date });
  }
  return marks;
}

/**
 * @param {unknown} minutes
 * @param {(key: string) => string} translate
 * @returns {string}
 */
export function growthJourneyLifetimeText(minutes, translate) {
  const total = Math.max(0, Math.floor(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours <= 0) {
    return translate('GROWTH_JOURNEY_LIFETIME_MINUTES').replaceAll(
      '{minutes}',
      String(mins)
    );
  }
  return translate('GROWTH_JOURNEY_LIFETIME_HOURS')
    .replaceAll('{hours}', String(hours))
    .replaceAll('{minutes}', String(mins));
}

/**
 * @param {object} input
 * @param {unknown} input.eligibleMinutes
 * @param {unknown} input.lifetimeMinutes
 * @param {unknown} [input.floor]
 * @param {Iterable<unknown>} [input.practiceDates]
 * @param {(key: string) => string} input.translate
 */
export function growthJourneyDetailModel({
  eligibleMinutes,
  lifetimeMinutes,
  floor = null,
  practiceDates = [],
  translate
}) {
  const stage = displayGrowthJourneyStage(
    stageForEligibleMinutes(eligibleMinutes),
    floor
  );
  const line = growthJourneyHomeLineModel(eligibleMinutes, floor, translate);
  const nextKey = NEXT_STEP_KEYS[stage];
  return {
    stage,
    position: line.position,
    here: translate('GROWTH_JOURNEY_YOU_ARE_HERE'),
    nextStep: nextKey ? translate(nextKey) : '',
    stages: GROWTH_JOURNEY_STAGES.map((id) => ({
      id,
      label: translate(`GROWTH_JOURNEY_STAGE_${id.toUpperCase()}`)
    })),
    lifetimeText: growthJourneyLifetimeText(lifetimeMinutes, translate),
    rhythm: growthJourneyRhythmMarks(practiceDates)
  };
}
