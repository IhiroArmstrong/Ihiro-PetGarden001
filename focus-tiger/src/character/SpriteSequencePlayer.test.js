import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceSpriteFrame,
  shouldHideOverlayOnFinish,
  shouldApplySleepBreath,
  SLEEP_BREATH_CLASS,
  SPRITE_LOOP_MODES
} from './SpriteSequencePlayer.js';
import { buildFramePaths } from './CharacterConfig.js';
import {
  SPRITE_SEQUENCES,
  WAVE_HELLO_FORWARD_INDICES,
  WAVE_HELLO_PINGPONG_ONCE_INDICES,
  EAR_WIGGLE_FORWARD_INDICES,
  EAR_WIGGLE_PINGPONG_ONCE_INDICES
} from './spriteManifest.js';

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

test('oneshot finish keeps overlay when onComplete will CapCut to idle', () => {
  assert.equal(
    shouldHideOverlayOnFinish({ holdLastFrame: false, hasOnComplete: true }),
    false
  );
  assert.equal(
    shouldHideOverlayOnFinish({ holdLastFrame: false, hasOnComplete: false }),
    true
  );
  assert.equal(
    shouldHideOverlayOnFinish({ holdLastFrame: true, hasOnComplete: false }),
    false
  );
});

test('waveHelloWelcome bakes forward+reverse once without player pingpong', () => {
  assert.equal(SPRITE_SEQUENCES.waveHello.loopMode, 'none');
  assert.deepEqual(
    SPRITE_SEQUENCES.waveHello.frameIndices,
    [...WAVE_HELLO_FORWARD_INDICES]
  );
  assert.equal(SPRITE_SEQUENCES.waveHelloWelcome.loopMode, 'none');
  assert.equal(SPRITE_SEQUENCES.waveHelloWelcome.loop, false);
  assert.deepEqual(
    SPRITE_SEQUENCES.waveHelloWelcome.frameIndices,
    [...WAVE_HELLO_PINGPONG_ONCE_INDICES]
  );
  // 正放末帧 19 → 倒放从 18 起，整段以 1 收束；长度 = 2*forward - 1
  assert.equal(
    WAVE_HELLO_PINGPONG_ONCE_INDICES.length,
    WAVE_HELLO_FORWARD_INDICES.length * 2 - 1
  );
  assert.equal(WAVE_HELLO_PINGPONG_ONCE_INDICES.at(-1), 1);
  assert.equal(
    WAVE_HELLO_PINGPONG_ONCE_INDICES[WAVE_HELLO_FORWARD_INDICES.length - 1],
    19
  );
});

test('earWiggleHeadTouch bakes forward+reverse once without player pingpong', () => {
  assert.equal(SPRITE_SEQUENCES.earWiggleHeadTouch.loopMode, 'none');
  assert.equal(SPRITE_SEQUENCES.earWiggleHeadTouch.loop, false);
  assert.deepEqual(
    SPRITE_SEQUENCES.earWiggleHeadTouch.frameIndices,
    [...EAR_WIGGLE_PINGPONG_ONCE_INDICES]
  );
  assert.equal(
    EAR_WIGGLE_PINGPONG_ONCE_INDICES.length,
    EAR_WIGGLE_FORWARD_INDICES.length * 2 - 1
  );
  assert.equal(EAR_WIGGLE_PINGPONG_ONCE_INDICES.at(-1), 1);
  assert.equal(EAR_WIGGLE_PINGPONG_ONCE_INDICES[53], 54);
});

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
    complete: false,
    cycleComplete: false
  });

  state = advanceSpriteFrame({
    ...state,
    frameCount: 2,
    loopMode: SPRITE_LOOP_MODES.NONE
  });
  assert.equal(state.complete, true);
  assert.equal(state.cycleComplete, true);
  assert.equal(state.frameIndex, 1);
});

