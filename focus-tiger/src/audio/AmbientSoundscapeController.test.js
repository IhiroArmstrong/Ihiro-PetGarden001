/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AmbientSoundscapeController,
  AMBIENT_TRACKS,
  computePresenceBoost,
  AUDIO_FOCUS_EQUIV_RATIO,
  MAX_PRESENCE_BOOST,
  AMBIENT_TRACK_SINGING_BOWL,
  AMBIENT_TRACK_DIVINE_LIFE_SOCIETY,
  AMBIENT_TRACK_LORD_OF_THE_DAWN,
  AMBIENT_TRACK_MAESTRO_TLAKAELEL,
  AMBIENT_TRACK_THE_INNER_SOUND,
  AMBIENT_TRACK_SOMNIA_VARIATION_3,
  AMBIENT_TRACK_SOMNIA_VARIATION_10,
  AMBIENT_TRACK_RAIN,
  AMBIENT_TRACK_OFF,
  AMBIENT_PREF_STORAGE_KEY,
  DEFAULT_AMBIENT_TRACK_ID,
  normalizeAmbientPref,
  resolveAmbientPanelSelectedTrackId,
  shouldStartPreferredFromNoteClick
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

function createMapStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
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

test('AMBIENT_TRACKS places Jesse/Reed meditation set immediately after Mer-Ka-Ba', () => {
  assert.deepEqual(
    AMBIENT_TRACKS.map((t) => t.id).slice(0, 8),
    [
      AMBIENT_TRACK_SINGING_BOWL,
      AMBIENT_TRACK_DIVINE_LIFE_SOCIETY,
      AMBIENT_TRACK_LORD_OF_THE_DAWN,
      AMBIENT_TRACK_MAESTRO_TLAKAELEL,
      AMBIENT_TRACK_THE_INNER_SOUND,
      AMBIENT_TRACK_SOMNIA_VARIATION_3,
      AMBIENT_TRACK_SOMNIA_VARIATION_10,
      AMBIENT_TRACK_RAIN
    ]
  );
  assert.equal(AMBIENT_TRACKS.length, 12);
});

test('normalizeAmbientPref defaults to Mer-Ka-Ba track off (opt-in)', () => {
  assert.deepEqual(normalizeAmbientPref(null), {
    enabled: false,
    trackId: DEFAULT_AMBIENT_TRACK_ID
  });
  assert.equal(DEFAULT_AMBIENT_TRACK_ID, AMBIENT_TRACK_SINGING_BOWL);
  assert.deepEqual(normalizeAmbientPref({ enabled: true, trackId: AMBIENT_TRACK_SINGING_BOWL }), {
    enabled: true,
    trackId: AMBIENT_TRACK_SINGING_BOWL
  });
});

test('resolveAmbientPanelSelectedTrackId highlights Off when silent (cold / after mute)', async () => {
  const audio = createMockAudio();
  const cold = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  // Default pref remembers Mer-Ka-Ba but panel must not imply it is active.
  assert.equal(cold.getPreferredTrackId(), DEFAULT_AMBIENT_TRACK_ID);
  assert.equal(cold.wantsEnabled(), false);
  assert.equal(resolveAmbientPanelSelectedTrackId(cold), AMBIENT_TRACK_OFF);

  await cold.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  assert.equal(
    resolveAmbientPanelSelectedTrackId(cold),
    AMBIENT_TRACK_SINGING_BOWL
  );
  cold.mute();
  assert.equal(cold.getTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(cold.wantsEnabled(), false);
  // After user-picked mute: still highlight preferred (memory), not Off.
  assert.equal(
    resolveAmbientPanelSelectedTrackId(cold),
    AMBIENT_TRACK_SINGING_BOWL
  );
  assert.equal(cold.getPreferredTrackId(), AMBIENT_TRACK_SINGING_BOWL);
});

test('resolveAmbientPanelSelectedTrackId after Rise keeps preferred highlight', async () => {
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  ctrl.startSession();
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  ctrl.endSession();
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(ctrl.wantsEnabled(), false);
  assert.equal(ctrl.hasRememberedPanelTrack(), true);
  assert.equal(
    resolveAmbientPanelSelectedTrackId(ctrl),
    AMBIENT_TRACK_SINGING_BOWL
  );
});

test('shouldStartPreferredFromNoteClick after Rise (remembered, no resume flag)', async () => {
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  assert.equal(shouldStartPreferredFromNoteClick(ctrl), false);
  ctrl.startSession();
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  ctrl.endSession();
  assert.equal(ctrl.willResumePreferredOnOpen(), false);
  assert.equal(shouldStartPreferredFromNoteClick(ctrl), true);
  await ctrl.unmute();
  assert.equal(ctrl.isAudiblePlaying(), true);
  assert.equal(shouldStartPreferredFromNoteClick(ctrl), false);
});

test('shouldStartPreferredFromNoteClick after note-mute (resume flag)', async () => {
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  ctrl.mute();
  assert.equal(ctrl.willResumePreferredOnOpen(), true);
  assert.equal(shouldStartPreferredFromNoteClick(ctrl), true);
});

test('note-mute preserves currentTime; unmute seeks resume (not restart)', async () => {
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  audio.currentTime = 42.5;
  ctrl.mute();
  assert.equal(audio.currentTime, 42.5);
  assert.ok(Boolean(audio.src));
  assert.equal(ctrl.isAudiblePlaying(), false);
  await ctrl.unmute();
  assert.equal(ctrl.isAudiblePlaying(), true);
  assert.equal(audio.currentTime, 42.5);
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_SINGING_BOWL);
});

