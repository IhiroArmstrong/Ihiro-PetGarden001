/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { STATES } from '../StateManager.js';
import { PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS } from './practiceBackupSnapshot.js';
import { enablePracticeBackupOptIn } from './practiceBackupSync.js';
import {
  evaluateEmailJourneyEmptyLibraryChip,
  isPracticeBackupCloudWhitelistEmpty,
  isPracticeBackupStoreValueEmpty
} from './emailJourneyEmptyLibrary.js';
import { setPracticeBackupCloudEnabledForTests } from './practiceBackupCloudEnabled.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, String(value));
    }
  };
}

describe('emailJourneyEmptyLibrary · T93 D4', () => {
  it('treats missing, [], {}, and empty entries as empty', () => {
    assert.equal(isPracticeBackupStoreValueEmpty(null), true);
    assert.equal(isPracticeBackupStoreValueEmpty('[]'), true);
    assert.equal(isPracticeBackupStoreValueEmpty('{"entries":[]}'), true);
    assert.equal(
      isPracticeBackupStoreValueEmpty('{"entries":[{"id":"1"}]}'),
      false
    );
  });

  it('reports empty whitelist until a cloud key has rows', () => {
    const empty = memoryStorage();
    assert.equal(isPracticeBackupCloudWhitelistEmpty(empty), true);
    const filled = memoryStorage({
      [PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS[0]]: '{"entries":[{"id":"j1"}]}'
    });
    assert.equal(isPracticeBackupCloudWhitelistEmpty(filled), false);
  });

  it('hides the Mac chip on the first-invite cloud gate', () => {
    const storage = memoryStorage();
    assert.equal(
      evaluateEmailJourneyEmptyLibraryChip({
        storage,
        isDesktop: true,
        firstSceneOpen: false,
        welcomeSequencePlaying: false,
        focusing: false,
        sessionState: STATES.IDLE,
        channel: 'direct'
      }).reason,
      'cloud-gate-off'
    );
  });

  it('shows the Mac chip after first scene only, and hides when bound', () => {
    setPracticeBackupCloudEnabledForTests(true);
    try {
    const storage = memoryStorage();
    const base = {
      storage,
      isDesktop: true,
      firstSceneOpen: false,
      welcomeSequencePlaying: false,
      focusing: false,
      sessionState: STATES.IDLE,
      channel: 'direct'
    };
    assert.equal(evaluateEmailJourneyEmptyLibraryChip(base).shouldShow, true);
    assert.equal(
      evaluateEmailJourneyEmptyLibraryChip({ ...base, isDesktop: false })
        .reason,
      'not-desktop'
    );
    assert.equal(
      evaluateEmailJourneyEmptyLibraryChip({ ...base, firstSceneOpen: true })
        .reason,
      'first-scene'
    );
    enablePracticeBackupOptIn(storage, {
      email: 'a@example.com',
      deviceToken: 'tok_abcdefghijklmnopqrstuvwxyz012345'
    });
    assert.equal(
      evaluateEmailJourneyEmptyLibraryChip(base).reason,
      'already-bound'
    );
    } finally {
      setPracticeBackupCloudEnabledForTests(false);
    }
  });
});
