import test from 'node:test';
import assert from 'node:assert/strict';

import { triggerSessionCompletionFeedback } from './session-completion-feedback.js';

test('completed non-first session triggers sessionComplete without celebrating', () => {
  const emotions = [];
  let celebrations = 0;
  const onComplete = () => {};

  const selected = triggerSessionCompletionFeedback({
    hasCompletedToday: true,
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

test('first completion starts celebrating without sessionComplete', () => {
  const emotions = [];
  let celebrations = 0;

  const selected = triggerSessionCompletionFeedback({
    hasCompletedToday: false,
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
