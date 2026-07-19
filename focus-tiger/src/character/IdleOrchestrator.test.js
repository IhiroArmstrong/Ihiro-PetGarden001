import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IdleOrchestrator,
  IDLE_VARIANT_CROSS_FADE_MS,
  IDLE_BREATH_CYCLES_BEFORE_BLINK,
  IDLE_OPEN_EYE_VARIANTS
} from './IdleOrchestrator.js';

function createHarness() {
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

  return { player, calls };
}

test('plays one pingpong breath at a time, blinks after N, then repeats', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({
    player: harness.player,
    breathCyclesBeforeBlink: 3
  });

  orchestrator.start();
  assert.equal(harness.calls[0].name, 'idleBreathing');
  assert.equal(harness.calls[0].options.maxCycles, 1);
  assert.equal(orchestrator.getStatus().breathsRemaining, 3);

  // complete breath 1 → 2 remaining
  harness.calls.at(-1).options.onComplete();
  assert.equal(harness.calls.at(-1).name, 'idleBreathing');
  assert.equal(orchestrator.getStatus().breathsRemaining, 2);

  harness.calls.at(-1).options.onComplete();
  assert.equal(orchestrator.getStatus().breathsRemaining, 1);

  harness.calls.at(-1).options.onComplete();
  const blinkCall = harness.calls.at(-1);
  assert.equal(blinkCall.name, 'blinkSmile');
  assert.equal(blinkCall.options.loopMode, 'none');
  assert.equal(blinkCall.options.crossFadeMs, IDLE_VARIANT_CROSS_FADE_MS);
  assert.equal(orchestrator.getStatus().phase, 'blink');

  blinkCall.options.onComplete();
  assert.equal(harness.calls.at(-1).name, 'idleBreathing');
  assert.equal(orchestrator.getStatus().breathsRemaining, 3);
});

test('default pattern has no yawn / gaze random pool', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({ player: harness.player });
  assert.deepEqual(orchestrator.variants, []);
  assert.equal(orchestrator.breathCyclesBeforeBlink, IDLE_BREATH_CYCLES_BEFORE_BLINK);
  assert.equal(IDLE_OPEN_EYE_VARIANTS.length >= 1, true);
});

test('stop during blink prevents automatic return to breathing', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({
    player: harness.player,
    breathCyclesBeforeBlink: 1
  });

  orchestrator.start();
  harness.calls[0].options.onComplete();
  const blinkCall = harness.calls.at(-1);
  assert.equal(blinkCall.name, 'blinkSmile');
  orchestrator.stop();
  blinkCall.options.onComplete();

  assert.equal(orchestrator.isActive(), false);
  assert.equal(harness.calls.at(-1).type, 'stop');
  assert.equal(
    harness.calls.filter((c) => c.type === 'play' && c.name === 'idleBreathing')
      .length,
    1
  );
});

test('setTiming restarts with new breath cycle count', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({
    player: harness.player,
    breathCyclesBeforeBlink: 5
  });
  orchestrator.start();
  orchestrator.setTiming({ breathCyclesBeforeBlink: 2 });
  assert.equal(orchestrator.breathCyclesBeforeBlink, 2);
  assert.equal(orchestrator.getStatus().breathsRemaining, 2);
  assert.equal(harness.calls.at(-1).options.maxCycles, 1);
});
