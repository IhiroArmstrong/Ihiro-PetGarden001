/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MindfulReminderController,
  MINDFUL_ACKNOWLEDGE_THRESHOLD_SECONDS,
  REFOCUS_PER_SESSION_LIMIT,
  STRETCH_REMINDER_THRESHOLD_SECONDS,
  ACTIVE_RECOVER_COOLDOWN_MS,
  ACTIVE_RECOVER_TOAST_MS
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
    getCopy: (key) => key,
    // stretch pool: prefer stretchReminder for stable assertions
    random: () => 0
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
  const { controller, emotions, shown } = setup();
  controller.startSession();

  controller.handleAttentionReturn({ durationMs: 60_001, displayEligible: true });
  controller.handleAttentionReturn({ durationMs: 90_000, displayEligible: true });

  assert.equal(REFOCUS_PER_SESSION_LIMIT, 1);
  assert.deepEqual(shown, ['REFOCUS_ACKNOWLEDGE']);
  assert.deepEqual(emotions, [
    {
      key: 'mindfulAcknowledge',
      options: { subtype: 'refocus' }
    }
  ]);
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
  const { controller, emotionController, emotions, shown } = setup();
  controller.startSession();
  emotionController.current = 'celebrating';
  controller.handleAttentionReturn({ durationMs: 61_000, displayEligible: true });
  emotionController.current = 'idle';
  controller.handleAttentionReturn({ durationMs: 70_000, displayEligible: true });

  assert.deepEqual(shown, []);
  assert.deepEqual(emotions, []);
  assert.equal(controller.getSessionStats().refocusHandledThisSession, 1);
});

