/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIDE_OBSERVATION_EVENTS,
  CONFIDE_OBSERVATION_STORAGE_KEY
} from './confide/confideObservationTelemetry.js';
import { CONFIDE_ROUTE } from './confide/confideRoutes.js';
import { T54_LOG_END, T54_LOG_SOURCE, T54_RESEARCH_LOG_STORAGE_KEY } from './t54ResearchLedger.js';
import { PRACTICE_DAYS_STORAGE_KEY } from './PracticeDaysStore.js';
import {
  CO_PRACTICE_RESEARCH_WEEK_LEDGER_KEY,
  noteCoPracticeResearchConfideOpened,
  noteCoPracticeResearchRouteClass
} from './coPracticeResearchWeekLedger.js';
import { formatIsoWeekLocal, localWeekBoundsFromKey } from './coPracticeResearchIsoWeek.js';
import { mapConfideReplyToResearchRouteClass } from './coPracticeResearchRouteMap.js';
import { buildWeeklyPayload } from './coPracticeResearchWeeklyPayload.js';
import golden from '../../docs/research/research-payload.v1.golden.json' with { type: 'json' };

/** @param {Record<string, string>} entries */
function memoryStorage(entries = {}) {
  /** @type {Map<string, string>} */
  const map = new Map(Object.entries(entries));
  return /** @type {Storage} */ ({
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
    get length() {
      return map.size;
    },
    key() {
      return null;
    }
  });
}

