/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  clampResearchCount,
  CO_PRACTICE_RESEARCH_COUNT_CAPS,
  CO_PRACTICE_RESEARCH_CHIP_IDS,
  isCoPracticeResearchChipId,
  isCoPracticeResearchRouteClass
} from './coPracticeResearchEnums.js';
import { isTimestampInLocalWeek, localWeekBoundsFromKey } from './coPracticeResearchIsoWeek.js';
import {
  readCoPracticeResearchWeekLedger
} from './coPracticeResearchWeekLedger.js';
import {
  CONFIDE_OBSERVATION_EVENTS,
  readConfideObservationEvents
} from './confide/confideObservationTelemetry.js';

/**
 * @typedef {{
 *   confideOpened: number,
 *   confideSent: number,
 *   chips: Record<string, number>,
 *   route: Record<string, number>,
 *   sitWithYin: number
 * }} CoPracticeResearchCompanionT1
 */

/**
 * @param {Storage | null | undefined} storage
 * @param {string} weekKey
 * @returns {CoPracticeResearchCompanionT1}
 */
export function buildCompanionWeekAggregate(storage, weekKey) {
  const bounds = localWeekBoundsFromKey(weekKey);
  const ledger = readCoPracticeResearchWeekLedger(storage);
  const bucket = ledger.weeks[weekKey] || {};

  let confideSent = 0;
  /** @type {Record<string, number>} */
  const chips = {};
  for (const chipId of CO_PRACTICE_RESEARCH_CHIP_IDS) {
    chips[chipId] = 0;
  }

  const events = readConfideObservationEvents(storage);
  for (const row of events) {
    if (!row || typeof row !== 'object') continue;
    const at = Number(row.at);
    if (!isTimestampInLocalWeek(at, bounds)) continue;
    if (row.event === CONFIDE_OBSERVATION_EVENTS.SHARE) {
      confideSent += 1;
      continue;
    }
    if (row.event === CONFIDE_OBSERVATION_EVENTS.CHIP_TAPPED) {
      const chipId = typeof row.chipId === 'string' ? row.chipId : '';
      if (!isCoPracticeResearchChipId(chipId)) continue;
      chips[chipId] = (chips[chipId] || 0) + 1;
    }
  }

  const confideOpened = clampResearchCount(
    bucket.confideOpened || 0,
    CO_PRACTICE_RESEARCH_COUNT_CAPS.companion
  );
  confideSent = clampResearchCount(confideSent, CO_PRACTICE_RESEARCH_COUNT_CAPS.companion);

  for (const chipId of CO_PRACTICE_RESEARCH_CHIP_IDS) {
    chips[chipId] = clampResearchCount(
      chips[chipId] || 0,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.companion
    );
  }

  /** @type {Record<string, number>} */
  const route = {};
  const routeLedger = bucket.route && typeof bucket.route === 'object' ? bucket.route : {};
  for (const classId of Object.keys(routeLedger)) {
    if (!isCoPracticeResearchRouteClass(classId)) continue;
    const c = clampResearchCount(routeLedger[classId], CO_PRACTICE_RESEARCH_COUNT_CAPS.companion);
    if (c > 0) route[classId] = c;
  }

  /** @type {CoPracticeResearchCompanionT1} */
  const out = {
    confideOpened,
    confideSent,
    chips: {},
    route,
    sitWithYin: clampResearchCount(
      bucket.sitWithYin || 0,
      CO_PRACTICE_RESEARCH_COUNT_CAPS.sitWithYin
    )
  };

  for (const chipId of CO_PRACTICE_RESEARCH_CHIP_IDS) {
    if ((chips[chipId] || 0) > 0) out.chips[chipId] = chips[chipId];
  }

  return out;
}