test('pingpong reports cycleComplete after a full round-trip', () => {
  let state = { frameIndex: 0, direction: 1 };
  const frameCount = 3;
  let cycles = 0;
  for (let i = 0; i < 20; i += 1) {
    state = advanceSpriteFrame({
      ...state,
      frameCount,
      loopMode: SPRITE_LOOP_MODES.PINGPONG
    });
    if (state.cycleComplete) cycles += 1;
  }
  assert.equal(cycles >= 1, true);
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


test('stretchReminder uses stretch-reminder; wakeUp debug key removed', () => {
  assert.equal(SPRITE_SEQUENCES.stretchReminder.animation, 'stretch-reminder');
  assert.equal(SPRITE_SEQUENCES.stretchReminder.frameCount, 17);
  assert.equal(SPRITE_SEQUENCES.wakeUp, undefined);
  assert.equal(SPRITE_SEQUENCES.dormantWake.animation, 'cloak-sleep');
});

test('dormantWake plays cloak-sleep in reverse (34 → 001)', () => {
  const definition = SPRITE_SEQUENCES.dormantWake;
  const paths = buildFramePaths(definition.animation, definition.frameCount, {
    frameIndices: definition.frameIndices
  });

  assert.equal(paths.length, 34);
  assert.match(paths[0], /frame_034\.png$/);
  assert.match(paths[33], /frame_001\.png$/);
});

test('wave hello repeats peak sway once and has no peak frame hold', () => {
  const definition = SPRITE_SEQUENCES.waveHello;

  assert.equal(definition.frameCount, 19);
  assert.equal(definition.fps, 8);
  assert.ok(!definition.frameHolds);
  assert.deepEqual(definition.frameIndices?.slice(7, 17), [
    8, 9, 10, 11, 12, 8, 9, 10, 11, 12
  ]);
  assert.equal(definition.frameIndices?.length, 7 + 5 + 5 + 7);
});

test('dormant wake is cloak-sleep reverse one-shot that holds final pose', () => {
  const definition = SPRITE_SEQUENCES.dormantWake;

  assert.equal(definition.animation, 'cloak-sleep');
  assert.equal(definition.frameCount, 34);
  assert.equal(definition.fps, 6);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.holdLastFrame, true);
  assert.equal(definition.frameIndices[0], 34);
  assert.equal(definition.frameIndices[33], 1);
  assert.ok(definition.frameHolds[34] > 0);
});

test('milestone glow is an on-demand one-shot that holds its final pose', () => {
  const definition = SPRITE_SEQUENCES.milestoneGlow;

  assert.equal(definition.animation, 'milestone-glow');
  assert.equal(definition.frameCount, 27);
  assert.equal(definition.preload, false);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.holdLastFrame, true);
  assert.equal(definition.fps, 4);
});

test('milestoneGlowStar is meditation-star-reward ritual variant', () => {
  const definition = SPRITE_SEQUENCES.milestoneGlowStar;

  assert.equal(definition.animation, 'meditation-star-reward');
  assert.equal(definition.frameCount, 63);
  assert.equal(definition.preload, false);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.holdLastFrame, true);
  assert.equal(definition.fps, 6);
  assert.equal(definition.playbackZoom?.from, 1);
  assert.equal(definition.playbackZoom?.to, 16 / 11);
});

test('nod greeting is a slowed one-shot with last-frame hold (~2 extra beats)', () => {
  const definition = SPRITE_SEQUENCES.nodGreeting;

  assert.equal(definition.frameCount, 23);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.loop, false);
  assert.equal(definition.fps, 6);
  assert.equal(definition.holdLastFrame, false);
  assert.equal(definition.frameHolds[23], Math.round((1000 / 6) * 2));
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
  assert.equal(definition.fps, 3.5);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.loop, false);
  assert.equal(definition.holdLastFrame, false);
});