test('step-away companion mode suppresses Re-focus but still pauses stretch on away', () => {
  const { controller, shown } = setup();
  controller.startSession({ suppressAwayReminders: true });
  controller.setAttentionAway(true);
  controller.update(10);
  assert.equal(
    controller.activeStretchSeconds,
    0,
    'Offline/step-away：离开时舒展活跃秒不得累加'
  );
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

test('Offline: wall-clock mindful still advances while stretch is paused away', () => {
  const { controller, shown } = setup();
  let wall = 0;
  controller.startSession({
    suppressAwayReminders: true,
    getSessionElapsedSeconds: () => wall
  });
  controller.setAttentionAway(true);
  wall = MINDFUL_ACKNOWLEDGE_THRESHOLD_SECONDS;
  controller.update(0);
  assert.deepEqual(shown, ['MINDFUL_FOCUS_MILESTONE']);
  assert.equal(controller.activeStretchSeconds, 0);
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

test('triggerActiveRecover plays nod path without consuming quota or Re-focus slot', () => {
  let quota = 1;
  const shown = [];
  const emotions = [];
  const reminderTypes = [];
  const controller = new MindfulReminderController({
    quotaManager: {
      tryConsume() {
        if (quota <= 0) return false;
        quota -= 1;
        return true;
      }
    },
    emotionController: {
      current: 'idle',
      getCurrentEmotionKey() {
        return this.current;
      },
      playEmotion(key, options) {
        emotions.push({ key, options });
      }
    },
    toast: {
      show(message, options) {
        shown.push({ message, options });
        return true;
      }
    },
    getCopy: (key) => key,
    now: (() => {
      let t = 1_000_000;
      return () => t;
    })(),
    onReminderShown: (type) => reminderTypes.push(type)
  });

  assert.equal(controller.triggerActiveRecover().ok, false);
  assert.equal(controller.triggerActiveRecover().reason, 'inactive');

  controller.startSession();
  const first = controller.triggerActiveRecover();
  assert.equal(first.ok, true);
  assert.equal(quota, 1, 'active Recover must not tryConsume reminder quota');
  assert.equal(controller.getSessionStats().refocusHandledThisSession, 0);
  assert.deepEqual(emotions, [
    { key: 'mindfulAcknowledge', options: { subtype: 'activeRecover' } }
  ]);
  assert.equal(shown[0].message, 'ACTIVE_RECOVER');
  assert.equal(shown[0].options.placement, 'center');
  assert.equal(shown[0].options.visibleMs, ACTIVE_RECOVER_TOAST_MS);
  assert.deepEqual(reminderTypes, ['activeRecover']);
  assert.equal(ACTIVE_RECOVER_COOLDOWN_MS, 3 * 60 * 1000);
});

test('triggerActiveRecover respects cooldown then allows again; strong emotion yields', () => {
  let nowMs = 5_000_000;
  const emotions = [];
  const controller = new MindfulReminderController({
    quotaManager: {
      tryConsume() {
        return true;
      }
    },
    emotionController: {
      current: 'idle',
      getCurrentEmotionKey() {
        return this.current;
      },
      playEmotion(key, options) {
        emotions.push({ key, options });
      }
    },
    toast: {
      show() {
        return true;
      }
    },
    getCopy: (key) => key,
    now: () => nowMs
  });

  controller.startSession();
  assert.equal(controller.triggerActiveRecover().ok, true);
  const blocked = controller.triggerActiveRecover();
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'cooldown');
  assert.ok(blocked.remainingMs > 0);
  assert.equal(emotions.length, 1);

  nowMs += ACTIVE_RECOVER_COOLDOWN_MS;
  assert.equal(controller.isActiveRecoverAvailable(), true);
  assert.equal(controller.triggerActiveRecover().ok, true);
  assert.equal(emotions.length, 2);

  nowMs += ACTIVE_RECOVER_COOLDOWN_MS;
  controller.emotionController.current = 'celebrating';
  assert.equal(controller.triggerActiveRecover().reason, 'strong_emotion');
  assert.equal(emotions.length, 2);
});

test('acknowledgeActiveRecoverCooldownTap plays micro-nod without toast or extending cooldown', () => {
  let nowMs = 5_000_000;
  const shown = [];
  const emotions = [];
  const reminderTypes = [];
  const controller = new MindfulReminderController({
    quotaManager: {
      tryConsume() {
        return true;
      }
    },
    emotionController: {
      current: 'idle',
      getCurrentEmotionKey() {
        return this.current;
      },
      playEmotion(key, options) {
        emotions.push({ key, options });
      }
    },
    toast: {
      show(message, options) {
        shown.push({ message, options });
        return true;
      }
    },
    getCopy: (key) => key,
    now: () => nowMs,
    onReminderShown: (type) => reminderTypes.push(type)
  });

  assert.equal(
    controller.acknowledgeActiveRecoverCooldownTap().reason,
    'inactive'
  );

  controller.startSession();
  assert.equal(
    controller.acknowledgeActiveRecoverCooldownTap().reason,
    'available'
  );

  assert.equal(controller.triggerActiveRecover().ok, true);
  const remainingBefore = controller.getActiveRecoverCooldownRemainingMs();
  assert.ok(remainingBefore > 0);

  const ack = controller.acknowledgeActiveRecoverCooldownTap();
  assert.equal(ack.ok, true);
  assert.equal(ack.remainingMs, remainingBefore);
  assert.equal(
    controller.getActiveRecoverCooldownRemainingMs(),
    remainingBefore,
    'cooldown tap must not reset or extend the 180s window'
  );
  assert.deepEqual(emotions[1], {
    key: 'mindfulAcknowledge',
    options: { subtype: 'activeRecoverCooldown' }
  });
  assert.equal(shown.length, 1, 'cooldown tap must not show toast');
  assert.deepEqual(reminderTypes, ['activeRecover']);

  nowMs += remainingBefore;
  assert.equal(controller.triggerActiveRecover().ok, true);
  assert.equal(emotions[2].options.subtype, 'activeRecover');
  assert.equal(shown.length, 2);

  controller.emotionController.current = 'celebrating';
  assert.equal(
    controller.acknowledgeActiveRecoverCooldownTap().reason,
    'strong_emotion'
  );
});
