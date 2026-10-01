/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confideClassify } from './confideClassify.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { resolveConfideReply } from './confideReplyFlow.js';
import { shouldUseDesktopCompanionGenerate } from '../desktopCompanionL2Route.js';
import {
  CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES,
  fixturesForAggressionAcceptanceRoute
} from './confideAggressionAcceptanceFixtures.js';

const readyOpen = {
  generateEnabled: true,
  generateLayerOpen: true,
  hasGenerateFn: true
};

describe('confideAggressionAcceptanceFixtures', () => {
  it('freezes exactly 30 acceptance utterances', () => {
    assert.equal(CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES.length, 30);
    const ids = new Set(CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES.map((row) => row.id));
    assert.equal(ids.size, CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES.length);
  });

  it('covers aggression, safety, and fallback routes', () => {
    assert.equal(
      fixturesForAggressionAcceptanceRoute(CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS).length,
      12
    );
    assert.equal(
      fixturesForAggressionAcceptanceRoute(CONFIDE_ROUTE.SAFETY_REDIRECT).length,
      7
    );
    assert.equal(
      fixturesForAggressionAcceptanceRoute(CONFIDE_ROUTE.FALLBACK).length,
      11
    );
  });

  it('classifies every frozen utterance to its expected route', () => {
    for (const row of CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES) {
      const actual = confideClassify(row.text);
      assert.equal(actual, row.route, `${row.id}: ${row.text}`);
    }
  });

  it('aggression fixtures reply from corpus without Heard or nod copy', () => {
    for (const row of fixturesForAggressionAcceptanceRoute(
      CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
    )) {
      const hit = resolveConfideReply({
        text: row.text,
        locale: row.locale || 'en',
        localDate: '2026-09-19'
      });
      assert.ok(hit, row.id);
      assert.equal(hit.route, CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS, row.id);
      assert.doesNotMatch(hit.line.en, /heard/i, row.id);
      assert.doesNotMatch(hit.line.en, /nod/i, row.id);
      assert.doesNotMatch(hit.line.zh, /听见了/, row.id);
      assert.doesNotMatch(hit.line.zh, /点头/, row.id);
      assert.doesNotMatch(hit.line.ja, /聴いた/, row.id);
      assert.doesNotMatch(hit.line.ja, /うなず/, row.id);
    }
  });

  it('aggression fixtures never enter desktop L3 generate', () => {
    for (const row of fixturesForAggressionAcceptanceRoute(
      CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
    )) {
      const route = confideClassify(row.text);
      assert.equal(
        shouldUseDesktopCompanionGenerate({ ...readyOpen, route }),
        false,
        row.id
      );
    }
  });

  it('locks meat-test anchors from 2026-09-18/19 Electron QA', () => {
    assert.equal(confideClassify('我想打人'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
    assert.equal(confideClassify('人を殴りたい'), CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS);
    assert.equal(confideClassify('我要打游戏'), CONFIDE_ROUTE.FALLBACK);
    assert.equal(confideClassify('ゲームで殴る'), CONFIDE_ROUTE.FALLBACK);
    assert.equal(confideClassify('不想活'), CONFIDE_ROUTE.SAFETY_REDIRECT);
    assert.equal(confideClassify('想伤害自己'), CONFIDE_ROUTE.SAFETY_REDIRECT);
  });
});
