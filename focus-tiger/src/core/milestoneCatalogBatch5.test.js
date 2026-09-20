/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Shared milestone catalog Batch 5 — imprint + Collections scarcity read catalog only.
 *
 * PO lock: `docs/task-briefs/task-shared-milestone-catalog.md` Batch 5 row.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  COLLECTIONS_BEHAVIORAL_SCARCITY_CATALOG_IDS,
  COLLECTIONS_SCARCITY_NAME_KEYS,
  listCollectionsBehavioralScarcityRows
} from './collectionsBehavioralScarcity.js';
import {
  getMilestoneCatalogEntry,
  listMilestoneCatalogIdsForCollectionsScarcity,
  listMilestoneCatalogIdsForImprint,
  PRACTICE_SCORE_21_CATALOG_ID
} from './MILESTONE_CATALOG.js';
import {
  PRACTICE_IMPRINT_CATALOG_IDS,
  practiceImprintMinutesThreshold
} from './practiceImprint.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readCoreSource(relPath) {
  return readFileSync(join(__dirname, relPath), 'utf8');
}

describe('MILESTONE_CATALOG Batch 5 — surface-derived scarcity ids', () => {
  it('collections scarcity ids are catalog-derived in stable order', () => {
    const derived = listMilestoneCatalogIdsForCollectionsScarcity();
    assert.deepEqual(derived, [
      PRACTICE_SCORE_21_CATALOG_ID,
      'imprint-minutes-600',
      'imprint-minutes-3000',
      'imprint-minutes-10800'
    ]);
    assert.deepEqual(COLLECTIONS_BEHAVIORAL_SCARCITY_CATALOG_IDS, derived);
  });

  it('imprint ids match catalog imprint surface rows', () => {
    const derived = listMilestoneCatalogIdsForImprint();
    assert.deepEqual(derived, [
      'imprint-minutes-600',
      'imprint-minutes-3000',
      'imprint-minutes-10800'
    ]);
    assert.deepEqual(PRACTICE_IMPRINT_CATALOG_IDS, derived);
  });

  it('every scarcity row has a locale name key', () => {
    for (const catalogId of COLLECTIONS_BEHAVIORAL_SCARCITY_CATALOG_IDS) {
      assert.equal(typeof COLLECTIONS_SCARCITY_NAME_KEYS[catalogId], 'string');
    }
  });

  it('imprint minute thresholds read catalog predicates only', () => {
    for (const catalogId of PRACTICE_IMPRINT_CATALOG_IDS) {
      const entry = getMilestoneCatalogEntry(catalogId);
      assert.ok(entry);
      assert.equal(entry?.predicate.type, 'lifetime-minutes-at-least');
      assert.equal(
        practiceImprintMinutesThreshold(catalogId),
        entry?.predicate.minutes
      );
    }
  });

  it('scarcity rows evaluate via catalog predicates (no parallel minute table)', () => {
    const rows = listCollectionsBehavioralScarcityRows({
      storage: null,
      now: () => new Date('2026-09-20')
    });
    assert.equal(rows.length, COLLECTIONS_BEHAVIORAL_SCARCITY_CATALOG_IDS.length);
    for (const row of rows) {
      const entry = getMilestoneCatalogEntry(row.catalogId);
      assert.ok(entry, `missing catalog entry for ${row.catalogId}`);
    }
  });
});

describe('MILESTONE_CATALOG Batch 5 — source hygiene', () => {
  const IMPRINT_MINUTE_LITERAL = /\b(?:600|3000|10800)\b/;

  it('collectionsBehavioralScarcity has no parallel minute threshold table', () => {
    const source = readCoreSource('collectionsBehavioralScarcity.js');
    assert.doesNotMatch(source, /minutes:\s*(?:600|3000|10800)/);
    assert.doesNotMatch(
      source,
      /\[\s*['"]practice-score-21['"][\s\S]*imprint-minutes-/
    );
  });

  it('practiceImprint has no parallel minute threshold table', () => {
    const source = readCoreSource('practiceImprint.js');
    assert.doesNotMatch(source, /minutes:\s*(?:600|3000|10800)/);
    assert.doesNotMatch(source, IMPRINT_MINUTE_LITERAL);
  });
});
