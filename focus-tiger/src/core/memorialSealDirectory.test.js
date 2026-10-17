/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CONTEMPLATIVE_ARCHIVE_CATALOG_ENTRIES
} from './memorialSealCatalogCa.js';
import { PRACTICE_SCORE_21_THRESHOLD } from './MILESTONE_CATALOG.js';
import {
  MEMORIAL_SEAL_DIRECTORY,
  MEMORIAL_SEAL_SCENE_MUSTARD_SEED,
  getMemorialSealEntry,
  listEnabledContemplativeArchiveSealEntries,
  listMemorialSealEntriesForScene,
  memorialSealSceneUnlockThreshold
} from './memorialSealDirectory.js';

describe('memorialSealDirectory', () => {
  it('mustard-seed scene has four enabled entries at catalog score threshold', () => {
    const scene = listMemorialSealEntriesForScene(MEMORIAL_SEAL_SCENE_MUSTARD_SEED);
    assert.equal(scene.length, 4);
    assert.ok(
      scene.every((entry) => entry.scoreThreshold === PRACTICE_SCORE_21_THRESHOLD)
    );
    assert.equal(
      memorialSealSceneUnlockThreshold(MEMORIAL_SEAL_SCENE_MUSTARD_SEED),
      PRACTICE_SCORE_21_THRESHOLD
    );
  });

  it('catalog has twelve CA candidates plus four mustard cases', () => {
    assert.equal(CONTEMPLATIVE_ARCHIVE_CATALOG_ENTRIES.length, 12);
    assert.equal(MEMORIAL_SEAL_DIRECTORY.length, 16);
  });

  it('MS-04 hundred-foot pole keeps Jingcen verse in traditional Chinese', () => {
    const entry = getMemorialSealEntry('hundred-foot-pole');
    assert.equal(entry?.catalogId, 'MS-04');
    assert.deepEqual(entry?.poemZh, [
      '百尺竿頭不動人，',
      '雖然得入未為真；',
      '百尺竿頭須進步，',
      '十方世界現全身。'
    ]);
    assert.equal(entry?.attributionZh, '長沙景岑禪師');
    assert.match(entry?.poemEn?.[0] ?? '', /hundred-foot pole/i);
  });

  it('all twelve CA entries are enabled in the archive catalog', () => {
    const enabled = listEnabledContemplativeArchiveSealEntries();
    assert.equal(enabled.length, 12);
    assert.equal(enabled[0].id, 'ca-01-old-pond');
    assert.equal(enabled[0].scoreThreshold, 30);
    assert.ok(enabled.every((entry) => entry.enabled));
    const oldPond = getMemorialSealEntry('ca-01-old-pond');
    assert.ok(oldPond?.poemJa?.[0]?.includes('古池'));
  });

  it('CA-02 cherry blossoms keeps excerpt threshold and expanded copy', () => {
    const cherry = getMemorialSealEntry('ca-02-cherry-blossoms');
    assert.equal(cherry?.enabled, true);
    assert.equal(cherry?.scoreThreshold, 60);
    assert.ok(cherry?.poemEnExpanded?.length);
  });
});