test('stretch reminder is a one-shot 17-frame sequence', () => {
  const definition = SPRITE_SEQUENCES.stretchReminder;

  assert.equal(definition.animation, 'stretch-reminder');
  assert.equal(definition.frameCount, 17);
  assert.equal(definition.fps, 4);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.NONE);
  assert.equal(definition.loop, false);
  assert.equal(definition.holdLastFrame, false);
});

test('sessionComplete sits in the light one-shot duration band', () => {
  const definition = SPRITE_SEQUENCES.sessionComplete;
  assert.equal(definition.frameCount, 28);
  assert.equal(definition.fps, 8);
});

test('celebrateDanceV2 is registered as celebrating alternate', () => {
  const definition = SPRITE_SEQUENCES.celebrateDanceV2;
  assert.equal(definition.animation, 'celebrate-dance-v2');
  assert.equal(definition.frameCount, 60);
  assert.equal(definition.loop, false);
  assert.equal(definition.loopMode, 'none');
});

test('palmsTogether / breathHaloHq / lotus backlog sequences are registered', () => {
  assert.equal(SPRITE_SEQUENCES.palmsTogether.animation, 'palms-together');
  assert.equal(SPRITE_SEQUENCES.palmsTogether.frameCount, 14);
  // 正放合掌 → 倒放回闭目坐禅第 1 帧，末帧可接 idle-breathing
  assert.equal(SPRITE_SEQUENCES.palmsTogether.frameIndices?.length, 27);
  assert.equal(SPRITE_SEQUENCES.palmsTogether.frameIndices?.[0], 1);
  assert.equal(SPRITE_SEQUENCES.palmsTogether.frameIndices?.at(-1), 1);
  assert.equal(SPRITE_SEQUENCES.palmsTogether.fps, 4);
  assert.equal(SPRITE_SEQUENCES.palmsTogether.holdLastFrame, true);
  assert.equal(SPRITE_SEQUENCES.palmsTogether.displayFit?.width, 960);
  assert.equal(SPRITE_SEQUENCES.palmsTogether.displayFit?.height, 960);
  assert.equal(SPRITE_SEQUENCES.breathHaloHq.animation, 'breath-halo-hq');
  assert.equal(SPRITE_SEQUENCES.breathHaloHq.frameCount, 16);
  assert.equal(SPRITE_SEQUENCES.breathHaloHq.preload, false);
  assert.equal(SPRITE_SEQUENCES.breathHaloHq.loop, true);
  assert.equal(SPRITE_SEQUENCES.breathHaloHq.loopMode, 'pingpong');
  assert.equal(SPRITE_SEQUENCES.breathHaloHq.frameHolds?.[16], 750);
  assert.equal(SPRITE_SEQUENCES.intentionNod.animation, 'nod-bow');
  assert.equal(SPRITE_SEQUENCES.intentionNod.frameCount, 13);
  assert.equal(SPRITE_SEQUENCES.intentionNod.loopMode, 'pingpong');
  assert.equal(SPRITE_SEQUENCES.lotusFrontRising.animation, 'lotus-front-rising');
  assert.equal(SPRITE_SEQUENCES.lotusFrontRising.frameCount, 7);
  assert.equal(SPRITE_SEQUENCES.lotusFrontRising.preload, false);
  assert.equal(SPRITE_SEQUENCES.lotusChestHalo.animation, 'lotus-chest-halo');
  assert.equal(SPRITE_SEQUENCES.lotusChestHalo.frameCount, 10);
  assert.equal(SPRITE_SEQUENCES.lotusChestHalo.preload, false);
});

