/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  RHETORICAL_CRISIS_CONFIRM,
  confirmRhetoricalCrisisUse
} from './confideRhetoricalCrisisConfirm.js';
import { confirmRhetoricalCrisisUse as packedConfirm } from '../../../desktop/companion/l1RhetoricalCrisisConfirm.js';

describe('confide rhetorical-crisis confirm (CR-48)', () => {
  it('keeps self-directed prototypes as self', () => {
    assert.equal(confirmRhetoricalCrisisUse('I want to die'), RHETORICAL_CRISIS_CONFIRM.SELF);
    assert.equal(
      confirmRhetoricalCrisisUse("I don't want to live anymore"),
      RHETORICAL_CRISIS_CONFIRM.SELF
    );
    assert.equal(confirmRhetoricalCrisisUse('我想死'), RHETORICAL_CRISIS_CONFIRM.SELF);
    assert.equal(confirmRhetoricalCrisisUse('我不想活了'), RHETORICAL_CRISIS_CONFIRM.SELF);
  });

  it('marks affectionate / intensifier death-talk as rhetorical', () => {
    assert.equal(confirmRhetoricalCrisisUse('想死你了'), RHETORICAL_CRISIS_CONFIRM.RHETORICAL);
    assert.equal(
      confirmRhetoricalCrisisUse("I'm dying to see you"),
      RHETORICAL_CRISIS_CONFIRM.RHETORICAL
    );
    assert.equal(
      confirmRhetoricalCrisisUse('this is killing me'),
      RHETORICAL_CRISIS_CONFIRM.RHETORICAL
    );
    assert.equal(
      confirmRhetoricalCrisisUse('I could die of embarrassment'),
      RHETORICAL_CRISIS_CONFIRM.RHETORICAL
    );
    assert.equal(confirmRhetoricalCrisisUse('笑死我了'), RHETORICAL_CRISIS_CONFIRM.RHETORICAL);
    assert.equal(confirmRhetoricalCrisisUse('累死了'), RHETORICAL_CRISIS_CONFIRM.RHETORICAL);
  });

  it('leaves ambiguous lines uncertain so they still refer', () => {
    assert.equal(confirmRhetoricalCrisisUse("I'm dying"), RHETORICAL_CRISIS_CONFIRM.UNCERTAIN);
    assert.equal(confirmRhetoricalCrisisUse(''), RHETORICAL_CRISIS_CONFIRM.UNCERTAIN);
  });

  it('keeps the packaged companion copy aligned', () => {
    const samples = [
      'I want to die',
      "I'm dying to see you",
      '想死你了',
      '我不想活了',
      "I'm dying"
    ];
    for (const text of samples) {
      assert.equal(packedConfirm(text), confirmRhetoricalCrisisUse(text), text);
    }
  });
});