test('resolveAmbientPanelSelectedTrackId keeps preferred while wantsEnabled (gesture unlock)', async () => {
  const audio = createMockAudio();
  audio.play = async () => {
    throw new Error('autoplay blocked');
  };
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  assert.equal(ctrl.wantsEnabled(), true);
  assert.equal(ctrl.needsGestureUnlock(), true);
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_SINGING_BOWL);
  assert.equal(
    resolveAmbientPanelSelectedTrackId(ctrl),
    AMBIENT_TRACK_SINGING_BOWL
  );
});

test('setTrack(off) remembers Off as preferred (distinct from mute)', async () => {
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  await ctrl.setTrack(AMBIENT_TRACK_OFF);
  assert.equal(ctrl.getPreferredTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(resolveAmbientPanelSelectedTrackId(ctrl), AMBIENT_TRACK_OFF);
});

test('note-mute sets resume-on-open; boot mute does not', async () => {
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  await ctrl.startPreferredTrack();
  assert.equal(ctrl.willResumePreferredOnOpen(), false);

  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  assert.equal(ctrl.isAudiblePlaying(), true);
  ctrl.mute();
  assert.equal(ctrl.willResumePreferredOnOpen(), true);
  assert.equal(ctrl.consumeResumePreferredOnOpen(), true);
  assert.equal(ctrl.willResumePreferredOnOpen(), false);
});

test('played seconds accumulate only while audible and session active', async () => {
  let now = 1_000_000;
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    now: () => now,
    audio,
    storage: createMapStorage(),
    mountToDocument: false
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

test('presenceBoost stays zero outside session; endSession stops playback', async () => {
  let now = 0;
  const storage = createMapStorage();
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    now: () => now,
    audio,
    storage,
    mountToDocument: false
  });
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  now += 60_000;
  assert.equal(ctrl.getPresenceBoost(25), 0);

  ctrl.startSession();
  now += 60_000;
  audio.dispatch('timeupdate');
  const boost = ctrl.getPresenceBoost(25);
  assert.ok(boost > 0);
  assert.ok(boost <= MAX_PRESENCE_BOOST + 0.1);

  ctrl.endSession();
  assert.equal(ctrl.isAudiblePlaying(), false);
  assert.equal(ctrl.wantsEnabled(), false);
  assert.equal(ctrl.getPresenceBoost(25), 0);
  assert.equal(ctrl.getPlayedSeconds(), 0);
  // Stored preference stays on so user can tap music again later
  const stored = JSON.parse(storage.getItem('focus-tiger.ambient-pref.v1'));
  assert.equal(stored.enabled, true);
  assert.equal(stored.trackId, AMBIENT_TRACK_SINGING_BOWL);

  ctrl.startSession();
  // Sit must not auto-resume — still quiet until explicit unmute
  assert.equal(ctrl.wantsEnabled(), false);
  assert.equal(ctrl.isAudiblePlaying(), false);
});

test('audible playing adds an immediate glow lift', async () => {
  const { AUDIBLE_PLAYING_LIFT } = await import('./AmbientSoundscapeController.js');
  let now = 0;
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    now: () => now,
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  ctrl.startSession();
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  // almost no played time yet — lift alone should still brighten rim
  const boost = ctrl.getPresenceBoost(25);
  assert.ok(boost >= AUDIBLE_PLAYING_LIFT - 1e-9);
  audio.pause();
  assert.ok(ctrl.getPresenceBoost(25) < AUDIBLE_PLAYING_LIFT);
});

test('toggleEnabled persists preference and stops or starts Mer-Ka-Ba', async () => {
  const storage = createMapStorage();
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({ audio, storage, mountToDocument: false });
  await ctrl.startPreferredTrack();
  // Boot never autoplays — prefer stays off until explicit unmute
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(ctrl.wantsEnabled(), false);

  await ctrl.toggleEnabled();
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_SINGING_BOWL);
  assert.equal(ctrl.wantsEnabled(), true);
  const onRaw = JSON.parse(storage.getItem(AMBIENT_PREF_STORAGE_KEY));
  assert.equal(onRaw.enabled, true);

  await ctrl.toggleEnabled();
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(ctrl.wantsEnabled(), false);
  const offRaw = JSON.parse(storage.getItem(AMBIENT_PREF_STORAGE_KEY));
  assert.equal(offRaw.enabled, false);
});

