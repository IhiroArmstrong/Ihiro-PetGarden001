/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SESSION_CUE_PREF_STORAGE_KEY,
  SESSION_INTERVAL_MS_OFF,
  SESSION_INTERVAL_MS_3MIN,
  SESSION_INTERVAL_MS_5MIN,
  defaultSessionCuePref,
  normalizeSessionCuePref,
  readSessionCuePref,
  writeSessionCuePrefEnabled,
  writeSessionIntervalMs,
  writeFocusAwarenessCardEnabled,
  isSessionCueMasterEnabled,
  isSessionIntervalEnabled
} from './sessionCuePreference.js';
import {
  SessionCueController,
  SESSION_CUE_DUCK_RATIO,
  SESSION_CUE_DEFAULT_VOLUME,
  SESSION_CUE_RELATIVE_GAIN,
  SESSION_START_BELL_SRC,
  SESSION_INTERVAL_BELL_SRC,
  SESSION_END_CHIME_SRC
} from './SessionCueController.js';
import { AMBIENT_DEFAULT_VOLUME } from './AmbientSoundscapeController.js';

function createMapStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
}

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
    removeEventListener(type, fn) {
      const list = listeners.get(type) || [];
      listeners.set(
        type,
        list.filter((x) => x !== fn)
      );
    },
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
    },
    load() {},
    getAttribute(name) {
      if (name === 'src') return this.src;
      return null;
    },
    setAttribute() {}
  };
}

test('default pref: start/end on, interval off, awareness on', () => {
  assert.deepEqual(defaultSessionCuePref(), {
    sessionStartBellEnabled: true,
    sessionEndBellEnabled: true,
    sessionIntervalMs: SESSION_INTERVAL_MS_OFF,
    focusAwarenessCardEnabled: true
  });
  assert.equal(SESSION_CUE_PREF_STORAGE_KEY, 'focus-tiger.session-cues.v1');
});

test('normalize syncs start/end only; migrates old interval boolean', () => {
  assert.deepEqual(
    normalizeSessionCuePref({
      sessionStartBellEnabled: true,
      sessionEndBellEnabled: false
    }),
    {
      sessionStartBellEnabled: false,
      sessionEndBellEnabled: false,
      sessionIntervalMs: 0,
      focusAwarenessCardEnabled: true
    }
  );
  assert.deepEqual(
    normalizeSessionCuePref({
      sessionStartBellEnabled: true,
      sessionEndBellEnabled: true,
      sessionIntervalBellEnabled: true
    }),
    {
      sessionStartBellEnabled: true,
      sessionEndBellEnabled: true,
      sessionIntervalMs: SESSION_INTERVAL_MS_3MIN,
      focusAwarenessCardEnabled: true
    }
  );
  assert.deepEqual(
    normalizeSessionCuePref({
      sessionStartBellEnabled: true,
      sessionEndBellEnabled: true,
      sessionIntervalMs: SESSION_INTERVAL_MS_5MIN,
      focusAwarenessCardEnabled: false
    }),
    {
      sessionStartBellEnabled: true,
      sessionEndBellEnabled: true,
      sessionIntervalMs: SESSION_INTERVAL_MS_5MIN,
      focusAwarenessCardEnabled: false
    }
  );
});

test('master toggle preserves interval and awareness', () => {
  const storage = createMapStorage();
  writeSessionIntervalMs(storage, SESSION_INTERVAL_MS_3MIN);
  writeFocusAwarenessCardEnabled(storage, false);
  writeSessionCuePrefEnabled(storage, false);
  let pref = readSessionCuePref(storage);
  assert.equal(isSessionCueMasterEnabled(pref), false);
  assert.equal(pref.sessionIntervalMs, SESSION_INTERVAL_MS_3MIN);
  assert.equal(pref.focusAwarenessCardEnabled, false);
  writeSessionCuePrefEnabled(storage, true);
  pref = readSessionCuePref(storage);
  assert.equal(isSessionCueMasterEnabled(pref), true);
  assert.equal(pref.sessionIntervalMs, SESSION_INTERVAL_MS_3MIN);
  assert.equal(isSessionIntervalEnabled(pref), true);
});