test('2026-08-02 pingpong trial sequences are registered', () => {
  assert.equal(SPRITE_SEQUENCES.waveHelloPingpong.animation, 'wave-hello-pingpong');
  assert.equal(SPRITE_SEQUENCES.waveHelloPingpong.frameCount, 38);
  assert.equal(SPRITE_SEQUENCES.waveHelloPingpong.loop, false);
  assert.equal(SPRITE_SEQUENCES.waveHelloPingpong.loopMode, 'none');
  assert.equal(SPRITE_SEQUENCES.waveHelloPingpong.displayFit?.width, 960);
  assert.equal(SPRITE_SEQUENCES.waveHelloPingpong.displayFit?.scaleMul, 1.5);
  assert.equal(SPRITE_SEQUENCES.magicBookReading.animation, 'magic-book-reading');
  assert.equal(SPRITE_SEQUENCES.magicBookReading.frameCount, 46);
  assert.equal(SPRITE_SEQUENCES.magicBookReading.fps, 4);
  assert.equal(SPRITE_SEQUENCES.goldenHaloPalms.animation, 'golden-halo-palms');
  assert.equal(SPRITE_SEQUENCES.goldenHaloPalms.frameCount, 94);
  assert.equal(SPRITE_SEQUENCES.goldenHaloPalms.fps, 4);
});

test('gaze lookaround and yawn-stretch idle variants are registered', () => {
  assert.equal(SPRITE_SEQUENCES.gazeP1CenterBlinkLeft.frameCount, 15);
  assert.equal(SPRITE_SEQUENCES.gazeP2LeftToUp.frameCount, 13);
  assert.equal(SPRITE_SEQUENCES.gazeP3TowardRight.frameCount, 13);
  assert.equal(SPRITE_SEQUENCES.gazeP4RightToDown.frameCount, 25);
  assert.equal(SPRITE_SEQUENCES.yawnStretch.animation, 'yawn-stretch');
  assert.equal(SPRITE_SEQUENCES.yawnStretch.frameCount, 16);
  assert.equal(SPRITE_SEQUENCES.yawnStretch.loopMode, 'none');
});

test('cloakSleep is registered for DORMANT entry', () => {
  assert.equal(SPRITE_SEQUENCES.cloakSleep.animation, 'cloak-sleep');
  assert.equal(SPRITE_SEQUENCES.cloakSleep.frameCount, 34);
  assert.equal(SPRITE_SEQUENCES.cloakSleep.fps, 6);
  assert.equal(SPRITE_SEQUENCES.cloakSleep.loopMode, 'none');
  assert.equal(SPRITE_SEQUENCES.cloakSleep.holdLastFrame, true);
});

test('sleeping uses cloak-sleep tail 034→030 double-hold pingpong', () => {
  const definition = SPRITE_SEQUENCES.sleeping;
  assert.equal(definition.animation, 'cloak-sleep');
  assert.equal(definition.frameCount, 34);
  assert.equal(definition.fps, 2);
  assert.equal(definition.loopMode, SPRITE_LOOP_MODES.PINGPONG);
  assert.deepEqual(definition.frameIndices, [34, 34, 33, 33, 32, 32, 31, 31, 30, 30]);
  const paths = buildFramePaths(definition.animation, definition.frameCount, {
    frameIndices: definition.frameIndices
  });
  assert.match(paths[0], /cloak-sleep\/frame_034\.png$/);
  assert.match(paths.at(-1), /cloak-sleep\/frame_030\.png$/);
});

test('product sleep/wake stay on cloak-sleep keys; starlight sequences registered', () => {
  assert.equal(SPRITE_SEQUENCES.cloakSleep.animation, 'cloak-sleep');
  assert.equal(SPRITE_SEQUENCES.dormantWake.animation, 'cloak-sleep');
  assert.equal(SPRITE_SEQUENCES.sleeping.animation, 'cloak-sleep');
  assert.equal(SPRITE_SEQUENCES.sleeping.sleepBreath, true);
  assert.equal(SPRITE_SEQUENCES.starlightCloakSleep.animation, 'starlight-cloak-sleep');
  assert.equal(SPRITE_SEQUENCES.starlightCloakSleep.frameCount, 67);
  assert.equal(SPRITE_SEQUENCES.starlightSleeping.animation, 'starlight-cloak-sleep');
  assert.equal(SPRITE_SEQUENCES.starlightSleeping.sleepBreath, true);
  assert.deepEqual(SPRITE_SEQUENCES.starlightSleeping.frameIndices, [
    67, 67, 66, 66, 65, 65, 64, 64, 63, 63, 62, 62, 61, 61, 60, 60, 59, 59, 58, 58
  ]);
  assert.equal(SPRITE_SEQUENCES.starlightDormantWake.animation, 'starlight-cloak-wake');
  assert.equal(SPRITE_SEQUENCES.starlightDormantWake.frameCount, 67);
});

