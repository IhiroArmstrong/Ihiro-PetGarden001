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
  summarizePracticeFactsFromJourneyLog
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
