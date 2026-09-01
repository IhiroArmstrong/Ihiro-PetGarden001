/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PracticeDaysStore } from '../PracticeDaysStore.js';
import { confideClassify } from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  formatPracticeDurationReply,
  isPracticeDurationQuestion,
  shouldAnswerWithPracticeFacts,
  summarizePracticeFacts,
  summarizePracticeFactsFromJourneyLog,
  classifyPracticeFactsKind,
  PRACTICE_FACTS_KIND,
  buildPracticeFactsReply
} from './confidePracticeFacts.js';
import { shouldUseDesktopCompanionGenerate } from '../desktopCompanionL2Route.js';

const tFn = (key) =>
  ({
    CONFIDE_PRACTICE_FACTS_NONE: 'No sits are written down on this device yet.',
    CONFIDE_PRACTICE_FACTS_DAYS_ONLY:
      'This device has {days} practiced days. Minute counts are not all written down.',
    CONFIDE_PRACTICE_FACTS_DAYS_PARTIAL:
      'This device has {days} practiced days, about {minutes} minutes on the days that recorded time.',
    CONFIDE_PRACTICE_FACTS_DAYS_MINUTES:
      'This device has {days} practiced days, about {minutes} minutes in all.'
  })[key] || key;

const readyOpen = {
  generateEnabled: true,
  generateLayerOpen: true,
  hasGenerateFn: true
};

describe('confide practice facts (Slice 0)', () => {
  it('matches How long have I practiced? and 练了多久', () => {
    assert.equal(isPracticeDurationQuestion('How long have I practiced?'), true);
    assert.equal(isPracticeDurationQuestion('练了多久'), true);
    assert.equal(
      isPracticeDurationQuestion('Can you tell me my total sitting time on this device?'),
      true
    );
    assert.equal(isPracticeDurationQuestion('the weather is mild today'), false);
    assert.equal(isPracticeDurationQuestion('I practiced too long and feel tired'), false);
  });

  it('total sitting time paraphrase blocks generate on fallback', () => {
    const text = 'Can you tell me my total sitting time on this device?';
    const route = confideClassify(text);
    assert.equal(route, CONFIDE_ROUTE.FALLBACK);
    assert.equal(shouldAnswerWithPracticeFacts(route, text), true);
    assert.equal(
      shouldUseDesktopCompanionGenerate({ ...readyOpen, route }) &&
        !shouldAnswerWithPracticeFacts(route, text),
      false
    );
  });

  it('does not steal safety or sad routes', () => {
    const sad = 'I feel depressed, how long have I practiced?';
    assert.equal(confideClassify(sad), CONFIDE_ROUTE.SAD);
    assert.equal(shouldAnswerWithPracticeFacts(CONFIDE_ROUTE.SAD, sad), false);
    const safety = "I don't want to live";
    assert.equal(confideClassify(safety), CONFIDE_ROUTE.SAFETY_REDIRECT);
    assert.equal(
      shouldAnswerWithPracticeFacts(CONFIDE_ROUTE.SAFETY_REDIRECT, safety),
      false
    );
  });

  it('blocks generate when fallback is a duration question', () => {
    const text = 'How long have I practiced?';
    const route = confideClassify(text);
    assert.equal(route, CONFIDE_ROUTE.FALLBACK);
    assert.equal(shouldAnswerWithPracticeFacts(route, text), true);
    assert.equal(
      shouldUseDesktopCompanionGenerate({ ...readyOpen, route }) &&
        !shouldAnswerWithPracticeFacts(route, text),
      false
    );
  });

  it('formats empty / days / minutes from PracticeDaysStore', () => {
    const empty = new PracticeDaysStore({ storage: null });
    assert.equal(
      formatPracticeDurationReply(summarizePracticeFacts(empty), tFn),
      'No sits are written down on this device yet.'
    );

    const storage = {
      _d: {},
      getItem(k) {
        return this._d[k] ?? null;
      },
      setItem(k, v) {
        this._d[k] = v;
      }
    };
    const store = new PracticeDaysStore({
      storage,
      now: () => new Date(2026, 7, 25)
    });
    store.markToday(25);
    const withMins = summarizePracticeFacts(store);
    assert.equal(withMins.dayCount, 1);
    assert.equal(withMins.knownMinutes, 25);
    assert.match(
      formatPracticeDurationReply(withMins, tFn),
      /1 practiced days, about 25 minutes/
    );
  });

  it('prefers Journey Log totals over practice-days streak ledger', () => {
    const storage = {
      _d: {},
      getItem(k) {
        return this._d[k] ?? null;
      },
      setItem(k, v) {
        this._d[k] = v;
      }
    };
    storage.setItem(
      'focus-tiger.journey-log.v1',
      JSON.stringify({
        entries: [
          { at: '2026-08-25T10:00:00.000Z', minutes: 1, arrive: false, reflect: false },
          { at: '2026-08-25T11:00:00.000Z', minutes: 10, arrive: false, reflect: false },
          { at: '2026-08-25T12:00:00.000Z', minutes: 1, arrive: false, reflect: false },
          { at: '2026-08-25T13:00:00.000Z', minutes: 10, arrive: false, reflect: false }
        ]
      })
    );
    storage.setItem(
      'focus-tiger.practice-days.v1',
      JSON.stringify({
        days: [
          { date: '2026-08-23', totalMinutes: 8 },
          { date: '2026-08-24', totalMinutes: 8 },
          { date: '2026-08-25', totalMinutes: 24 }
        ]
      })
    );
    const store = new PracticeDaysStore({ storage });
    const summary = summarizePracticeFactsFromJourneyLog(storage);
    assert.equal(summary.dayCount, 1);
    assert.equal(summary.knownMinutes, 22);
    assert.equal(summarizePracticeFacts(store, storage).knownMinutes, 22);
    assert.equal(summarizePracticeFacts(store, storage).dayCount, 1);
  });
});

