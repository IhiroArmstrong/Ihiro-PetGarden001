import test from 'node:test';
import assert from 'node:assert/strict';
import { IdleOrchestrator } from './IdleOrchestrator.js';

function createHarness() {
  let timerId = 0;
  const timers = new Map();
  const calls = [];
  const player = {
    current: null,
    playing: false,
    play(name, options = {}) {
      this.current = name;
      this.playing = true;
      calls.push({ type: 'play', name, options });
      return true;
    },
    stop(options) {
      this.playing = false;
      calls.push({ type: 'stop', options });
    },
    isPlaying() {
      return this.playing;
    },
    getCurrentSequence() {
      return this.current;
    }
  };
  const setTimeoutFn = (callback, delay) => {
    const id = ++timerId;
    timers.set(id, { callback, delay });
    return id;
  };
  const clearTimeoutFn = (id) => timers.delete(id);

  return { player, calls, timers, setTimeoutFn, clearTimeoutFn };
}

test('starts breathing, inserts glance, then restarts breathing with cooldown', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({
    player: harness.player,
    minIntervalMs: 25_000,
    maxIntervalMs: 45_000,
    cooldownMs: 10_000,
    random: () => 0.5,
    setTimeoutFn: harness.setTimeoutFn,
    clearTimeoutFn: harness.clearTimeoutFn
  });

  orchestrator.start();
  assert.equal(harness.calls[0].name, 'idleBreathing');
  const firstTimer = [...harness.timers.values()][0];
  assert.equal(firstTimer.delay, 35_000);

  firstTimer.callback();
  const glanceCall = harness.calls.at(-1);
  assert.equal(glanceCall.name, 'idleEyeGlance');

  glanceCall.options.onComplete();
  assert.equal(harness.calls.at(-1).name, 'idleBreathing');
  const nextTimer = [...harness.timers.values()].at(-1);
  assert.equal(nextTimer.delay, 45_000);
});

test('stop during a variant prevents automatic return to idle', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({
    player: harness.player,
    minIntervalMs: 1,
    maxIntervalMs: 1,
    random: () => 0,
    setTimeoutFn: harness.setTimeoutFn,
    clearTimeoutFn: harness.clearTimeoutFn
  });

  orchestrator.start();
  [...harness.timers.values()][0].callback();
  const glanceCall = harness.calls.at(-1);
  orchestrator.stop();
  glanceCall.options.onComplete();

  assert.equal(orchestrator.isActive(), false);
  assert.equal(harness.calls.at(-1).type, 'stop');
});

test('does not interrupt a non-base sequence', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({
    player: harness.player,
    minIntervalMs: 1,
    maxIntervalMs: 1,
    random: () => 0,
    setTimeoutFn: harness.setTimeoutFn,
    clearTimeoutFn: harness.clearTimeoutFn
  });

  orchestrator.start();
  harness.player.current = 'celebrating';
  const timer = [...harness.timers.values()][0];
  timer.callback();

  assert.equal(harness.calls.filter((call) => call.name === 'idleEyeGlance').length, 0);
  assert.equal(harness.timers.size > 0, true);
});
