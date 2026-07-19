import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IdleOrchestrator,
  IDLE_VARIANT_CROSS_FADE_MS,
  IDLE_BREATH_CYCLES_BEFORE_BLINK
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

test('plays one continuous breath block then blinks with freeze cross-fade', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({
    player: harness.player,
    breathCyclesBeforeBlink: 3
  });

  orchestrator.start();
  assert.equal(harness.calls[0].name, 'idleBreathing');
  // 一次 play 连续 N 次 pingpong，避免逐次 restart 接缝
  assert.equal(harness.calls[0].options.maxCycles, 3);
  assert.equal(orchestrator.getStatus().breathsRemaining, 3);

  harness.calls.at(-1).options.onComplete();
  const blinkCall = harness.calls.at(-1);
  assert.equal(blinkCall.name, 'blinkSmile');
  assert.equal(blinkCall.options.loopMode, 'none');
  assert.equal(blinkCall.options.crossFadeMs, IDLE_VARIANT_CROSS_FADE_MS);
  // 回归锁：溶解期必须定格，否则切换闪一下
  assert.equal(blinkCall.options.freezeUntilCrossFadeEnds, true);
  assert.equal(orchestrator.getStatus().phase, 'blink');

  blinkCall.options.onComplete();
  const breathAgain = harness.calls.at(-1);
  assert.equal(breathAgain.name, 'idleBreathing');
  assert.equal(breathAgain.options.maxCycles, 3);
  assert.equal(breathAgain.options.crossFadeMs, IDLE_VARIANT_CROSS_FADE_MS);
  assert.equal(breathAgain.options.freezeUntilCrossFadeEnds, true);
  assert.equal(orchestrator.getStatus().breathsRemaining, 3);
});

test('default idle has no variant pool / no random scheduling API', () => {
  const harness = createHarness();
  const orchestrator = new IdleOrchestrator({ player: harness.player });
  assert.equal(orchestrator.breathCyclesBeforeBlink, IDLE_BREATH_CYCLES_BEFORE_BLINK);
  assert.equal(typeof orchestrator.forcePlayVariant, 'undefined');
  assert.equal('variants' in orchestrator, false);
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
  assert.equal(harness.calls.at(-1).options.maxCycles, 2);
});
