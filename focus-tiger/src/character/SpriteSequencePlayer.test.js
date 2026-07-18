import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceSpriteFrame,
  SPRITE_LOOP_MODES
} from './SpriteSequencePlayer.js';
import { SPRITE_SEQUENCES } from './spriteManifest.js';

function collectFrames({ frameCount, loopMode, steps }) {
  const seen = [0];
  let state = { frameIndex: 0, direction: 1 };
  for (let i = 0; i < steps; i += 1) {
    state = advanceSpriteFrame({
      ...state,
      frameCount,
      loopMode
    });
    seen.push(state.frameIndex);
  }
  return seen;
}

test('pingpong skips the duplicated last frame and restarts from frame 001', () => {
  const seen = collectFrames({
    frameCount: 4,
    loopMode: SPRITE_LOOP_MODES.PINGPONG,
    steps: 8
  });

  assert.deepEqual(seen, [0, 1, 2, 3, 2, 1, 0, 0, 1]);
});

test('forward loop wraps directly to the first frame', () => {
  const seen = collectFrames({
    frameCount: 3,
    loopMode: SPRITE_LOOP_MODES.FORWARD,
    steps: 4
  });

  assert.deepEqual(seen, [0, 1, 2, 0, 1]);
});

test('non-looping sequence completes on its last frame', () => {
  let state = { frameIndex: 0, direction: 1 };
  state = advanceSpriteFrame({
    ...state,
    frameCount: 2,
    loopMode: SPRITE_LOOP_MODES.NONE
  });
  assert.deepEqual(state, {
    frameIndex: 1,
    direction: 1,
    complete: false
  });

  state = advanceSpriteFrame({
    ...state,
    frameCount: 2,
    loopMode: SPRITE_LOOP_MODES.NONE
  });
  assert.equal(state.complete, true);
  assert.equal(state.frameIndex, 1);
});

test('halo breathing scheme A is intro then pingpong loop', () => {
  assert.deepEqual(
    {
      startFrame: SPRITE_SEQUENCES.haloBreathingIntro.startFrame,
      frameCount: SPRITE_SEQUENCES.haloBreathingIntro.frameCount,
      loopMode: SPRITE_SEQUENCES.haloBreathingIntro.loopMode
    },
    { startFrame: 1, frameCount: 6, loopMode: SPRITE_LOOP_MODES.NONE }
  );
  assert.deepEqual(
    {
      startFrame: SPRITE_SEQUENCES.haloBreathingLoop.startFrame,
      frameCount: SPRITE_SEQUENCES.haloBreathingLoop.frameCount,
      loopMode: SPRITE_SEQUENCES.haloBreathingLoop.loopMode
    },
    { startFrame: 7, frameCount: 24, loopMode: SPRITE_LOOP_MODES.PINGPONG }
  );
  assert.equal(
    SPRITE_SEQUENCES.haloBreathingPingpong.loopMode,
    SPRITE_LOOP_MODES.PINGPONG
  );
  assert.equal(SPRITE_SEQUENCES.haloBreathingPingpong.preload, false);
});

test('blink smile is registered as a pingpong smiling baseline', () => {
  assert.equal(
    SPRITE_SEQUENCES.blinkSmile.loopMode,
    SPRITE_LOOP_MODES.PINGPONG
  );
  assert.equal(SPRITE_SEQUENCES.blinkSmile.frameCount, 12);
  assert.equal(SPRITE_SEQUENCES.blinkSmile.loop, true);
});

test('dormant wake is a one-shot 16-frame transition that holds its final pose', () => {
  const definition = SPRITE_SEQUENCES.dormantWake;

  assert.equal(definition.frameCount, 16);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.holdLastFrame, true);
  assert.ok(definition.frameHolds[16] > 0);
});

test('milestone glow is an on-demand one-shot that holds its final pose', () => {
  const definition = SPRITE_SEQUENCES.milestoneGlow;

  assert.equal(definition.animation, 'milestone-glow');
  assert.equal(definition.frameCount, 27);
  assert.equal(definition.preload, false);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.holdLastFrame, true);
});

test('nod greeting is a one-shot 23-frame sequence', () => {
  const definition = SPRITE_SEQUENCES.nodGreeting;

  assert.equal(definition.frameCount, 23);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.loop, false);
  assert.equal(definition.holdLastFrame, false);
});

test('tilt think is a one-shot 20-frame sequence', () => {
  const definition = SPRITE_SEQUENCES.tiltThink;

  assert.equal(definition.frameCount, 20);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.loop, false);
  assert.equal(definition.holdLastFrame, false);
});

test('nod bow is a restrained one-shot 13-frame sequence', () => {
  const definition = SPRITE_SEQUENCES.nodBow;

  assert.equal(definition.frameCount, 13);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.loop, false);
  assert.equal(definition.holdLastFrame, false);
});

test('stretch reminder is a one-shot 17-frame sequence', () => {
  const definition = SPRITE_SEQUENCES.stretchReminder;

  assert.equal(definition.animation, 'stretch-reminder');
  assert.equal(definition.frameCount, 17);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.loop, false);
  assert.equal(definition.holdLastFrame, false);
});

test('celebrateDanceV2 is registered as celebrating alternate', () => {
  const definition = SPRITE_SEQUENCES.celebrateDanceV2;
  assert.equal(definition.animation, 'celebrate-dance-v2');
  assert.equal(definition.frameCount, 60);
  assert.equal(definition.loop, false);
  assert.equal(definition.loopMode, 'none');
});

test('palmsTogether / breathHaloExpand / lotus backlog sequences are registered', () => {
  assert.equal(SPRITE_SEQUENCES.palmsTogether.animation, 'palms-together');
  assert.equal(SPRITE_SEQUENCES.palmsTogether.frameCount, 14);
  assert.equal(SPRITE_SEQUENCES.breathHaloExpand.animation, 'breath-halo-expand');
  assert.equal(SPRITE_SEQUENCES.breathHaloExpand.frameCount, 17);
  assert.equal(SPRITE_SEQUENCES.breathHaloExpand.preload, false);
  assert.equal(SPRITE_SEQUENCES.lotusFrontRising.animation, 'lotus-front-rising');
  assert.equal(SPRITE_SEQUENCES.lotusFrontRising.frameCount, 7);
  assert.equal(SPRITE_SEQUENCES.lotusFrontRising.preload, false);
  assert.equal(SPRITE_SEQUENCES.lotusChestHalo.animation, 'lotus-chest-halo');
  assert.equal(SPRITE_SEQUENCES.lotusChestHalo.frameCount, 10);
  assert.equal(SPRITE_SEQUENCES.lotusChestHalo.preload, false);
});
