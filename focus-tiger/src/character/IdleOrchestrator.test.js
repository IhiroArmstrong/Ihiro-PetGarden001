import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IdleOrchestrator,
  IDLE_BREATH_GLANCE_SEAM_MS,
  IDLE_BREATH_PINGPONG_CYCLES,
  IDLE_BLINK_PINGPONG_CYCLES
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

test('plays closed breath pingpong x2 then blink arc pingpong x1 with hard cut', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({
    player: harness.player,
    breathPingpongCycles: 2,
    blinkPingpongCycles: 1
  });

  orchestrator.start();
  assert.equal(harness.calls[0].name, 'idleBreathClosed');
  assert.equal(harness.calls[0].options.maxCycles, 2);
  assert.equal(harness.calls[0].options.loopMode, 'pingpong');
  assert.equal(harness.calls[0].options.crossFadeMs, IDLE_BREATH_GLANCE_SEAM_MS);
  assert.equal(orchestrator.getStatus().phase, 'breath');

  harness.calls[0].options.onComplete();
  const blinkCall = harness.calls.at(-1);
  assert.equal(blinkCall.name, 'idleBlinkArc');
  assert.equal(blinkCall.options.maxCycles, 1);
  assert.equal(blinkCall.options.loopMode, 'pingpong');
  assert.equal(blinkCall.options.crossFadeMs, IDLE_BREATH_GLANCE_SEAM_MS);
  assert.equal(orchestrator.getStatus().phase, 'blink');

  blinkCall.options.onComplete();
  const breathAgain = harness.calls.at(-1);
  assert.equal(breathAgain.name, 'idleBreathClosed');
  assert.equal(breathAgain.options.maxCycles, 2);
});

test('default cycle counts match product spec', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({ player: harness.player });
  assert.equal(orchestrator.breathPingpongCycles, IDLE_BREATH_PINGPONG_CYCLES);
  assert.equal(orchestrator.blinkPingpongCycles, IDLE_BLINK_PINGPONG_CYCLES);
  assert.equal(IDLE_BREATH_PINGPONG_CYCLES, 2);
  assert.equal(IDLE_BLINK_PINGPONG_CYCLES, 1);
});

test('stop during blink prevents automatic return to breathing', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({
    player: harness.player,
    breathPingpongCycles: 1
  });

  orchestrator.start();
  harness.calls[0].options.onComplete();
  const blinkCall = harness.calls.at(-1);
  assert.equal(blinkCall.name, 'idleBlinkArc');
  orchestrator.stop();
  blinkCall.options.onComplete();

  assert.equal(orchestrator.isActive(), false);
  assert.equal(
    harness.calls.filter((c) => c.type === 'play' && c.name === 'idleBreathClosed')
      .length,
    1
  );
});

test('setTiming restarts with new breath pingpong cycle count', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({ player: harness.player });
  orchestrator.start();
  orchestrator.setTiming({ breathPingpongCycles: 1 });
  assert.equal(orchestrator.breathPingpongCycles, 1);
  assert.equal(harness.calls.at(-1).options.maxCycles, 1);
});

test('no variant pool / no random scheduling API', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({ player: harness.player });
  assert.equal(typeof orchestrator.forcePlayVariant, 'undefined');
  assert.equal('variants' in orchestrator, false);
});
