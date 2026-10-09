/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Home-row copy and dot for Growth Journey.
 * The sentence is assembled from locale parts. Integrated omits the next step.
 * The dot uses the same track position as the detail line will.
 */

import {
  displayGrowthJourneyStage,
  growthJourneyTrackPosition,
  stageForEligibleMinutes
} from './growthJourneyStage.js';

const NEXT_STEP_KEYS = Object.freeze({
  begin: 'GROWTH_JOURNEY_NEXT_BEGIN',
  notice: 'GROWTH_JOURNEY_NEXT_NOTICE',
  practice: 'GROWTH_JOURNEY_NEXT_PRACTICE',
  steady: 'GROWTH_JOURNEY_NEXT_STEADY'
});

/**
 * @param {unknown} minutes
 * @param {unknown} floor
 * @param {(key: string) => string} translate
 * @returns {{ stage: string, text: string, position: number }}
 */
export function growthJourneyHomeLineModel(minutes, floor, translate) {
  const stage = displayGrowthJourneyStage(
    stageForEligibleMinutes(minutes),
    floor
  );
  const stageLabel = translate(`GROWTH_JOURNEY_STAGE_${stage.toUpperCase()}`);
  const here = translate('GROWTH_JOURNEY_YOU_ARE_HERE');
  const nextKey = NEXT_STEP_KEYS[stage];
  const text = nextKey
    ? `${stageLabel} · ${here} · ${translate(nextKey)}`
    : `${stageLabel} · ${here}`;
  return {
    stage,
    text,
    position: growthJourneyTrackPosition(minutes, floor)
  };
}
