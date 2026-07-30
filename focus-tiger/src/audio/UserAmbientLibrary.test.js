import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UserAmbientLibrary,
  createMemoryUserAmbientBackend,
  validateUserAmbientUpload,
  mergeAmbientPanelTracks,
  sanitizeUserAmbientLabel,
  isUserAmbientTrackId,
  USER_AMBIENT_MAX_TRACKS,
  USER_AMBIENT_MAX_FILE_BYTES,
  USER_AMBIENT_MAX_TOTAL_BYTES
} from './UserAmbientLibrary.js';
import {
  AmbientSoundscapeController,
  AMBIENT_TRACKS,
  AMBIENT_TRACK_OFF,
  DEFAULT_AMBIENT_TRACK_ID,
  normalizeAmbientPref
} from './AmbientSoundscapeController.js';

function fakeMeta({
  name = 'calm.mp3',
  type = 'audio/mpeg',
  size = 1024
} = {}) {
  return { name, type, size };
}

function fakeFile({
  name = 'calm.mp3',
  type = 'audio/mpeg',
  bytes = 64
} = {}) {
  const blob = new Blob([new Uint8Array(bytes)], { type });
  Object.defineProperty(blob, 'name', { value: name });
  return /** @type {File} */ (blob);
}

test('isUserAmbientTrackId recognizes user- prefix only', () => {
  assert.equal(isUserAmbientTrackId('user-1'), true);
  assert.equal(isUserAmbientTrackId('singing-bowl'), false);
  assert.equal(isUserAmbientTrackId(null), false);
});

test('validateUserAmbientUpload rejects bad format and oversize', () => {
  assert.equal(
    validateUserAmbientUpload(fakeMeta({ name: 'x.wav', type: 'audio/wav' }), {
      trackCount: 0,
      totalBytes: 0
    }).ok,
    false
  );
  assert.equal(
    validateUserAmbientUpload(
      fakeMeta({ size: USER_AMBIENT_MAX_FILE_BYTES + 1 }),
      { trackCount: 0, totalBytes: 0 }
    ).errorKey,
    'AMBIENT_UPLOAD_ERR_FILE_SIZE'
  );
  assert.equal(
    validateUserAmbientUpload(fakeMeta(), {
      trackCount: USER_AMBIENT_MAX_TRACKS,
      totalBytes: 0
    }).errorKey,
    'AMBIENT_UPLOAD_ERR_LIMIT'
  );
  assert.equal(
    validateUserAmbientUpload(fakeMeta({ size: 100 }), {
      trackCount: 0,
      totalBytes: USER_AMBIENT_MAX_TOTAL_BYTES
    }).errorKey,
    'AMBIENT_UPLOAD_ERR_LIMIT'
  );
  assert.equal(
    validateUserAmbientUpload(fakeMeta(), { trackCount: 0, totalBytes: 0 }).ok,
    true
  );
});

test('mergeAmbientPanelTracks puts recent user tracks above built-ins', () => {
  const merged = mergeAmbientPanelTracks(
    [
      { id: 'user-old', label: 'Old', addedAt: 1, byteLength: 1, mime: 'audio/mpeg' },
      { id: 'user-new', label: 'New', addedAt: 9, byteLength: 1, mime: 'audio/mpeg' }
    ],
    AMBIENT_TRACKS
  );
  assert.deepEqual(
    merged.userTracks.map((t) => t.id),
    ['user-new', 'user-old']
  );
  assert.equal(merged.builtInTracks[0].id, AMBIENT_TRACKS[0].id);
});

test('sanitizeUserAmbientLabel strips extension and clips', () => {
  assert.equal(sanitizeUserAmbientLabel('My Calm Loop.mp3'), 'My Calm Loop');
});

test('UserAmbientLibrary add / list recent-first / remove', async () => {
  let t = 1000;
  const lib = new UserAmbientLibrary({
    backend: createMemoryUserAmbientBackend(),
    now: () => t++,
    createObjectURL: () => 'blob:fake',
    revokeObjectURL: () => {}
  });
  const a = await lib.addFromFile(fakeFile({ name: 'first.mp3' }));
  const b = await lib.addFromFile(fakeFile({ name: 'second.mp3' }));
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  const list = await lib.listMeta();
  assert.equal(list[0].id, b.track.id);
  assert.equal(list[1].id, a.track.id);
  const src = await lib.resolveSrc(b.track.id);
  assert.equal(src, 'blob:fake');
  await lib.remove(b.track.id);
  assert.equal((await lib.listMeta()).length, 1);
});

test('normalizeAmbientPref keeps user-* track ids', () => {
  assert.deepEqual(
    normalizeAmbientPref({ enabled: true, trackId: 'user-abc' }),
    { enabled: true, trackId: 'user-abc' }
  );
  assert.deepEqual(
    normalizeAmbientPref(
      { enabled: true, trackId: 'user-missing' },
      { knownUserTrackIds: ['user-abc'] }
    ),
    { enabled: true, trackId: DEFAULT_AMBIENT_TRACK_ID }
  );
});

test('setTrack plays user library src; delete falls back pref', async () => {
  const urls = new Map();
  const backend = createMemoryUserAmbientBackend();
  const lib = new UserAmbientLibrary({
    backend,
    now: () => 42,
    createObjectURL: (blob) => {
      const u = `blob:mem-${urls.size}`;
      urls.set(u, blob);
      return u;
    },
    revokeObjectURL: () => {}
  });
  const added = await lib.addFromFile(fakeFile({ name: 'mine.mp3' }));
  assert.equal(added.ok, true);

  const audio = {
    loop: false,
    volume: 1,
    muted: false,
    paused: true,
    src: '',
    currentTime: 0,
    addEventListener() {},
    removeEventListener() {},
    async play() {
      this.paused = false;
    },
    pause() {
      this.paused = true;
    },
    load() {},
    removeAttribute(name) {
      if (name === 'src') this.src = '';
    }
  };
  const storage = {
    map: new Map(),
    getItem(k) {
      return this.map.has(k) ? this.map.get(k) : null;
    },
    setItem(k, v) {
      this.map.set(k, String(v));
    }
  };
  const ctrl = new AmbientSoundscapeController({
    audio,
    storage,
    mountToDocument: false,
    userLibrary: lib
  });
  await ctrl.setTrack(added.track.id);
  assert.equal(ctrl.getTrackId(), added.track.id);
  assert.match(audio.src, /^blob:mem-/);
  await ctrl.onUserTrackRemoved(added.track.id);
  assert.equal(ctrl.getPreferredTrackId(), DEFAULT_AMBIENT_TRACK_ID);
  assert.equal(ctrl.getTrackId(), AMBIENT_TRACK_OFF);
});
