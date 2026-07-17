import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AmbientSoundscapeController,
  computePresenceBoost,
  AUDIO_FOCUS_EQUIV_RATIO,
  MAX_PRESENCE_BOOST,
  AMBIENT_TRACK_SINGING_BOWL,
  AMBIENT_TRACK_OFF
} from './AmbientSoundscapeController.js';

function createMockAudio() {
  const listeners = new Map();
  return {
    loop: false,
    preload: '',
    volume: 1,
    muted: false,
    paused: true,
    src: '',
    currentTime: 0,
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener() {},
    dispatch(type) {
      for (const fn of listeners.get(type) || []) fn();
    },
    async play() {
      this.paused = false;
      this.dispatch('play');
      this.dispatch('playing');
    },
    pause() {
      this.paused = true;
      this.dispatch('pause');
    },
    load() {},
    removeAttribute(name) {
      if (name === 'src') this.src = '';
    }
  };
}

test('computePresenceBoost uses 12s-per-minute ratio and 0.20 cap', () => {
  assert.equal(AUDIO_FOCUS_EQUIV_RATIO, 12 / 60);
  assert.equal(MAX_PRESENCE_BOOST, 0.2);
  // 5 min audio @ 25 min target → 300 * 0.2 / 1500 = 0.04
  assert.ok(Math.abs(computePresenceBoost(300, 25) - 0.04) < 1e-9);
  // full session continuous → capped at 0.20
  assert.equal(computePresenceBoost(25 * 60, 25), 0.2);
});

test('played seconds accumulate only while audible', async () => {
  let now = 1_000_000;
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    now: () => now,
    audio
  });
  ctrl.startSession();
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  now += 10_000; // 10s
  audio.dispatch('timeupdate');
  assert.ok(Math.abs(ctrl.getPlayedSeconds() - 10) < 1e-6);

  ctrl.setVolume(0);
  now += 20_000;
  audio.dispatch('timeupdate');
  assert.ok(Math.abs(ctrl.getPlayedSeconds() - 10) < 1e-6);

  ctrl.setVolume(0.5);
  now += 5_000;
  audio.dispatch('timeupdate');
  assert.ok(Math.abs(ctrl.getPlayedSeconds() - 15) < 1e-6);
});

test('presenceBoost stays zero outside session and does not replace focus math', async () => {
  let now = 0;
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({ now: () => now, audio });
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  now += 60_000;
  assert.equal(ctrl.getPresenceBoost(25), 0);

  ctrl.startSession();
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  now += 60_000;
  audio.dispatch('timeupdate');
  const boost = ctrl.getPresenceBoost(25);
  assert.ok(boost > 0);
  assert.ok(boost <= MAX_PRESENCE_BOOST);

  ctrl.endSession();
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(ctrl.getPresenceBoost(25), 0);
  assert.equal(ctrl.getPlayedSeconds(), 0);
});
