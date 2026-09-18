/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { matchesAggressionTowardOthers } from './confideAggressionKeywords.js';

test('aggression positives: beat/hurt people and fantasies', () => {
  assert.equal(matchesAggressionTowardOthers('I want to beat people.'), true);
  assert.equal(matchesAggressionTowardOthers('I want to hurt him'), true);
  assert.equal(matchesAggressionTowardOthers('I want to punch someone'), true);
  assert.equal(matchesAggressionTowardOthers('thinking about hurting her'), true);
  assert.equal(matchesAggressionTowardOthers('I wanna hit them'), true);
  assert.equal(matchesAggressionTowardOthers('I want to kill him'), true);
});

test('aggression negatives: games, sports, idioms, objects, self-harm phrasing', () => {
  assert.equal(matchesAggressionTowardOthers('I want to beat this level'), false);
  assert.equal(matchesAggressionTowardOthers('I want to beat the other team'), false);
  assert.equal(matchesAggressionTowardOthers("I'd kill for a coffee"), false);
  assert.equal(matchesAggressionTowardOthers('beat him at chess'), false);
  assert.equal(matchesAggressionTowardOthers('punch a wall'), false);
  assert.equal(matchesAggressionTowardOthers('I want to hurt myself'), false);
  assert.equal(matchesAggressionTowardOthers('打游戏'), false);
  assert.equal(matchesAggressionTowardOthers('打卡'), false);
  assert.equal(matchesAggressionTowardOthers('打坐'), false);
  assert.equal(matchesAggressionTowardOthers('打球'), false);
  assert.equal(matchesAggressionTowardOthers('打电话'), false);
  assert.equal(matchesAggressionTowardOthers('打字'), false);
  assert.equal(matchesAggressionTowardOthers('想伤害自己'), false);
  assert.equal(matchesAggressionTowardOthers('自残'), false);
});

test('aggression positives: ZH other-directed phrases', () => {
  assert.equal(matchesAggressionTowardOthers('想打人'), true);
  assert.equal(matchesAggressionTowardOthers('我想打人'), true);
  assert.equal(matchesAggressionTowardOthers('想揍人'), true);
  assert.equal(matchesAggressionTowardOthers('我想揍人'), true);
  assert.equal(matchesAggressionTowardOthers('想打他'), true);
  assert.equal(matchesAggressionTowardOthers('想打她'), true);
  assert.equal(matchesAggressionTowardOthers('想打他们'), true);
  assert.equal(matchesAggressionTowardOthers('想打别人'), true);
  assert.equal(matchesAggressionTowardOthers('想伤害他'), true);
  assert.equal(matchesAggressionTowardOthers('想傷害別人'), true);
});
