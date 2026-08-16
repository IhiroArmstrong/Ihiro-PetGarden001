/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  IDLE_COMPANION_PIP_STORAGE_KEY,
  hasUsedIdleCompanionPip,
  markIdleCompanionPipUsed,
  normalizeIdleCompanionPipState,
  readIdleCompanionPipState,
  shouldMountIdleCompanionPipEntry,
  shouldShowIdleCompanionPipEntry,
  supportsDocumentPictureInPicture
} from './idleCompanionPipGate.js';

function createMapStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    }
  };
}

describe('shouldMountIdleCompanionPipEntry (feature-detect)', () => {
  it('hides the Idle entry when Document PiP is missing', () => {
    assert.equal(shouldMountIdleCompanionPipEntry({}), false);
    assert.equal(shouldMountIdleCompanionPipEntry({ documentPictureInPicture: {} }), false);
    assert.equal(supportsDocumentPictureInPicture({}), false);
  });

  it('mounts the Idle entry only when requestWindow exists', () => {
    const win = {
      documentPictureInPicture: { requestWindow: async () => ({}) }
    };
    assert.equal(supportsDocumentPictureInPicture(win), true);
    assert.equal(shouldMountIdleCompanionPipEntry(win), true);
  });
});

describe('shouldShowIdleCompanionPipEntry (support × Idle)', () => {
  it('shows only when supported and Idle', () => {
    assert.equal(
      shouldShowIdleCompanionPipEntry({
        documentPipSupported: true,
        isIdle: true
      }),
      true
    );
  });

  it('hides when the browser does not support Document PiP, even on Idle', () => {
    assert.equal(
      shouldShowIdleCompanionPipEntry({
        documentPipSupported: false,
        isIdle: true
      }),
      false
    );
    assert.equal(shouldShowIdleCompanionPipEntry({ isIdle: true }), false);
  });

  it('hides on supported browsers when not Idle (Focusing / Arrival / overlay)', () => {
    assert.equal(
      shouldShowIdleCompanionPipEntry({
        documentPipSupported: true,
        isIdle: false
      }),
      false
    );
    assert.equal(
      shouldShowIdleCompanionPipEntry({ documentPipSupported: true }),
      false
    );
  });
});

describe('idle companion PiP usage gate', () => {
  it('normalizes empty / dirty storage as unused', () => {
    assert.deepEqual(normalizeIdleCompanionPipState(null), {
      used: false,
      usedAt: null
    });
    assert.deepEqual(normalizeIdleCompanionPipState({ used: 'yes' }), {
      used: true,
      usedAt: null
    });
    assert.equal(hasUsedIdleCompanionPip(createMapStorage()), false);
  });

  it('records first use and stays used (no reminder side effects)', () => {
    const storage = createMapStorage();
    markIdleCompanionPipUsed(storage, () => 1_700_000_000_000);
    assert.equal(hasUsedIdleCompanionPip(storage), true);
    const first = readIdleCompanionPipState(storage);
    assert.equal(first.used, true);
    assert.equal(first.usedAt, 1_700_000_000_000);
    markIdleCompanionPipUsed(storage, () => 1_800_000_000_000);
    assert.equal(readIdleCompanionPipState(storage).usedAt, 1_700_000_000_000);
    assert.equal(storage.getItem(IDLE_COMPANION_PIP_STORAGE_KEY) != null, true);
  });
});
