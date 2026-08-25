/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confideClassify } from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  buildPresenceTrendReply,
  formatPresenceTrendReply,
  isPresenceTrendQuestion,
  shouldAnswerWithPresenceFacts
} from './confidePresenceFacts.js';
import {
  appendArrivalNoticeSignal,
  PRESENCE_SIGNALS_MIN_TREND_COUNT
} from '../presenceSignalsGate.js';

const tFn = (key) =>
  ({
    CONFIDE_PRESENCE_FACTS_NONE:
      'No presence check-ins are written down on this device yet.',
    CONFIDE_PRESENCE_FACTS_INSUFFICIENT:
      'There are not enough check-ins yet to see a pattern.',
    CONFIDE_PRESENCE_FACTS_SUMMARY:
      'In the past {days} days you checked in {total} times: {breakdown}. That is only a few notes—not a full picture.',
    ARRIVAL_NOTICE_CALM: 'Calm',
    ARRIVAL_NOTICE_STRESSED: 'Stressed'
  })[key] || key;

function mockStorage() {
  /** @type {Record<string, string>} */
  const data = {};
  return {
    getItem(k) {
      return data[k] ?? null;
    },
    setItem(k, v) {
      data[k] = v;
    }
  };
}

describe('confide presence facts (Slice 4 minimal)', () => {
  it('matches trend questions in EN and ZH', () => {
    assert.equal(isPresenceTrendQuestion('Has my mood improved these two weeks?'), true);
    assert.equal(isPresenceTrendQuestion('我情绪这两周改善了吗？'), true);
    assert.equal(isPresenceTrendQuestion('How long have I practiced?'), false);
  });

  it('does not steal safety or sad routes', () => {
    const sad = 'I feel depressed, has my mood improved?';
    assert.equal(confideClassify(sad), CONFIDE_ROUTE.SAD);
    assert.equal(shouldAnswerWithPresenceFacts(CONFIDE_ROUTE.SAD, sad), false);
  });

  it('insufficient sample returns honest threshold copy', () => {
    const storage = mockStorage();
    const now = new Date(2026, 7, 25);
    appendArrivalNoticeSignal(storage, 'calm', {
      now: () => now,
      idFn: () => 'a'
    });
    appendArrivalNoticeSignal(storage, 'stressed', {
      now: () => now,
      idFn: () => 'b'
    });
    assert.equal(
      buildPresenceTrendReply(storage, tFn, { reference: now }),
      'There are not enough check-ins yet to see a pattern.'
    );
    assert.ok(PRESENCE_SIGNALS_MIN_TREND_COUNT > 2);
  });

  it('formats descriptive summary at or above threshold', () => {
    const reply = formatPresenceTrendReply(
      {
        windowDays: 14,
        totalTagged: 3,
        counts: { calm: 2, stressed: 1 }
      },
      tFn
    );
    assert.match(reply, /3 times/);
    assert.match(reply, /Calm 2/);
    assert.match(reply, /not a full picture/);
  });

  it('fallback route gates presence facts', () => {
    const text = 'Has my mood improved these two weeks?';
    const route = confideClassify(text);
    assert.equal(route, CONFIDE_ROUTE.FALLBACK);
    assert.equal(shouldAnswerWithPresenceFacts(route, text), true);
  });

  it('exactly three tagged entries trigger summary (not off-by-one)', () => {
    assert.equal(
      formatPresenceTrendReply(
        { windowDays: 14, totalTagged: 2, counts: { calm: 2 } },
        tFn
      ),
      'There are not enough check-ins yet to see a pattern.'
    );
    const atThree = formatPresenceTrendReply(
      { windowDays: 14, totalTagged: 3, counts: { calm: 2, stressed: 1 } },
      tFn
    );
    assert.notEqual(atThree, 'There are not enough check-ins yet to see a pattern.');
    assert.match(atThree, /3 times/);
  });

  it('buildPresenceTrendReply uses exactly three storage rows', () => {
    const storage = mockStorage();
    const now = new Date(2026, 7, 25, 12, 0, 0);
    for (let i = 0; i < 3; i += 1) {
      appendArrivalNoticeSignal(storage, i % 2 === 0 ? 'calm' : 'stressed', {
        now: () => new Date(2026, 7, 25 - i, 10, 0, 0),
        idFn: () => `row-${i}`
      });
    }
    const reply = buildPresenceTrendReply(storage, tFn, { reference: now });
    assert.match(reply, /3 times/);
  });
});
