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
  assert.equal(matchesAggressionTowardOthers('想打人'), false);
});
