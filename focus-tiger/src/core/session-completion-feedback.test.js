/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { triggerSessionCompletionFeedback } from './session-completion-feedback.js';

test('already celebrated → sessionComplete without celebrating', () => {
  const emotions = [];
  let celebrations = 0;
  const onComplete = () => {};

  const selected = triggerSessionCompletionFeedback({
    hasCelebratedToday: true,
    emotionController: {
      playEmotion(key, options) {
        emotions.push({ key, options });
      }
    },
    startCelebrating: () => {
      celebrations += 1;
    },
    onComplete,
    random: () => 0
  });

  assert.equal(selected, 'sessionComplete');
  assert.equal(celebrations, 0);
  assert.equal(emotions.length, 1);
  assert.equal(emotions[0].key, 'sessionComplete');
  assert.equal(emotions[0].options.onComplete, onComplete);
});

test('already celebrated light pool never picks celebrate-dance', () => {
  const emotions = [];
  for (let i = 0; i < 20; i++) {
    triggerSessionCompletionFeedback({
      hasCelebratedToday: true,
      emotionController: {
        playEmotion(key) {
          emotions.push(key);
        }
      },
      startCelebrating: () => {},
      onComplete: () => {},
      random: () => i / 20
    });
  }
  assert.ok(emotions.every((k) => k !== 'celebrating' && k !== 'celebrateDanceV2'));
  assert.ok(emotions.includes('sessionComplete'));
});

test('not yet celebrated → celebrating without sessionComplete', () => {
  const emotions = [];
  let celebrations = 0;

  const selected = triggerSessionCompletionFeedback({
    hasCelebratedToday: false,
    emotionController: {
      playEmotion(key) {
        emotions.push(key);
      }
    },
    startCelebrating: () => {
      celebrations += 1;
    },
    onComplete: () => {}
  });

  assert.equal(selected, 'celebrating');
  assert.equal(celebrations, 1);
  assert.deepEqual(emotions, []);
});

test('preferMilestoneGlow → milestoneGlow; suppresses celebrating', () => {
  const emotions = [];
  let celebrations = 0;
  let glows = 0;

  const selected = triggerSessionCompletionFeedback({
    hasCelebratedToday: false,
    preferMilestoneGlow: true,
    emotionController: {
      playEmotion(key) {
        emotions.push(key);
      }
    },
    startCelebrating: () => {
      celebrations += 1;
    },
    startMilestoneGlow: () => {
      glows += 1;
    },
    onComplete: () => {}
  });

  assert.equal(selected, 'milestoneGlow');
  assert.equal(glows, 1);
  assert.equal(celebrations, 0);
  assert.deepEqual(emotions, []);
});
