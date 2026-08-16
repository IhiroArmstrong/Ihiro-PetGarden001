/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme Engine · Phase 2 unit contracts.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SEASONAL_THEME_USER_ENABLED,
  assessLookupHorizon,
  getSeason,
  isChristmasCorpusOk,
  isSeasonInWindow,
  isSeasonalThemeGateOpen,
  nthWeekdayOfMonth,
  parseMockDateIso,
  pickHighestPrioritySeason,
  resolveActiveSeasonalTheme,
  resolveAnchorIsoForYear,
  resolveSeasonalNow,
  seasonMatchesRegion
} from './index.js';

const here = dirname(fileURLToPath(import.meta.url));

describe('seasonal DateRule', () => {
  it('resolves fixed christmas', () => {
    assert.equal(
      resolveAnchorIsoForYear({ type: 'fixed', month: 12, day: 25 }, 2026),
      '2026-12-25'
    );
  });

  it('resolves US Thanksgiving 2026 as 4th Thursday in November', () => {
    assert.equal(
      resolveAnchorIsoForYear(
        { type: 'nth-weekday', month: 11, weekday: 4, n: 4 },
        2026
      ),
      '2026-11-26'
    );
    assert.equal(nthWeekdayOfMonth(2026, 11, 4, 4), '2026-11-26');
  });

  it('resolves Mothers Day US 2026 as 2nd Sunday in May', () => {
    assert.equal(nthWeekdayOfMonth(2026, 5, 0, 2), '2026-05-10');
  });

  it('resolves solar-term chunfen 2026 from lookup', () => {
    assert.equal(
      resolveAnchorIsoForYear({ type: 'solar-term', termId: 'chunfen' }, 2026),
      '2026-03-20'
    );
  });

  it('skips missing lookup-table year', () => {
    assert.equal(
      resolveAnchorIsoForYear(
        { type: 'lookup-table', datesByYear: { 2026: '2026-04-05' } },
        2099
      ),
      null
    );
  });
});

describe('seasonal region + priority', () => {
  it('global seasons match any/missing region; regional require match', () => {
    const christmas = getSeason('christmas');
    const tgUs = getSeason('thanksgiving-us');
    assert.equal(seasonMatchesRegion(christmas, null), true);
    assert.equal(seasonMatchesRegion(christmas, 'JP'), true);
    assert.equal(seasonMatchesRegion(tgUs, null), false);
    assert.equal(seasonMatchesRegion(tgUs, 'US'), true);
    assert.equal(seasonMatchesRegion(tgUs, 'CA'), false);
  });

  it('pickHighestPriority prefers higher priority then calendar order', () => {
    const a = { id: 'a', priority: 40 };
    const b = { id: 'b', priority: 100 };
    assert.equal(pickHighestPrioritySeason([a, b]).id, 'b');
    // equal priority → earlier in SEASONAL_CALENDAR
    const ny = getSeason('new-years-day');
    const val = getSeason('valentines-day');
    assert.equal(ny.priority, val.priority);
    assert.equal(pickHighestPrioritySeason([val, ny]).id, 'new-years-day');
  });
});

describe('seasonal dual gate · Phase 3', () => {
  it('mount on, christmas contentReady true, corpus ok', () => {
    assert.equal(SEASONAL_THEME_USER_ENABLED, true);
    assert.equal(getSeason('christmas').contentReady, true);
    assert.equal(isChristmasCorpusOk(), true);
    assert.equal(isSeasonalThemeGateOpen('christmas'), true);
  });

  it('other seasons remain contentReady false', () => {
    assert.equal(getSeason('halloween').contentReady, false);
    assert.equal(isSeasonalThemeGateOpen('halloween'), false);
  });
});

describe('resolveActiveSeasonalTheme', () => {
  /** Instant that is 2026-12-20 local in America/New_York */
  const nearChristmas = new Date('2026-12-20T17:00:00.000Z');

  it('returns null when product mount is off (real-user path)', () => {
    const active = resolveActiveSeasonalTheme({
      now: nearChristmas,
      mountEnabled: false,
      entitled: () => true,
      skipEntitlement: false
    });
    assert.equal(active, null);
  });

  it('returns null when entitled is false in christmas window', () => {
    const active = resolveActiveSeasonalTheme({
      now: nearChristmas,
      mountEnabled: true,
      entitled: () => false,
      skipEntitlement: false
    });
    assert.equal(active, null);
  });

  it('entitled + mount applies christmas in window', () => {
    const active = resolveActiveSeasonalTheme({
      now: nearChristmas,
      mountEnabled: true,
      entitled: () => true
    });
    assert.ok(active);
    assert.equal(active.seasonId, 'christmas');
    assert.equal(active.assets.background, 'winter-quiet-wash');
    assert.equal(active.assets.copyPoolId, 'christmas');
  });

  it('returns null when entitled is false even if mount+ready forced via harness', () => {
    const active = resolveActiveSeasonalTheme({
      now: nearChristmas,
      search: '?seasonal=christmas',
      entitled: () => false,
      skipEntitlement: false
    });
    assert.equal(active, null);
  });

  it('harness + entitled applies christmas window without mount', () => {
    const active = resolveActiveSeasonalTheme({
      now: nearChristmas,
      search: '?seasonal=christmas',
      entitled: () => true
    });
    assert.ok(active);
    assert.equal(active.seasonId, 'christmas');
    assert.equal(active.anchorDateIso, '2026-12-25');
    assert.equal(active.windowStartIso, '2026-12-18');
    assert.equal(active.windowEndIso, '2026-12-26');
  });

  it('thanksgiving-us and thanksgiving-ca do not share the same anchor', () => {
    const us = getSeason('thanksgiving-us');
    const ca = getSeason('thanksgiving-ca');
    assert.equal(
      resolveAnchorIsoForYear(us.dateRule, 2026),
      '2026-11-26'
    );
    assert.equal(
      resolveAnchorIsoForYear(ca.dateRule, 2026),
      '2026-10-12'
    );
  });

  it('isSeasonInWindow respects before/after', () => {
    const christmas = getSeason('christmas');
    assert.equal(isSeasonInWindow(christmas, nearChristmas), true);
    assert.equal(
      isSeasonInWindow(christmas, new Date('2026-12-10T17:00:00.000Z')),
      false
    );
  });
});

describe('mockDate', () => {
  it('parses mockDate and resolves now into christmas window', () => {
    assert.equal(parseMockDateIso('?mockDate=2026-12-20'), '2026-12-20');
    const now = resolveSeasonalNow('?mockDate=2026-12-20');
    const active = resolveActiveSeasonalTheme({
      now,
      mountEnabled: true,
      entitled: () => true
    });
    assert.equal(active?.seasonId, 'christmas');
  });
});

describe('lookup horizon', () => {
  it('solar-term and easter tables cover ≥10 years from 2026', () => {
    const h = assessLookupHorizon(new Date('2026-08-11T00:00:00.000Z'));
    assert.equal(h.ok, true);
    assert.ok(h.solarTermMaxYear >= 2036);
    assert.ok(h.lookupTableMaxYear >= 2036);
  });
});

describe('seasonal zero coupling with tip-jar', () => {
  it('seasonal modules do not import tip jar', () => {
    const files = [
      'resolveActiveSeasonalTheme.js',
      'seasonalThemeVisibilityGate.js',
      'seasonalCalendar.js',
      'dateRules.js',
      'index.js'
    ];
    for (const f of files) {
      const src = readFileSync(join(here, f), 'utf8');
      assert.equal(/tipJar|tip-jar|tipGate|supporterGate/i.test(src), false, f);
    }
  });
});
