/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { shiftLocalDateKey } from './PracticeDaysStore.js';
import { JOURNEY_LOG_MAX_ENTRIES } from './journeyLogGate.js';
import { getLocalDateKey } from '../utils/localDate.js';
import {
  PRACTICE_PAPER_HIDDEN_KEY,
  PRACTICE_PAPER_QUIETER_DELTA,
  getPracticePaperSentence,
  getSitBreathFacts,
  isPracticePaperHidden,
  localCalendarDayDiff,
  setPracticePaperHidden
} from './practicePaperFacts.js';

const TODAY = '2026-10-19';

function daysAgo(n, today = TODAY) {
  return shiftLocalDateKey(today, -n);
}

function localIso(dateKey, hour = 12, minute = 0) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d, hour, minute, 0).toISOString();
}

function sitting(atKey, minutes, { arrive = true, hour = 12 } = {}) {
  return {
    at: localIso(atKey, hour),
    minutes,
    arrive,
    reflect: false
  };
}

function fillDays(count, today, { inA = 0, inB = 0 } = {}) {
  const keys = [];
  for (let i = 0; i < inA; i += 1) keys.push(daysAgo(i, today));
  for (let i = 0; i < inB; i += 1) keys.push(daysAgo(7 + i, today));
  let older = 14;
  while (keys.length < count) {
    keys.push(daysAgo(older, today));
    older += 1;
  }
  return keys;
}

describe('practice paper rhythm sentence', () => {
  it('locks the quieter delta at 2', () => {
    assert.equal(PRACTICE_PAPER_QUIETER_DELTA, 2);
  });

  it('hits line 1 for a new user', () => {
    assert.equal(getPracticePaperSentence([], TODAY).line, 1);
  });

  it('hits line 2 on day 3, before welcome-back', () => {
    const keys = [daysAgo(2), daysAgo(1), TODAY];
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 2);
  });

  it('hits line 2 when firstPracticeAgeDays is 6', () => {
    const keys = [0, 1, 2, 3, 4, 5, 6].map((n) => daysAgo(n));
    assert.equal(localCalendarDayDiff(daysAgo(6), TODAY), 6);
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 2);
  });

  it('does not hit line 2 when firstPracticeAgeDays is 7', () => {
    const keys = [daysAgo(7)];
    assert.equal(localCalendarDayDiff(daysAgo(7), TODAY), 7);
    assert.notEqual(getPracticePaperSentence(keys, TODAY).line, 2);
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 4);
  });

  it('hits line 3 after about two quiet weeks', () => {
    const keys = fillDays(12, TODAY, { inA: 0, inB: 0 });
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 3);
  });

  it('hits line 4 when the near window is quiet', () => {
    const keys = fillDays(10, TODAY, { inA: 0, inB: 4 });
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 4);
  });

  it('hits line 5 on a return after a gap', () => {
    const keys = [TODAY, daysAgo(1), ...fillDays(18, TODAY, { inA: 0, inB: 0 })];
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 5);
  });

  it('hits line 6 when the two windows match', () => {
    const keys = fillDays(30, TODAY, { inA: 4, inB: 4 });
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 6);
  });

  it('hits line 6 when the near window has more days', () => {
    const keys = fillDays(30, TODAY, { inA: 6, inB: 3 });
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 6);
  });

  it('hits line 7 when the near window is only one day lighter', () => {
    const keys = fillDays(30, TODAY, { inA: 3, inB: 4 });
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 7);
  });

  it('hits line 8 when the near window is two days lighter', () => {
    const keys = fillDays(30, TODAY, { inA: 2, inB: 4 });
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 8);
  });

  it('hits line 6 at the 90-day cap without pretending the first day is new', () => {
    const keys = fillDays(90, TODAY, { inA: 5, inB: 5 });
    assert.equal(keys.length, 90);
    assert.equal(getPracticePaperSentence(keys, TODAY).line, 6);
  });
});

describe('practice paper Sit & Breath facts', () => {
  it('uses the empty state when the log is empty', () => {
    assert.deepEqual(getSitBreathFacts({ entries: [] }, TODAY), {
      uniqueDays: 0,
      lastMinutes: null,
      incomplete: false
    });
  });

  it('counts unique local days, not rows', () => {
    const facts = getSitBreathFacts(
      {
        entries: [
          sitting(daysAgo(1), 15),
          sitting(TODAY, 10, { hour: 9 }),
          sitting(TODAY, 20, { hour: 18 })
        ]
      },
      TODAY
    );
    assert.equal(facts.uniqueDays, 2);
    assert.equal(facts.lastMinutes, 20);
    assert.equal(facts.incomplete, false);
  });

  it('counts a breath-only row (arrive false) as a day', () => {
    const facts = getSitBreathFacts(
      { entries: [sitting(TODAY, 3, { arrive: false })] },
      TODAY
    );
    assert.equal(facts.uniqueDays, 1);
    assert.equal(facts.lastMinutes, 3);
  });

  it('omits last minutes when the window has zero days', () => {
    const facts = getSitBreathFacts(
      { entries: [sitting(daysAgo(10), 40)] },
      TODAY
    );
    assert.equal(facts.uniqueDays, 0);
    assert.equal(facts.lastMinutes, null);
  });

  it('covers seven distinct days in the window', () => {
    const entries = [6, 5, 4, 3, 2, 1, 0].map((n) => sitting(daysAgo(n), 10 + n));
    const facts = getSitBreathFacts({ entries }, TODAY);
    assert.equal(facts.uniqueDays, 7);
    assert.equal(facts.lastMinutes, 10);
  });

  it('uses the incomplete sentence when 30 rows still sit inside the window', () => {
    const entries = [];
    for (let i = 0; i < JOURNEY_LOG_MAX_ENTRIES; i += 1) {
      entries.push(
        sitting(TODAY, 10, {
          arrive: i % 2 === 0,
          hour: 8 + Math.floor(i / 6)
        })
      );
    }
    const facts = getSitBreathFacts({ entries }, TODAY);
    assert.equal(facts.incomplete, true);
    assert.equal(facts.uniqueDays >= 1, true);
    assert.equal(facts.lastMinutes, 10);
  });

  it('still shows a day count when the oldest of 30 rows is already outside the window', () => {
    const entries = [];
    for (let i = 0; i < JOURNEY_LOG_MAX_ENTRIES; i += 1) {
      entries.push(sitting(daysAgo(20 - Math.floor(i / 2)), 12));
    }
    entries[0] = sitting(daysAgo(20), 12);
    const facts = getSitBreathFacts({ entries }, TODAY);
    assert.equal(facts.incomplete, false);
  });
});

