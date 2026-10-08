/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  growthJourneyDetailModel,
  growthJourneyLifetimeText,
  growthJourneyRhythmMarks
} from './growthJourneyDetail.js';
import { growthJourneyTrackPosition } from './growthJourneyStage.js';

const zh = Object.freeze({
  GROWTH_JOURNEY_STAGE_BEGIN: '起始',
  GROWTH_JOURNEY_STAGE_NOTICE: '看见',
  GROWTH_JOURNEY_STAGE_PRACTICE: '练习',
  GROWTH_JOURNEY_STAGE_STEADY: '安稳',
  GROWTH_JOURNEY_STAGE_INTEGRATED: '融入',
  GROWTH_JOURNEY_YOU_ARE_HERE: '你在这里',
  GROWTH_JOURNEY_NEXT_BEGIN: '今天来练一次',
  GROWTH_JOURNEY_NEXT_NOTICE: '再回来练一次',
  GROWTH_JOURNEY_NEXT_PRACTICE: '慢慢来，不赶',
  GROWTH_JOURNEY_NEXT_STEADY: '照常来练一会儿',
  GROWTH_JOURNEY_LIFETIME_MINUTES: '累计 {minutes} 分钟',
  GROWTH_JOURNEY_LIFETIME_HOURS: '累计 {hours} 小时 {minutes} 分钟'
});

/** @param {string} key */
function translate(key) {
  return zh[key] ?? key;
}

describe('growthJourneyDetail', () => {
  it('shows Begin and a next step when minutes are zero', () => {
    const model = growthJourneyDetailModel({
      eligibleMinutes: 0,
      lifetimeMinutes: 0,
      translate
    });
    assert.equal(model.stage, 'begin');
    assert.equal(model.position, 0);
    assert.equal(model.here, '你在这里');
    assert.equal(model.nextStep, '今天来练一次');
    assert.equal(model.lifetimeText, '累计 0 分钟');
    assert.equal(model.stages.length, 5);
    assert.equal(JSON.stringify(model).includes('%'), false);
  });

  it('omits the next step at Integrated and pins the dot', () => {
    const model = growthJourneyDetailModel({
      eligibleMinutes: 99999,
      lifetimeMinutes: 100000,
      translate
    });
    assert.equal(model.stage, 'integrated');
    assert.equal(model.position, 1);
    assert.equal(model.nextStep, '');
    assert.equal(model.lifetimeText, '累计 1666 小时 40 分钟');
  });

  it('uses the same dot position as the home line, including the floor', () => {
    const model = growthJourneyDetailModel({
      eligibleMinutes: 0,
      lifetimeMinutes: 0,
      floor: 'steady',
      translate
    });
    assert.equal(model.stage, 'steady');
    assert.equal(model.position, growthJourneyTrackPosition(0, 'steady'));
    assert.equal(model.nextStep, '照常来练一会儿');
  });

  it('marks a calendar gap as paused, then returned', () => {
    assert.deepEqual(
      growthJourneyRhythmMarks([
        '2026-01-01',
        '2026-01-02',
        '2026-01-05',
        'not-a-date'
      ]),
      [
        { kind: 'practiced', date: '2026-01-01' },
        { kind: 'practiced', date: '2026-01-02' },
        { kind: 'paused' },
        { kind: 'returned', date: '2026-01-05' }
      ]
    );
  });

  it('does not invent a paused mark for consecutive days', () => {
    assert.deepEqual(growthJourneyRhythmMarks(['2026-03-02', '2026-03-01']), [
      { kind: 'practiced', date: '2026-03-01' },
      { kind: 'practiced', date: '2026-03-02' }
    ]);
  });

  it('formats leftover minutes under an hour', () => {
    assert.equal(
      growthJourneyLifetimeText(45, translate),
      '累计 45 分钟'
    );
  });
});
