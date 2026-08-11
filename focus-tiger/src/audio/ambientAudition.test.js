import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AMBIENT_AUDITION_DEFAULT_MS,
  AMBIENT_AUDITION_MS_QUERY,
  parseAmbientAuditionMs,
  shouldOfferDeepAudition
} from './ambientAudition.js';
import {
  AMBIENT_TRACKS,
  AMBIENT_TRACK_LORD_OF_THE_DAWN,
  AMBIENT_TRACK_SINGING_BOWL,
  AmbientSoundscapeController
} from './AmbientSoundscapeController.js';
import { AMBIENT_PREF_STORAGE_KEY } from './AmbientSoundscapeController.js';
import {
  clearEntitlementCache,
  writeEntitlementCache
} from '../core/entitlement/entitlementState.js';

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

describe('ambientAudition helpers', () => {
  it('parses ambientAuditionMs query with clamp', () => {
    assert.equal(parseAmbientAuditionMs(''), AMBIENT_AUDITION_DEFAULT_MS);
    assert.equal(parseAmbientAuditionMs('?foo=1'), AMBIENT_AUDITION_DEFAULT_MS);
    assert.equal(
      parseAmbientAuditionMs(`?${AMBIENT_AUDITION_MS_QUERY}=400`),
      400
    );
    assert.equal(
      parseAmbientAuditionMs(`?${AMBIENT_AUDITION_MS_QUERY}=50`),
      200
    );
  });

  it('offers audition only for locked deep built-ins', () => {
    const storage = createMapStorage();
    clearEntitlementCache(storage);
    assert.equal(
      shouldOfferDeepAudition(AMBIENT_TRACK_LORD_OF_THE_DAWN, {
        storage,
        builtInTracks: AMBIENT_TRACKS
      }),
      true
    );
    assert.equal(
      shouldOfferDeepAudition(AMBIENT_TRACK_SINGING_BOWL, {
        storage,
        builtInTracks: AMBIENT_TRACKS
      }),
      false
    );
  });
});

describe('AmbientSoundscapeController deep audition', () => {
  it('plays locked deep for audition then stops without persisting preferred', async () => {
    const storage = createMapStorage();
    clearEntitlementCache(storage);
    /** @type {Array<{ fn: Function, ms: number, id: number }>} */
    const queue = [];
    let seq = 0;
    const schedule = (fn, ms) => {
      const id = ++seq;
      queue.push({ fn, ms, id });
      return id;
    };
    const cancelSchedule = (id) => {
      const i = queue.findIndex((q) => q.id === id);
      if (i >= 0) queue.splice(i, 1);
    };
    const flush = (ms) => {
      const due = queue.filter((q) => q.ms <= ms);
      for (const item of due) {
        const i = queue.indexOf(item);
        if (i >= 0) queue.splice(i, 1);
        item.fn();
      }
    };

    const audio = createMockAudio();
    const ctrl = new AmbientSoundscapeController({
      audio,
      storage,
      mountToDocument: false,
      auditionMs: 500,
      auditionFadeMs: 0,
      schedule,
      cancelSchedule
    });
    ctrl.startSession();

    let ended = null;
    const result = await ctrl.startDeepAudition(AMBIENT_TRACK_LORD_OF_THE_DAWN, {
      onEnded: (info) => {
        ended = info;
      }
    });
    assert.equal(result.started, true);
    assert.equal(ctrl.isDeepAuditionActive(), true);
    assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_LORD_OF_THE_DAWN);
    assert.equal(ctrl.isAudiblePlaying(), true);
    // Preferred must not sticky-lock to deep
    assert.equal(ctrl.getPreferredTrackId(), AMBIENT_TRACK_SINGING_BOWL);
    assert.equal(storage.getItem(AMBIENT_PREF_STORAGE_KEY), null);

    flush(500);
    await Promise.resolve();
    assert.equal(ctrl.isDeepAuditionActive(), false);
    assert.equal(ctrl.isAudiblePlaying(), false);
    assert.equal(ctrl.getTrackId(), 'off');
    assert.equal(ended?.reason, 'duration');
    assert.equal(storage.getItem(AMBIENT_PREF_STORAGE_KEY), null);
  });

  it('entitled deep plays without audition cut', async () => {
    const storage = createMapStorage();
    writeEntitlementCache(storage, {
      lifetime: { active: true },
      subscription: { active: false, periodEndsAt: null, lastVerifiedAt: null }
    });
    /** @type {Array<{ fn: Function, ms: number, id: number }>} */
    const queue = [];
    let seq = 0;
    const ctrl = new AmbientSoundscapeController({
      audio: createMockAudio(),
      storage,
      mountToDocument: false,
      auditionMs: 300,
      auditionFadeMs: 0,
      schedule: (fn, ms) => {
        const id = ++seq;
        queue.push({ fn, ms, id });
        return id;
      },
      cancelSchedule: (id) => {
        const i = queue.findIndex((q) => q.id === id);
        if (i >= 0) queue.splice(i, 1);
      }
    });
    const result = await ctrl.startDeepAudition(AMBIENT_TRACK_LORD_OF_THE_DAWN);
    assert.equal(result.started, false);
    assert.equal(result.reason, 'entitled');
    assert.equal(ctrl.isDeepAuditionActive(), false);
    assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_LORD_OF_THE_DAWN);
    assert.equal(queue.length, 0);
  });
});