test('startPreferredTrack never autoplays even if storage says enabled', async () => {
  const storage = createMapStorage({
    [AMBIENT_PREF_STORAGE_KEY]: JSON.stringify({
      enabled: true,
      trackId: AMBIENT_TRACK_SINGING_BOWL
    })
  });
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({ audio, storage, mountToDocument: false });
  assert.equal(ctrl.wantsEnabled(), true); // constructor still reads storage
  await ctrl.startPreferredTrack();
  assert.equal(ctrl.wantsEnabled(), false);
  assert.equal(ctrl.isAudiblePlaying(), false);
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
  // Migrate old default-on → persisted off
  const stored = JSON.parse(storage.getItem(AMBIENT_PREF_STORAGE_KEY));
  assert.equal(stored.enabled, false);
  assert.equal(stored.trackId, AMBIENT_TRACK_SINGING_BOWL);
});

test('startPreferredTrack respects stored mute preference', async () => {
  const storage = createMapStorage({
    [AMBIENT_PREF_STORAGE_KEY]: JSON.stringify({
      enabled: false,
      trackId: AMBIENT_TRACK_SINGING_BOWL
    })
  });
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({ audio, storage, mountToDocument: false });
  await ctrl.startPreferredTrack();
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(ctrl.wantsEnabled(), false);
});

test('toggle off wins race when play() resolves after stop', async () => {
  /** @type {(() => void) | null} */
  let releasePlay = null;
  const audio = createMockAudio();
  audio.play = () =>
    new Promise((resolve) => {
      releasePlay = () => {
        audio.paused = false;
        audio.dispatch('play');
        audio.dispatch('playing');
        resolve(undefined);
      };
    });

  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });

  const start = ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL, { persist: false });
  await ctrl.toggleEnabled();
  assert.equal(ctrl.wantsEnabled(), false);
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(audio.paused, true);

  releasePlay?.();
  await start;
  assert.equal(audio.paused, true);
  assert.equal(ctrl.isAudiblePlaying(), false);
});

test('toggleFromUi mutes even when wantsEnabled already false but still audible', async () => {
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  ctrl._wantEnabled = false;
  assert.equal(ctrl.isAudiblePlaying(), true);

  await ctrl.toggleFromUi();
  assert.equal(ctrl.isAudiblePlaying(), false);
  assert.equal(ctrl.wantsEnabled(), false);
});

test('volume is initialized before DOM audio element is created', () => {
  const prevDoc = globalThis.document;
  globalThis.document = {
    createElement: () => createMockAudio(),
    body: { appendChild() {} }
  };
  let volumeAtCreate;
  const proto = AmbientSoundscapeController.prototype;
  const original = proto._createAudioElement;
  proto._createAudioElement = function (mountToDocument) {
    volumeAtCreate = this._volume;
    return createMockAudio();
  };
  try {
    new AmbientSoundscapeController({
      storage: createMapStorage(),
      mountToDocument: false
    });
    assert.equal(volumeAtCreate, 0.45);
  } finally {
    proto._createAudioElement = original;
    globalThis.document = prevDoc;
  }
});

