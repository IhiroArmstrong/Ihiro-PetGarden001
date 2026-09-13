/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · copy pool registry (config copyPoolId → corpus).
 * No per-holiday branches in resolveActiveSeasonalTheme — only here for content gates.
 */

import {
  isChristmasCorpusOk,
  pickChristmasLineForDay
} from './christmasCorpus.js';
import {
  isHalloweenCorpusOk,
  pickHalloweenLineForDay
} from './halloweenCorpus.js';
import {
  isNewYearCorpusOk,
  pickNewYearLineForDay
} from './newYearCorpus.js';
import {
  isThanksgivingCorpusOk,
  pickThanksgivingLineForDay
} from './thanksgivingCorpus.js';

/**
 * @typedef {import('./christmasCorpus.js').SeasonalCopyLine} SeasonalCopyLine
 * @typedef {{
 *   isOk: () => boolean,
 *   pickForDay: (dayIso: string) => SeasonalCopyLine | null
 * }} SeasonalCopyPool
 */

/** @type {Readonly<Record<string, SeasonalCopyPool>>} */
const COPY_POOLS = Object.freeze({
  christmas: Object.freeze({
    isOk: isChristmasCorpusOk,
    pickForDay: pickChristmasLineForDay
  }),
  thanksgiving: Object.freeze({
    isOk: isThanksgivingCorpusOk,
    pickForDay: pickThanksgivingLineForDay
  }),
  halloween: Object.freeze({
    isOk: isHalloweenCorpusOk,
    pickForDay: pickHalloweenLineForDay
  }),
  'new-year': Object.freeze({
    isOk: isNewYearCorpusOk,
    pickForDay: pickNewYearLineForDay
  })
});

/**
 * @param {string | null | undefined} copyPoolId
 * @returns {boolean}
 */
export function isSeasonalCopyPoolOk(copyPoolId) {
  const id = String(copyPoolId || '');
  if (!id) return true;
  const pool = COPY_POOLS[id];
  return pool ? pool.isOk() === true : false;
}

/**
 * @param {string | null | undefined} copyPoolId
 * @param {string} dayIso
 * @returns {SeasonalCopyLine | null}
 */
export function pickSeasonalLineForDay(copyPoolId, dayIso) {
  const id = String(copyPoolId || '');
  if (!id) return null;
  const pool = COPY_POOLS[id];
  return pool ? pool.pickForDay(dayIso) : null;
}
