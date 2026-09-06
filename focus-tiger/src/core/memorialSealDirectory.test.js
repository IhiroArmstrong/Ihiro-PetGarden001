/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONTEMPLATIVE_ARCHIVE_CATALOG_ENTRIES
} from './memorialSealCatalogCa.js';
import {
  MEMORIAL_SEAL_DIRECTORY,
  MEMORIAL_SEAL_SCENE_MUSTARD_SEED,
  getMemorialSealEntry,
  listEnabledContemplativeArchiveSealEntries,
  listMemorialSealEntriesForScene,
  memorialSealSceneUnlockThreshold
} from './memorialSealDirectory.js';

describe('memorialSealDirectory', () => {
  it('mustard-seed scene has three enabled entries at score 21', () => {
    const scene = listMemorialSealEntriesForScene(MEMORIAL_SEAL_SCENE_MUSTARD_SEED);
    assert.equal(scene.length, 3);
    assert.ok(scene.every((entry) => entry.scoreThreshold === 21));
    assert.equal(memorialSealSceneUnlockThreshold(MEMORIAL_SEAL_SCENE_MUSTARD_SEED), 21);
  });

  it('catalog has twelve CA candidates plus three mustard cases', () => {
    assert.equal(CONTEMPLATIVE_ARCHIVE_CATALOG_ENTRIES.length, 12);
    assert.equal(MEMORIAL_SEAL_DIRECTORY.length, 15);
  });

  it('only CA-01 old pond is enabled in the archive catalog', () => {
    const enabled = listEnabledContemplativeArchiveSealEntries();
    assert.equal(enabled.length, 1);
    assert.equal(enabled[0].id, 'ca-01-old-pond');
    assert.equal(enabled[0].scoreThreshold, 30);
    const oldPond = getMemorialSealEntry('ca-01-old-pond');
    assert.ok(oldPond?.poemJa?.[0]?.includes('古池'));
  });

  it('disabled CA entries remain in directory for future enablement', () => {
    const cherry = getMemorialSealEntry('ca-02-cherry-blossoms');
    assert.equal(cherry?.enabled, false);
    assert.equal(cherry?.scoreThreshold, 60);
    assert.ok(cherry?.poemEnExpanded?.length);
  });
});