test('stopPlaybackEphemeral keeps preferred track and ambient-pref storage', async () => {
  const audio = createMockAudio();
  const storage = createMapStorage();
  storage.setItem(
    'focus-tiger.ambient-pref.v1',
    JSON.stringify({ enabled: false, trackId: AMBIENT_TRACK_RAIN })
  );
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage,
    mountToDocument: false
  });
  assert.equal(ctrl.getPreferredTrackId(), AMBIENT_TRACK_RAIN);
  assert.equal(ctrl.wantsEnabled(), false);
  const prefBefore = storage.getItem('focus-tiger.ambient-pref.v1');

  await ctrl.playTrackEphemeral(DEFAULT_AMBIENT_TRACK_ID);
  assert.equal(ctrl.isAudiblePlaying(), true);
  // Ephemeral play must not rewrite preferred / storage
  assert.equal(ctrl.getPreferredTrackId(), AMBIENT_TRACK_RAIN);
  assert.equal(storage.getItem('focus-tiger.ambient-pref.v1'), prefBefore);

  const playedBeforeStop = ctrl.getPlayedSeconds();
  ctrl.stopPlaybackEphemeral();
  assert.equal(ctrl.isAudiblePlaying(), false);
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(ctrl.getPreferredTrackId(), AMBIENT_TRACK_RAIN);
  assert.equal(ctrl.wantsEnabled(), false);
  assert.equal(storage.getItem('focus-tiger.ambient-pref.v1'), prefBefore);
  // Must not touch Focus presence session accounting
  assert.equal(ctrl.getPlayedSeconds(), playedBeforeStop);
});

test('stopPlaybackEphemeral does not require or clear startSession presence', async () => {
  const { AUDIBLE_PLAYING_LIFT } = await import('./AmbientSoundscapeController.js');
  const audio = createMockAudio();
  const storage = createMapStorage();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage,
    mountToDocument: false
  });
  ctrl.startSession();
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  const boostWhileFocus = ctrl.getPresenceBoost(25);
  assert.ok(boostWhileFocus > 0);

  // Parallel ephemeral stop path (as MicroRitual would) must not endSession
  ctrl.stopPlaybackEphemeral();
  assert.equal(ctrl.isAudiblePlaying(), false);
  // Session still active — no audible lift while silent (tiny cumulative from
  // wall-clock between setTrack→stop is OK; CI saw ~1ms → 1.3e-7 ≠ strict 0)
  assert.ok(ctrl.getPresenceBoost(25) < AUDIBLE_PLAYING_LIFT);
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  assert.ok(ctrl.getPresenceBoost(25) > 0);
  ctrl.endSession();
});

test('duckTo scales live volume without changing getVolume()', async () => {
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false
  });
  ctrl.setVolume(0.8);
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  assert.equal(ctrl.getVolume(), 0.8);
  ctrl.duckTo(0.35, { fadeMs: 0 });
  assert.equal(ctrl.getVolume(), 0.8);
  assert.ok(Math.abs(audio.volume - 0.8 * 0.35) < 1e-9);
  assert.equal(ctrl.getDuckRatio(), 0.35);
  ctrl.cancelDuck();
  assert.equal(ctrl.getDuckRatio(), 1);
  assert.ok(Math.abs(audio.volume - 0.8) < 1e-9);
});

test('fadeOutAndStop reaches silent endSession without restoring full volume', async () => {
  const timers = [];
  const schedule = (fn, ms) => {
    const id = timers.length + 1;
    timers.push({ id, fn, ms });
    return id;
  };
  const cancelSchedule = (id) => {
    const i = timers.findIndex((t) => t.id === id);
    if (i >= 0) timers.splice(i, 1);
  };
  const flush = () => {
    while (timers.length) {
      const next = timers.shift();
      next.fn();
    }
  };
  const audio = createMockAudio();
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage: createMapStorage(),
    mountToDocument: false,
    schedule,
    cancelSchedule
  });
  ctrl.setVolume(0.5);
  await ctrl.setTrack(AMBIENT_TRACK_SINGING_BOWL);
  ctrl.duckTo(0.35, { fadeMs: 0 });
  const p = ctrl.fadeOutAndStop({ fadeMs: 80 });
  flush();
  await p;
  assert.equal(ctrl.isAudiblePlaying(), false);
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
  assert.equal(ctrl.getDuckRatio(), 1);
});

test('startSittingMusic plays default when preferred is Off without persisting enabled', async () => {
  const audio = createMockAudio();
  const storage = createMapStorage();
  storage.setItem(
    AMBIENT_PREF_STORAGE_KEY,
    JSON.stringify({ enabled: false, trackId: AMBIENT_TRACK_OFF })
  );
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage,
    mountToDocument: false
  });
  const prefBefore = storage.getItem(AMBIENT_PREF_STORAGE_KEY);
  ctrl.startSession();
  await ctrl.startSittingMusic();
  assert.equal(ctrl.isAudiblePlaying(), true);
  assert.equal(ctrl.getTrackId(), DEFAULT_AMBIENT_TRACK_ID);
  assert.equal(storage.getItem(AMBIENT_PREF_STORAGE_KEY), prefBefore);
});