test('SessionCueController playStart ducks ambient then unducks on ended', async () => {
  const cues = new SessionCueController({
    storage: createMapStorage(),
    startAudio: createMockAudio(),
    intervalAudio: createMockAudio(),
    endAudio: createMockAudio(),
    mountToDocument: false
  });
  const ducks = [];
  const unducks = [];
  const ambient = {
    isAudiblePlaying: () => true,
    duckTo: (ratio) => ducks.push(ratio),
    unduck: (opts) => unducks.push(opts)
  };
  assert.equal(cues.playStart({ ambient }), true);
  assert.deepEqual(ducks, [SESSION_CUE_DUCK_RATIO]);
  cues._start.dispatch('ended');
  assert.equal(unducks.length, 1);
});

test('tickInterval respects off / 3min / 5min', () => {
  const cues = new SessionCueController({
    storage: createMapStorage(),
    startAudio: createMockAudio(),
    intervalAudio: createMockAudio(),
    endAudio: createMockAudio(),
    mountToDocument: false
  });
  let played = 0;
  cues.startIntervalSession();
  assert.equal(
    cues.tickInterval({
      elapsedSeconds: 180,
      targetSeconds: 600,
      onIntervalPlayed: () => played++
    }).action,
    'disabled'
  );
  cues.setIntervalMs(SESSION_INTERVAL_MS_3MIN);
  assert.equal(
    cues.tickInterval({
      elapsedSeconds: 180,
      targetSeconds: 600,
      onIntervalPlayed: () => played++
    }).action,
    'play'
  );
  assert.equal(played, 1);

  const five = new SessionCueController({
    storage: createMapStorage(),
    startAudio: createMockAudio(),
    intervalAudio: createMockAudio(),
    endAudio: createMockAudio(),
    mountToDocument: false
  });
  five.setIntervalMs(SESSION_INTERVAL_MS_5MIN);
  five.startIntervalSession();
  assert.equal(
    five.tickInterval({
      elapsedSeconds: 180,
      targetSeconds: 900,
      onIntervalPlayed: () => played++
    }).action,
    'wait'
  );
  assert.equal(
    five.tickInterval({
      elapsedSeconds: 300,
      targetSeconds: 900,
      onIntervalPlayed: () => played++
    }).action,
    'play'
  );
  assert.equal(played, 2);
});

test('stopIntervalSession cancels further ticks', () => {
  const cues = new SessionCueController({
    storage: createMapStorage(),
    startAudio: createMockAudio(),
    intervalAudio: createMockAudio(),
    endAudio: createMockAudio(),
    mountToDocument: false
  });
  cues.setIntervalMs(SESSION_INTERVAL_MS_3MIN);
  cues.startIntervalSession();
  cues.stopIntervalSession();
  assert.equal(
    cues.tickInterval({
      elapsedSeconds: 180,
      targetSeconds: 600
    }).action,
    'inactive'
  );
});

test('SessionCueController cue src paths are under /audio/cues/', () => {
  assert.equal(SESSION_START_BELL_SRC, '/audio/cues/session-start-bell.mp3');
  assert.equal(
    SESSION_INTERVAL_BELL_SRC,
    '/audio/cues/session-interval-bell.mp3'
  );
  assert.equal(SESSION_END_CHIME_SRC, '/audio/cues/session-end-chime.mp3');
});

test('sitting bells play at half the Soundscape slider (perceived peak)', () => {
  assert.equal(SESSION_CUE_RELATIVE_GAIN, 0.5);
});

test('sitting bells share the Soundscape default volume (not HTMLAudio 1.0)', () => {
  assert.equal(SESSION_CUE_DEFAULT_VOLUME, AMBIENT_DEFAULT_VOLUME);
  const startAudio = createMockAudio();
  startAudio.volume = 1;
  const cues = new SessionCueController({
    storage: createMapStorage(),
    startAudio,
    intervalAudio: createMockAudio(),
    endAudio: createMockAudio(),
    mountToDocument: false
  });
  assert.equal(cues.getVolume(), SESSION_CUE_DEFAULT_VOLUME);
  assert.equal(
    startAudio.volume,
    SESSION_CUE_DEFAULT_VOLUME * SESSION_CUE_RELATIVE_GAIN
  );
  const ambient = {
    getVolume: () => 0.2,
    isAudiblePlaying: () => false
  };
  assert.equal(cues.playStart({ ambient }), true);
  assert.equal(startAudio.volume, 0.2 * SESSION_CUE_RELATIVE_GAIN);
  cues.setVolume(0.35);
  assert.equal(startAudio.volume, 0.35 * SESSION_CUE_RELATIVE_GAIN);
  assert.equal(cues.getVolume(), 0.35);
});
