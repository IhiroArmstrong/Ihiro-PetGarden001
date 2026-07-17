import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MindfulReminderController,
  MINDFUL_ACKNOWLEDGE_THRESHOLD_SECONDS,
  REFOCUS_PER_SESSION_LIMIT,
  STRETCH_REMINDER_THRESHOLD_SECONDS
} from './MindfulReminderController.js';

function setup({ quota = 3 } = {}) {
  const shown = [];
  const emotions = [];
  const quotaManager = {
    tryConsume() {
      if (quota <= 0) return false;
      quota -= 1;
      return true;
    }
  };
  const emotionController = {
    current: 'idle',
    getCurrentEmotionKey() {
      return this.current;
    },
    playEmotion(key, options) {
      emotions.push({ key, options });
    }
  };
  const controller = new MindfulReminderController({
    quotaManager,
    emotionController,
    toast: {
      show(message) {
        shown.push(message);
        return true;
      }
    },
    getCopy: (key) => key
  });
  return { controller, emotionController, emotions, shown };
}

test('20 minute and 2 hour reminders use the same display path', () => {
  const { controller, emotions, shown } = setup();
  controller.startSession();

  controller.update(MINDFUL_ACKNOWLEDGE_THRESHOLD_SECONDS);
  controller.update(
    STRETCH_REMINDER_THRESHOLD_SECONDS -
      MINDFUL_ACKNOWLEDGE_THRESHOLD_SECONDS
  );

  assert.deepEqual(shown, [
    'MINDFUL_FOCUS_MILESTONE',
    'STRETCH_REMINDER'
  ]);
  assert.deepEqual(
    emotions.map(({ key }) => key),
    ['mindfulAcknowledge', 'stretchReminder']
  );
});

test('Re-focus is handled at most once per focus session', () => {
  const { controller, shown } = setup();
  controller.startSession();

  controller.handleAttentionReturn({ durationMs: 60_001, displayEligible: true });
  controller.handleAttentionReturn({ durationMs: 90_000, displayEligible: true });

  assert.equal(REFOCUS_PER_SESSION_LIMIT, 1);
  assert.deepEqual(shown, ['REFOCUS_ACKNOWLEDGE']);
  assert.equal(controller.getSessionStats().candidateDepartureCount, 2);
});

test('20 second candidate is recorded without consuming display quota', () => {
  const { controller, shown } = setup();
  controller.startSession();
  controller.handleAttentionReturn({ durationMs: 20_000, displayEligible: false });

  assert.deepEqual(shown, []);
  assert.deepEqual(controller.getSessionStats(), {
    candidateDepartureCount: 1,
    refocusHandledThisSession: 0
  });
});

test('eligible Re-focus silently yields to a stronger emotion and is not replayed', () => {
  const { controller, emotionController, shown } = setup();
  controller.startSession();
  emotionController.current = 'celebrating';
  controller.handleAttentionReturn({ durationMs: 61_000, displayEligible: true });
  emotionController.current = 'idle';
  controller.handleAttentionReturn({ durationMs: 70_000, displayEligible: true });

  assert.deepEqual(shown, []);
  assert.equal(controller.getSessionStats().refocusHandledThisSession, 1);
});

test('step-away companion mode suppresses Re-focus but still pauses stretch on away', () => {
  const { controller, shown } = setup();
  controller.startSession({ suppressAwayReminders: true });
  controller.setAttentionAway(true);
  controller.update(10);
  controller.handleAttentionReturn({ durationMs: 90_000, displayEligible: true });

  assert.deepEqual(shown, []);
  assert.equal(controller.getSessionStats().candidateDepartureCount, 0);
  assert.equal(controller.getSessionStats().refocusHandledThisSession, 0);

  controller.setAttentionAway(false);
  shown.length = 0;
  controller.update(STRETCH_REMINDER_THRESHOLD_SECONDS);
  assert.ok(shown.includes('STRETCH_REMINDER'));
  assert.ok(!shown.some((key) => key.startsWith('REFOCUS')));
});

test('session elapsed can follow a wall-clock reader', () => {
  const { controller, shown } = setup();
  let elapsed = 0;
  controller.startSession({
    getSessionElapsedSeconds: () => elapsed
  });
  elapsed = MINDFUL_ACKNOWLEDGE_THRESHOLD_SECONDS;
  controller.update(0);
  assert.deepEqual(shown, ['MINDFUL_FOCUS_MILESTONE']);
});
