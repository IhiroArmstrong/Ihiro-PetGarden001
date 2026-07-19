import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FocusSession,
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY,
  COMPANION_MODE_ACROSS_TOOLS,
  shouldSuppressAwayReminders,
  shouldAutoStartFocusOnModeSelect,
  canBeginFocusOnCompanionModeSelect
} from './FocusSession.js';

test('elapsed time uses wall-clock timestamps, not tick accumulation', () => {
  let now = 1_000_000;
  const session = new FocusSession(1);
  session.start({ now: () => now, companionMode: COMPANION_MODE_STAY });

  now += 30_000;
  assert.equal(session.getElapsedSeconds(), 30);
  assert.ok(Math.abs(session.getFocusLevel() - 0.5) < 1e-9);

  // tick must not change the truth value
  session.tick(999);
  assert.equal(session.getElapsedSeconds(), 30);
});

test('hasReachedTarget becomes true after target wall-clock duration', () => {
  let now = 0;
  const session = new FocusSession(1);
  session.start({ now: () => now });

  now = 59_000;
  assert.equal(session.hasReachedTarget(), false);
  now = 60_000;
  assert.equal(session.hasReachedTarget(), true);
});

test('pause freezes elapsed wall time', () => {
  let now = 0;
  const session = new FocusSession(25);
  session.start({ now: () => now });
  now = 10_000;
  session.pause();
  now = 40_000;
  assert.equal(session.getElapsedSeconds(), 10);
  session.resume();
  now = 45_000;
  assert.equal(session.getElapsedSeconds(), 15);
});

test('companionMode stepAway is readable for the active session', () => {
  const session = new FocusSession(25);
  session.start({ companionMode: COMPANION_MODE_STEP_AWAY });
  assert.equal(session.isStepAwayMode(), true);
  session.stop();
  assert.equal(session.companionMode, COMPANION_MODE_STAY);
});

test('acrossTools suppresses away reminders like stepAway', () => {
  assert.equal(shouldSuppressAwayReminders(COMPANION_MODE_STAY), false);
  assert.equal(shouldSuppressAwayReminders(COMPANION_MODE_STEP_AWAY), true);
  assert.equal(shouldSuppressAwayReminders(COMPANION_MODE_ACROSS_TOOLS), true);

  const session = new FocusSession(25);
  session.start({ companionMode: COMPANION_MODE_ACROSS_TOOLS });
  assert.equal(session.isAcrossToolsMode(), true);
});

test('Here & Now and Flow State auto-start focus; Offline Space does not', () => {
  assert.equal(shouldAutoStartFocusOnModeSelect(COMPANION_MODE_STAY), true);
  assert.equal(
    shouldAutoStartFocusOnModeSelect(COMPANION_MODE_ACROSS_TOOLS),
    true
  );
  assert.equal(
    shouldAutoStartFocusOnModeSelect(COMPANION_MODE_STEP_AWAY),
    false
  );
});

test('auto-start mode still requires Arrival gate before beginFocus', () => {
  assert.equal(
    canBeginFocusOnCompanionModeSelect({
      mode: COMPANION_MODE_STAY,
      arrivalGateReady: true
    }),
    true
  );
  assert.equal(
    canBeginFocusOnCompanionModeSelect({
      mode: COMPANION_MODE_ACROSS_TOOLS,
      arrivalGateReady: true
    }),
    true
  );
  // 回归锁：Rise 后 / 未过 Arrival 时不得静默「选了却不开计时」
  assert.equal(
    canBeginFocusOnCompanionModeSelect({
      mode: COMPANION_MODE_STAY,
      arrivalGateReady: false
    }),
    false
  );
  assert.equal(
    canBeginFocusOnCompanionModeSelect({
      mode: COMPANION_MODE_STEP_AWAY,
      arrivalGateReady: true
    }),
    false
  );
  assert.equal(
    canBeginFocusOnCompanionModeSelect({
      mode: COMPANION_MODE_STAY,
      arrivalGateReady: true,
      isFocusing: true
    }),
    false
  );
});
