import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SESSION_CUE_PREF_STORAGE_KEY,
  defaultSessionCuePref,
  normalizeSessionCuePref,
  readSessionCuePref,
  writeSessionCuePrefEnabled,
  isSessionCueMasterEnabled
} from './sessionCuePreference.js';
import {
  SessionCueController,
  SESSION_CUE_DUCK_RATIO,
  SESSION_START_BELL_SRC,
  SESSION_END_CHIME_SRC
} from './SessionCueController.js';

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

test('default session cue pref is both-on', () => {
  assert.deepEqual(defaultSessionCuePref(), {
    sessionStartBellEnabled: true,
    sessionEndBellEnabled: true
  });
  assert.equal(SESSION_CUE_PREF_STORAGE_KEY, 'focus-tiger.session-cues.v1');
});

test('normalizeSessionCuePref syncs divergent fields with AND', () => {
  assert.deepEqual(
    normalizeSessionCuePref({
      sessionStartBellEnabled: true,
      sessionEndBellEnabled: false
    }),
    {
      sessionStartBellEnabled: false,
      sessionEndBellEnabled: false
    }
  );
  assert.deepEqual(
    normalizeSessionCuePref({
      sessionStartBellEnabled: true,
      sessionEndBellEnabled: true
    }),
    {
      sessionStartBellEnabled: true,
      sessionEndBellEnabled: true
    }
  );
});

test('writeSessionCuePrefEnabled keeps both fields in sync', () => {
  const storage = createMapStorage();
  writeSessionCuePrefEnabled(storage, false);
  const pref = readSessionCuePref(storage);
  assert.equal(isSessionCueMasterEnabled(pref), false);
  assert.equal(pref.sessionStartBellEnabled, false);
  assert.equal(pref.sessionEndBellEnabled, false);
  writeSessionCuePrefEnabled(storage, true);
  assert.equal(isSessionCueMasterEnabled(readSessionCuePref(storage)), true);
});

test('SessionCueController playStart ducks ambient then unducks on ended', async () => {
  const startAudio = createMockAudio();
  const endAudio = createMockAudio();
  const storage = createMapStorage();
  const cues = new SessionCueController({
    storage,
    startAudio,
    endAudio,
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
  assert.equal(startAudio.paused, false);
  startAudio.dispatch('ended');
  assert.equal(unducks.length, 1);
  assert.equal(unducks[0].fadeMs, 1500);
});

test('SessionCueController respects master off for start and end', () => {
  const startAudio = createMockAudio();
  const endAudio = createMockAudio();
  const storage = createMapStorage();
  const cues = new SessionCueController({
    storage,
    startAudio,
    endAudio,
    mountToDocument: false
  });
  cues.setEnabled(false);
  let endCb = 0;
  assert.equal(cues.playStart({ ambient: null }), false);
  assert.equal(cues.playEnd({ onCueEnded: () => endCb++ }), false);
  assert.equal(endCb, 0);
  assert.equal(startAudio.paused, true);
  assert.equal(endAudio.paused, true);
});

test('SessionCueController cue src paths are under /audio/cues/', () => {
  assert.equal(SESSION_START_BELL_SRC, '/audio/cues/session-start-bell.mp3');
  assert.equal(SESSION_END_CHIME_SRC, '/audio/cues/session-end-chime.mp3');
});
