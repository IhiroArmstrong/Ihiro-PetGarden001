import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MOMENT_WHISPERS_SEEN_KEY,
  hasSeenMomentWhisper,
  markMomentWhisperSeen,
  shouldShowMomentWhisper,
  MOMENT_WHISPER_PLAYABLE
} from './momentWhispersGate.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('momentWhispersGate', () => {
  it('offers playable moments once until seen', () => {
    const storage = memoryStorage();
    assert.equal(shouldShowMomentWhisper(storage, 'arrive'), true);
    markMomentWhisperSeen(storage, 'arrive');
    assert.equal(hasSeenMomentWhisper(storage, 'arrive'), true);
    assert.equal(shouldShowMomentWhisper(storage, 'arrive'), false);
    assert.match(
      String(storage.getItem(MOMENT_WHISPERS_SEEN_KEY)),
      /arrive/
    );
  });

  it('suppresses when busy', () => {
    const storage = memoryStorage();
    assert.equal(
      shouldShowMomentWhisper(storage, 'focus', { busy: true }),
      false
    );
    assert.equal(
      shouldShowMomentWhisper(storage, 'focus', { busy: false }),
      true
    );
  });

  it('never plays transition until playable set expands', () => {
    const storage = memoryStorage();
    assert.equal(MOMENT_WHISPER_PLAYABLE.has('transition'), false);
    assert.equal(shouldShowMomentWhisper(storage, 'transition'), false);
  });

  it('recover is playable (Tiger Anchor live)', () => {
    assert.equal(MOMENT_WHISPER_PLAYABLE.has('recover'), true);
    const storage = memoryStorage();
    assert.equal(shouldShowMomentWhisper(storage, 'recover'), true);
  });
});