describe('coPracticeResearch weekly payload S1', () => {
  it('mapConfideReplyToResearchRouteClass ignores emotion and safety routes', () => {
    assert.equal(
      mapConfideReplyToResearchRouteClass({ route: CONFIDE_ROUTE.SAD, source: 'corpus' }),
      null
    );
    assert.equal(
      mapConfideReplyToResearchRouteClass({
        route: CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN,
        source: 'corpus'
      }),
      'language_not_yet_open'
    );
    assert.equal(
      mapConfideReplyToResearchRouteClass({
        route: 'help_center_redirect',
        source: 'help_center_redirect'
      }),
      'help_center_redirect'
    );
    assert.equal(
      mapConfideReplyToResearchRouteClass({
        route: CONFIDE_ROUTE.FALLBACK,
        source: 'practice_facts'
      }),
      'query_practice_duration'
    );
  });

  it('buildWeeklyPayload matches golden fixture shape for companion + sit counts', () => {
    const week = golden.week;
    const bounds = localWeekBoundsFromKey(week, new Date('2026-11-10T12:00:00'));
    const midWeekMs = bounds.startMs + 2 * 86_400_000 + 60_000;

    const storage = memoryStorage({
      [CO_PRACTICE_RESEARCH_WEEK_LEDGER_KEY]: JSON.stringify({
        weeks: {
          [week]: {
            confideOpened: 2,
            route: { help_center_redirect: 2 },
            sitWithYin: 0
          }
        }
      }),
      [CONFIDE_OBSERVATION_STORAGE_KEY]: JSON.stringify([
        {
          event: CONFIDE_OBSERVATION_EVENTS.SHARE,
          at: midWeekMs
        },
        {
          event: CONFIDE_OBSERVATION_EVENTS.SHARE,
          at: midWeekMs + 1000
        },
        {
          event: CONFIDE_OBSERVATION_EVENTS.SHARE,
          at: midWeekMs + 2000
        },
        {
          event: CONFIDE_OBSERVATION_EVENTS.CHIP_TAPPED,
          chipId: 'practice_compare',
          at: midWeekMs + 3000
        },
        {
          event: CONFIDE_OBSERVATION_EVENTS.CHIP_TAPPED,
          chipId: 'presence_trend',
          at: midWeekMs + 4000
        }
      ]),
      [T54_RESEARCH_LOG_STORAGE_KEY]: JSON.stringify([
        {
          startedAt: new Date(bounds.startMs + 8 * 3_600_000).toISOString(),
          source: T54_LOG_SOURCE.SELF_OPEN,
          actualMinutes: 10,
          endKind: T54_LOG_END.COMPLETED
        },
        {
          startedAt: new Date(bounds.startMs + 26 * 3_600_000).toISOString(),
          source: T54_LOG_SOURCE.SELF_OPEN,
          actualMinutes: 15,
          endKind: T54_LOG_END.COMPLETED
        },
        {
          startedAt: new Date(bounds.startMs + 50 * 3_600_000).toISOString(),
          source: T54_LOG_SOURCE.SELF_OPEN,
          actualMinutes: 10,
          endKind: T54_LOG_END.EARLY_RISE
        },
        {
          startedAt: new Date(bounds.startMs + 74 * 3_600_000).toISOString(),
          source: T54_LOG_SOURCE.SELF_OPEN,
          actualMinutes: 10,
          endKind: T54_LOG_END.COMPLETED
        },
        {
          startedAt: new Date(bounds.startMs + 100 * 3_600_000).toISOString(),
          source: T54_LOG_SOURCE.SELF_OPEN,
          actualMinutes: 10,
          endKind: T54_LOG_END.COMPLETED
        },
        {
          startedAt: new Date(bounds.startMs + 124 * 3_600_000).toISOString(),
          source: T54_LOG_SOURCE.SELF_OPEN,
          actualMinutes: 5,
          endKind: T54_LOG_END.COMPLETED
        },
        {
          startedAt: new Date(bounds.startMs + 30 * 3_600_000).toISOString(),
          source: T54_LOG_SOURCE.RITUAL,
          actualMinutes: 5,
          endKind: T54_LOG_END.COMPLETED
        },
        {
          startedAt: new Date(bounds.startMs + 54 * 3_600_000).toISOString(),
          source: T54_LOG_SOURCE.RITUAL,
          actualMinutes: 5,
          endKind: T54_LOG_END.COMPLETED
        },
        {
          startedAt: new Date(bounds.startMs + 78 * 3_600_000).toISOString(),
          source: T54_LOG_SOURCE.HONESTY_MAKEUP,
          actualMinutes: 3,
          endKind: T54_LOG_END.COMPLETED
        }
      ]),
      [PRACTICE_DAYS_STORAGE_KEY]: JSON.stringify({
        days: [
          { date: '2026-11-10', totalMinutes: 10 },
          { date: '2026-11-12', totalMinutes: 8 },
          { date: '2026-11-13', totalMinutes: 5 },
          { date: '2026-11-15', totalMinutes: 12 }
        ]
      }),
      [REMINDER_FLAG_KEY]: JSON.stringify({ hour: 9, minute: 0 })
    });

    const payload = buildWeeklyPayload({
      studyId: golden.studyId,
      consent: golden.consent,
      consentedAt: '2026-10-20T08:00:00.000Z',
      locale: golden.locale,
      platform: golden.platform,
      storage,
      week,
      now: () => new Date('2026-11-16T10:00:00')
    });

    assert.equal(payload.schemaVersion, 1);
    assert.equal(payload.week, week);
    assert.equal(payload.t1.companion.confideOpened, golden.t1.companion.confideOpened);
    assert.equal(payload.t1.companion.confideSent, golden.t1.companion.confideSent);
    assert.deepEqual(payload.t1.companion.chips, golden.t1.companion.chips);
    assert.deepEqual(payload.t1.companion.route, golden.t1.companion.route);
    assert.equal(payload.t1.companion.sitWithYin, 0);
    assert.equal(typeof payload.t1.practice.sit.started, 'number');
    assert.match(payload.t1.dayMask, /^[01]{7}$/);
    assert.equal(
      JSON.stringify(payload).includes('transcript') ||
        JSON.stringify(payload).includes('userText'),
      false
    );
  });

  it('week ledger increments confideOpened without storing text', () => {
    const storage = memoryStorage();
    const now = () => new Date('2026-11-12T15:00:00');
    noteCoPracticeResearchConfideOpened(storage, now);
    noteCoPracticeResearchConfideOpened(storage, now);
    noteCoPracticeResearchRouteClass(storage, 'help_center_redirect', now);
    const week = formatIsoWeekLocal(now());
    const payload = buildWeeklyPayload({
      studyId: '9b1f2c7e-0000-4000-8000-000000000000',
      consent: { v: 1, tier2: false },
      locale: 'en',
      platform: 'web',
      storage,
      week,
      now
    });
    assert.equal(payload.t1.companion.confideOpened, 2);
    assert.equal(payload.t1.companion.route.help_center_redirect, 1);
  });
});

const REMINDER_FLAG_KEY = 'focus-tiger.reminder-preference.v1';
