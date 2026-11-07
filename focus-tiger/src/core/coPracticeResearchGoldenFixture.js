/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * SSOT storage fixture for research-payload.v1.golden.json (S4(e)).
 */

import {
  CONFIDE_OBSERVATION_EVENTS,
  CONFIDE_OBSERVATION_STORAGE_KEY
} from './confide/confideObservationTelemetry.js';
import { PRACTICE_DAYS_STORAGE_KEY } from './PracticeDaysStore.js';
import { T54_LOG_END, T54_LOG_SOURCE, T54_RESEARCH_LOG_STORAGE_KEY } from './t54ResearchLedger.js';
import { CO_PRACTICE_RESEARCH_WEEK_LEDGER_KEY } from './coPracticeResearchWeekLedger.js';
import { localWeekBoundsFromKey } from './coPracticeResearchIsoWeek.js';
import { buildWeeklyPayload } from './coPracticeResearchWeeklyPayload.js';
import { coPracticeResearchPayloadEqual } from './coPracticeResearchSerialize.js';
import golden from '../../docs/research/research-payload.v1.golden.json' with { type: 'json' };

export const CO_PRACTICE_RESEARCH_GOLDEN_WEEK = golden.week;
export const CO_PRACTICE_RESEARCH_GOLDEN_CONSENTED_AT = '2026-10-27T08:00:00.000Z';
export const CO_PRACTICE_RESEARCH_GOLDEN_NOW = '2026-11-16T10:00:00.000Z';

const REMINDER_FLAG_KEY = 'focus-tiger.reminder-preference.v1';
const COMPANION_MODE_KEY = 'focus-tiger.companion-mode.v1';

/**
 * @returns {Record<string, string>}
 */
export function buildCoPracticeResearchGoldenStorageEntries() {
  const week = CO_PRACTICE_RESEARCH_GOLDEN_WEEK;
  const bounds = localWeekBoundsFromKey(week, new Date('2026-11-10T12:00:00'));
  const atLocal = (y, m, d, h, min = 0) =>
    new Date(y, m - 1, d, h, min).toISOString();

  return {
    [CO_PRACTICE_RESEARCH_WEEK_LEDGER_KEY]: JSON.stringify({
      weeks: {
        [week]: {
          confideOpened: 2,
          route: { help_center_redirect: 2 },
          sitWithYin: 1
        }
      }
    }),
    [CONFIDE_OBSERVATION_STORAGE_KEY]: JSON.stringify([
      { event: CONFIDE_OBSERVATION_EVENTS.SHARE, at: Date.parse(atLocal(2026, 11, 12, 10)) },
      { event: CONFIDE_OBSERVATION_EVENTS.SHARE, at: Date.parse(atLocal(2026, 11, 12, 10)) + 1000 },
      { event: CONFIDE_OBSERVATION_EVENTS.SHARE, at: Date.parse(atLocal(2026, 11, 12, 10)) + 2000 },
      {
        event: CONFIDE_OBSERVATION_EVENTS.CHIP_TAPPED,
        chipId: 'practice_compare',
        at: Date.parse(atLocal(2026, 11, 12, 10)) + 3000
      }
    ]),
    [T54_RESEARCH_LOG_STORAGE_KEY]: JSON.stringify([
      {
        startedAt: atLocal(2026, 11, 9, 8),
        source: T54_LOG_SOURCE.SELF_OPEN,
        actualMinutes: 10,
        endKind: T54_LOG_END.COMPLETED
      },
      {
        startedAt: atLocal(2026, 11, 10, 9),
        source: T54_LOG_SOURCE.SELF_OPEN,
        actualMinutes: 15,
        endKind: T54_LOG_END.COMPLETED
      },
      {
        startedAt: atLocal(2026, 11, 11, 8),
        source: T54_LOG_SOURCE.SELF_OPEN,
        actualMinutes: 10,
        endKind: T54_LOG_END.EARLY_RISE
      },
      {
        startedAt: atLocal(2026, 11, 14, 19),
        source: T54_LOG_SOURCE.SELF_OPEN,
        actualMinutes: 10,
        endKind: T54_LOG_END.COMPLETED
      },
      {
        startedAt: atLocal(2026, 11, 12, 7),
        source: 'breath',
        actualMinutes: 5,
        endKind: T54_LOG_END.COMPLETED
      },
      {
        startedAt: atLocal(2026, 11, 13, 10),
        source: 'breath',
        actualMinutes: 5,
        endKind: T54_LOG_END.COMPLETED
      },
      {
        startedAt: atLocal(2026, 11, 12, 18),
        source: T54_LOG_SOURCE.HONESTY_MAKEUP,
        actualMinutes: 3,
        endKind: T54_LOG_END.COMPLETED
      }
    ]),
    [PRACTICE_DAYS_STORAGE_KEY]: JSON.stringify({
      days: [
        { date: '2026-11-09', totalMinutes: 10 },
        { date: '2026-11-11', totalMinutes: 8 },
        { date: '2026-11-12', totalMinutes: 5 },
        { date: '2026-11-14', totalMinutes: 12 }
      ]
    }),
    [REMINDER_FLAG_KEY]: JSON.stringify({ hour: 9, minute: 0 }),
    [COMPANION_MODE_KEY]: JSON.stringify({ generateEnabled: true })
  };
}

export { golden as CO_PRACTICE_RESEARCH_GOLDEN_OBJECT };

/**
 * @returns {string[]} problem messages (empty = ok)
 */
export function validateCoPracticeResearchGoldenBuild() {
  const map = new Map(Object.entries(buildCoPracticeResearchGoldenStorageEntries()));
  const storage = /** @type {Storage} */ ({
    getItem: (key) => (map.has(key) ? map.get(key) : null)
  });
  const payload = buildWeeklyPayload({
    studyId: golden.studyId,
    consent: golden.consent,
    consentedAt: CO_PRACTICE_RESEARCH_GOLDEN_CONSENTED_AT,
    locale: golden.locale,
    platform: golden.platform,
    storage,
    week: CO_PRACTICE_RESEARCH_GOLDEN_WEEK,
    now: () => new Date(CO_PRACTICE_RESEARCH_GOLDEN_NOW)
  });
  if (coPracticeResearchPayloadEqual(payload, golden)) return [];
  return ['golden fixture build does not match research-payload.v1.golden.json'];
}
