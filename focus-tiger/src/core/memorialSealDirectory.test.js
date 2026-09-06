/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MEMORIAL_SEAL_DIRECTORY,
  MEMORIAL_SEAL_ENTRY_OLD_POND,
  MEMORIAL_SEAL_SCENE_MUSTARD_SEED,
  MEMORIAL_SEAL_SCENE_OLD_POND,
  getMemorialSealEntry,
  listMemorialSealEntriesForScene,
  memorialSealSceneUnlockThreshold,
  nextUnrevealedMemorialSealEntry
} from './memorialSealDirectory.js';

describe('memorialSealDirectory', () => {
  it('mustard-seed scene has three enabled entries at score 21', () => {
    const scene = listMemorialSealEntriesForScene(MEMORIAL_SEAL_SCENE_MUSTARD_SEED);
    assert.equal(scene.length, 3);
    assert.ok(scene.every((entry) => entry.scoreThreshold === 21));
    assert.equal(memorialSealSceneUnlockThreshold(MEMORIAL_SEAL_SCENE_MUSTARD_SEED), 21);
  });

  it('old-pond placeholder is disabled and excluded from mustard-seed scene', () => {
    const oldPond = getMemorialSealEntry(MEMORIAL_SEAL_ENTRY_OLD_POND);
    assert.ok(oldPond);
    assert.equal(oldPond.enabled, false);
    assert.equal(oldPond.sealSceneId, MEMORIAL_SEAL_SCENE_OLD_POND);
    assert.equal(oldPond.scoreThreshold, 30);
    assert.equal(
      listMemorialSealEntriesForScene(MEMORIAL_SEAL_SCENE_OLD_POND).length,
      0
    );
    assert.equal(MEMORIAL_SEAL_DIRECTORY.length, 4);
  });

  it('nextUnrevealedMemorialSealEntry respects enabled, score, and reveal order', () => {
    const mustard = listMemorialSealEntriesForScene(
      MEMORIAL_SEAL_SCENE_MUSTARD_SEED
    );
    const first = nextUnrevealedMemorialSealEntry(mustard, [], 21);
    assert.equal(first?.id, 'mustard-seed-sumeru');
    const second = nextUnrevealedMemorialSealEntry(mustard, [first.id], 21);
    assert.equal(second?.id, 'hero-not-pond');
    assert.equal(
      nextUnrevealedMemorialSealEntry(mustard, [], 20),
      null
    );
    const withDisabled = [
      ...mustard,
      getMemorialSealEntry(MEMORIAL_SEAL_ENTRY_OLD_POND)
    ];
    assert.equal(
      nextUnrevealedMemorialSealEntry(withDisabled, [], 30)?.id,
      'mustard-seed-sumeru'
    );
  });
});