describe('practice paper hide key', () => {
  it('defaults to visible', () => {
    const storage = new Map();
    const api = {
      getItem: (k) => storage.get(k) ?? null,
      setItem: (k, v) => storage.set(k, v),
      removeItem: (k) => storage.delete(k)
    };
    assert.equal(isPracticePaperHidden(api), false);
    assert.equal(setPracticePaperHidden(api, true), true);
    assert.equal(api.getItem(PRACTICE_PAPER_HIDDEN_KEY), '1');
    assert.equal(isPracticePaperHidden(api), true);
    assert.equal(setPracticePaperHidden(api, false), true);
    assert.equal(isPracticePaperHidden(api), false);
  });

  it('treats missing storage as visible', () => {
    assert.equal(isPracticePaperHidden(null), false);
    assert.equal(setPracticePaperHidden(null, true), false);
  });

  it('treats throwing storage as visible and does not pretend a hide succeeded', () => {
    const broken = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
      removeItem() {
        throw new Error('blocked');
      }
    };
    assert.equal(isPracticePaperHidden(broken), false);
    assert.equal(setPracticePaperHidden(broken, true), false);
  });
});

describe('practice paper local calendar windows', () => {
  it('slides 23:59 and 00:01 on the local calendar, not by millisecond day length', () => {
    const late = new Date(2026, 2, 7, 23, 59, 0);
    const early = new Date(2026, 2, 8, 0, 1, 0);
    assert.equal(getLocalDateKey(late), '2026-03-07');
    assert.equal(getLocalDateKey(early), '2026-03-08');
    const row = sitting('2026-03-01', 11);
    assert.equal(getSitBreathFacts({ entries: [row] }, '2026-03-07').uniqueDays, 1);
    assert.deepEqual(getSitBreathFacts({ entries: [row] }, '2026-03-08'), {
      uniqueDays: 0,
      lastMinutes: null,
      incomplete: false
    });
  });

  it('keeps the LA spring-forward date as one calendar day', () => {
    const appRoot = fileURLToPath(new URL('../..', import.meta.url));
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
          import assert from 'node:assert/strict';
          import { getLocalDateKey } from './src/utils/localDate.js';
          import {
            getSitBreathFacts,
            localCalendarDayDiff
          } from './src/core/practicePaperFacts.js';
          const before = new Date(2026, 2, 8, 1, 30, 0);
          const after = new Date(2026, 2, 8, 3, 30, 0);
          assert.equal(getLocalDateKey(before), '2026-03-08');
          assert.equal(getLocalDateKey(after), '2026-03-08');
          assert.equal(localCalendarDayDiff('2026-03-08', '2026-03-09'), 1);
          const facts = getSitBreathFacts({
            entries: [{
              at: before.toISOString(),
              minutes: 5,
              arrive: false,
              reflect: false
            }]
          }, '2026-03-08');
          assert.equal(facts.uniqueDays, 1);
        `
      ],
      {
        cwd: appRoot,
        encoding: 'utf8',
        env: { ...process.env, TZ: 'America/Los_Angeles' }
      }
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });
});

describe('practice paper locale slice', () => {
  it('keeps en/zh/ja keys aligned and bans dashboard words', () => {
    const slice = JSON.parse(
      readFileSync(new URL('../locales/slices/practice-paper.json', import.meta.url))
    );
    const enKeys = Object.keys(slice.en).sort();
    assert.deepEqual(Object.keys(slice.zh).sort(), enKeys);
    assert.deepEqual(Object.keys(slice.ja).sort(), enKeys);
    const blob = `${JSON.stringify(slice.en)}${JSON.stringify(slice.zh)}${JSON.stringify(slice.ja)}`;
    assert.equal(blob.includes('This week'), false);
    assert.equal(blob.includes('本周'), false);
    assert.equal(blob.includes('Health Dashboard'), false);
    assert.equal(blob.includes('健康分'), false);
    assert.equal(blob.includes('异常'), false);
    assert.equal(slice.en.PRACTICE_PAPER_CARD_TITLE, 'Sit & Breath');
    assert.equal(slice.zh.PRACTICE_PAPER_CARD_TITLE, '同坐与呼吸');
    assert.equal(slice.ja.PRACTICE_PAPER_CARD_TITLE, '座りと呼吸');
  });
});