function memoryStorage(entries) {
  const storage = {
    _d: {},
    getItem(k) {
      return this._d[k] ?? null;
    },
    setItem(k, v) {
      this._d[k] = v;
    }
  };
  storage.setItem(
    'focus-tiger.journey-log.v1',
    JSON.stringify({ entries })
  );
  return storage;
}

describe('confide practice facts (Phase 1B)', () => {
  const t1b = (key) =>
    ({
      ...Object.fromEntries(
        Object.entries({
          CONFIDE_PRACTICE_FACTS_USUAL_TIME:
            'You practiced most often in the {bucket} ({count} of {total} sessions written down).',
          CONFIDE_PRACTICE_FACTS_USUAL_SPLIT: 'Sessions written down are split between {parts}.',
          CONFIDE_PRACTICE_FACTS_USUAL_INSUFFICIENT:
            'There are not enough sits written down yet to see a usual time of day.',
          CONFIDE_PRACTICE_FACTS_SHOWING:
            'In the last {days} days this device has {count} sessions written down, about {minutes} minutes.',
          CONFIDE_PRACTICE_FACTS_SHOWING_NONE:
            'No sits are written down on this device for the last {days} days.',
          CONFIDE_PRACTICE_FACTS_COMPARE:
            'In the last {days} days you completed {recentCount} sessions, about {recentMinutes} minutes; in the {days} days before that, {priorCount} sessions, about {priorMinutes} minutes.',
          CONFIDE_PRACTICE_FACTS_COMPARE_INSUFFICIENT:
            'There are not enough sits written down yet to compare two periods.',
          CONFIDE_PRACTICE_FACTS_ARRIVE_COMPARE:
            'In the last {days} days, Arrival was part of {recentArrive} of {recentCount} sessions; in the {days} days before that, {priorArrive} of {priorCount}.',
          CONFIDE_PRACTICE_FACTS_ARRIVE_INSUFFICIENT:
            'There are not enough sits written down yet to compare Arrival across two periods.',
          CONFIDE_PRACTICE_BUCKET_MORNING: 'morning',
          CONFIDE_PRACTICE_BUCKET_AFTERNOON: 'afternoon',
          CONFIDE_PRACTICE_BUCKET_EVENING: 'evening',
          CONFIDE_PRACTICE_BUCKET_NIGHT: 'night'
        })
      ),
      CONFIDE_PRACTICE_FACTS_NONE: 'No sits are written down on this device yet.',
      CONFIDE_PRACTICE_FACTS_DAYS_MINUTES:
        'This device has {days} practiced days, about {minutes} minutes in all.'
    })[key] || key;

  it('classifies CORE practice questions and leaves observation-boundary alone', () => {
    assert.equal(
      classifyPracticeFactsKind('When do I usually practice?'),
      PRACTICE_FACTS_KIND.USUAL_TIME
    );
    assert.equal(
      classifyPracticeFactsKind('How have I been showing up?'),
      PRACTICE_FACTS_KIND.SHOWING_UP
    );
    assert.equal(
      classifyPracticeFactsKind('Have I been showing up consistently?'),
      PRACTICE_FACTS_KIND.SHOWING_UP
    );
    assert.equal(
      classifyPracticeFactsKind('Do I even show up on the days I say I will?'),
      PRACTICE_FACTS_KIND.SHOWING_UP
    );
    assert.equal(
      classifyPracticeFactsKind('Has anything changed in how often I check in?'),
      PRACTICE_FACTS_KIND.SHOWING_UP
    );
    assert.equal(classifyPracticeFactsKind('I feel so inconsistent lately.'), null);
    assert.equal(
      classifyPracticeFactsKind('Am I practicing longer than before?'),
      PRACTICE_FACTS_KIND.COMPARE_VOLUME
    );
    assert.equal(
      classifyPracticeFactsKind('我是不是坚持得比以前久？'),
      PRACTICE_FACTS_KIND.COMPARE_VOLUME
    );
    assert.equal(
      classifyPracticeFactsKind('Have I been getting into practice more easily?'),
      PRACTICE_FACTS_KIND.COMPARE_EASE
    );
    assert.equal(classifyPracticeFactsKind('What have you noticed lately?'), null);
    assert.equal(classifyPracticeFactsKind('Have I been more steady lately?'), null);
  });

  it('names the usual evening bucket without judging discipline', () => {
    const storage = memoryStorage([
      { at: new Date(2026, 7, 20, 19, 0, 0).toISOString(), minutes: 10, arrive: true, reflect: false },
      { at: new Date(2026, 7, 21, 19, 30, 0).toISOString(), minutes: 10, arrive: false, reflect: false },
      { at: new Date(2026, 7, 22, 20, 0, 0).toISOString(), minutes: 12, arrive: true, reflect: false }
    ]);
    const reply = buildPracticeFactsReply(
      null,
      storage,
      t1b,
      'When do I usually practice?'
    );
    assert.match(reply, /evening/);
    assert.match(reply, /3 of 3/);
    assert.equal(/improving|more consistent|discipline/i.test(reply), false);
  });

  it('compares two practice windows with session counts only', () => {
    const reference = new Date(2026, 8, 1, 12, 0, 0);
    const storage = memoryStorage([
      { at: new Date(2026, 7, 25, 10, 0, 0).toISOString(), minutes: 20, arrive: true, reflect: false },
      { at: new Date(2026, 7, 28, 10, 0, 0).toISOString(), minutes: 10, arrive: false, reflect: false },
      { at: new Date(2026, 7, 10, 10, 0, 0).toISOString(), minutes: 5, arrive: true, reflect: false }
    ]);
    const reply = buildPracticeFactsReply(
      null,
      storage,
      t1b,
      'Am I practicing more than before?',
      { reference }
    );
    assert.match(reply, /2 sessions, about 30 minutes/);
    assert.match(reply, /1 sessions, about 5 minutes/);
    assert.equal(/better|improving|更稳|进步/i.test(reply), false);
  });

  it('ease questions report Arrival counts, not flow', () => {
    const reference = new Date(2026, 8, 1, 12, 0, 0);
    const storage = memoryStorage([
      { at: new Date(2026, 7, 25, 10, 0, 0).toISOString(), minutes: 20, arrive: true, reflect: false },
      { at: new Date(2026, 7, 10, 10, 0, 0).toISOString(), minutes: 5, arrive: false, reflect: false }
    ]);
    const reply = buildPracticeFactsReply(
      null,
      storage,
      t1b,
      'Have I been getting into practice more easily?',
      { reference }
    );
    assert.match(reply, /Arrival was part of 1 of 1/);
    assert.match(reply, /0 of 1/);
    assert.equal(/easily|flow|心流/i.test(reply), false);
  });
});