test('shouldApplySleepBreath follows sleepBreath flag', () => {
  assert.equal(shouldApplySleepBreath('starlightSleeping', { sleepBreath: true }), true);
  assert.equal(shouldApplySleepBreath('sleeping', { sleepBreath: true }), true);
  assert.equal(shouldApplySleepBreath('cloakSleep', {}), false);
  assert.equal(SLEEP_BREATH_CLASS, 'ft-sleep-breathing');
});

test('teaDrinking, bookReading, parrotEarVisit, earWiggleHeadTouch, riseStretchCasual, blinkBreathe are registered', () => {
  assert.equal(SPRITE_SEQUENCES.teaDrinking.animation, 'tea-drinking');
  assert.equal(SPRITE_SEQUENCES.teaDrinking.frameCount, 24);
  assert.equal(SPRITE_SEQUENCES.teaDrinking.fps, 8);
  assert.equal(SPRITE_SEQUENCES.teaDrinking.loopMode, 'none');
  assert.equal(SPRITE_SEQUENCES.bookReading.animation, 'book-reading');
  assert.equal(SPRITE_SEQUENCES.bookReading.frameCount, 24);
  assert.equal(SPRITE_SEQUENCES.bookReading.fps, 8);
  assert.equal(SPRITE_SEQUENCES.bookReading.loopMode, 'none');
  assert.equal(SPRITE_SEQUENCES.parrotEarVisit.animation, 'parrot-ear-visit-feather');
  assert.equal(SPRITE_SEQUENCES.parrotEarVisit.frameCount, 93);
  assert.equal(SPRITE_SEQUENCES.parrotEarVisit.fps, 8);
  assert.equal(SPRITE_SEQUENCES.parrotEarVisit.loopMode, 'none');
  assert.equal(SPRITE_SEQUENCES.parrotEarVisit.preload, false);
  assert.equal(SPRITE_SEQUENCES.earWiggleHeadTouch.animation, 'ear-wiggle-head-touch');
  assert.equal(SPRITE_SEQUENCES.earWiggleHeadTouch.frameCount, 54);
  assert.equal(SPRITE_SEQUENCES.earWiggleHeadTouch.fps, 10);
  assert.equal(SPRITE_SEQUENCES.earWiggleHeadTouch.loopMode, 'none');
  assert.equal(SPRITE_SEQUENCES.riseStretchCasual.animation, 'rise-stretch-casual');
  assert.equal(SPRITE_SEQUENCES.riseStretchCasual.frameCount, 39);
  assert.equal(SPRITE_SEQUENCES.riseStretchCasual.fps, 8);
  assert.equal(SPRITE_SEQUENCES.riseStretchCasual.loop, false);
  assert.equal(SPRITE_SEQUENCES.riseStretchCasual.loopMode, 'none');
  assert.equal(SPRITE_SEQUENCES.riseStretchCasual.frameHolds?.[39], 250);
  assert.equal(SPRITE_SEQUENCES.blinkBreathe.animation, 'blink-breathe');
  assert.equal(SPRITE_SEQUENCES.blinkBreathe.frameCount, 13);
  assert.equal(SPRITE_SEQUENCES.blinkBreathe.fps, 8);
  assert.equal(SPRITE_SEQUENCES.blinkBreathe.loop, true);
  assert.equal(SPRITE_SEQUENCES.blinkBreathe.loopMode, 'pingpong');
  assert.equal(SPRITE_SEQUENCES.blinkBreathe.frameHolds?.[13], 250);
});
