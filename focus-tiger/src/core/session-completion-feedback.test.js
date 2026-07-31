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
    onComplete
  });

  assert.equal(selected, 'sessionComplete');
  assert.equal(celebrations, 0);
  assert.equal(emotions.length, 1);
  assert.equal(emotions[0].key, 'sessionComplete');
  assert.equal(emotions[0].options.onComplete, onComplete);
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
