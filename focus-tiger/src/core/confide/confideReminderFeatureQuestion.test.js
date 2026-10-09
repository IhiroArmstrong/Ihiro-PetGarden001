/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isConfideReminderFeatureQuestion } from './confideReminderFeatureQuestion.js';

describe('isConfideReminderFeatureQuestion', () => {
  it('matches in-app reminder menu asks', () => {
    assert.equal(isConfideReminderFeatureQuestion('提醒我练习'), true);
    assert.equal(isConfideReminderFeatureQuestion('提醒在哪'), true);
    assert.equal(isConfideReminderFeatureQuestion('怎么设提醒'), true);
    assert.equal(isConfideReminderFeatureQuestion('什么时候提醒你'), true);
    assert.equal(isConfideReminderFeatureQuestion('Remind me to practice'), true);
    assert.equal(isConfideReminderFeatureQuestion('Where do I turn on reminders?'), true);
    assert.equal(isConfideReminderFeatureQuestion('Set a daily practice reminder'), true);
  });

  it('does not match mood or unrelated nagging', () => {
    assert.equal(isConfideReminderFeatureQuestion('有点烦'), false);
    assert.equal(isConfideReminderFeatureQuestion('我不想被催'), false);
    assert.equal(isConfideReminderFeatureQuestion('Away reminders stay off in this mode'), false);
  });
});
