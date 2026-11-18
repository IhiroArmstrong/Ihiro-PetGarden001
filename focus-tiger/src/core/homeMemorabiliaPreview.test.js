/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MUSTARD_SEED_SEAL_STORAGE_KEY } from './mustardSeedSeal.js';
import { PRACTICE_IMPRINT_STORAGE_KEY } from './practiceImprint.js';
import { listHomeMemorabiliaPreview } from './homeMemorabiliaPreview.js';

function memoryStorage(seed = {}) {
  const map = { ...seed };
  return {
    getItem: (key) => (key in map ? map[key] : null),
    setItem: (key, value) => {
      map[key] = String(value);
    }
  };
}

describe('listHomeMemorabiliaPreview', () => {
  it('is empty when nothing is revealed', () => {
    const preview = listHomeMemorabiliaPreview({ storage: memoryStorage() });
    assert.equal(preview.count, 0);
    assert.equal(preview.latest, null);
  });

  it('counts mustard cases and imprints, latest by timestamp', () => {
    const storage = memoryStorage({
      [MUSTARD_SEED_SEAL_STORAGE_KEY]: JSON.stringify({
        revealed: true,
        revealedAt: '2026-01-01T00:00:00.000Z',
        revealedCaseIds: ['mustard-seed-sumeru']
      }),
      [PRACTICE_IMPRINT_STORAGE_KEY]: JSON.stringify({
        awardedIds: ['imprint-minutes-600'],
        revealedIds: ['imprint-minutes-600'],
        awardedAt: { 'imprint-minutes-600': '2026-06-01T00:00:00.000Z' }
      })
    });
    const preview = listHomeMemorabiliaPreview({ storage });
    assert.equal(preview.count, 2);
    assert.equal(preview.latest?.id, 'imprint:imprint-minutes-600');
    assert.match(preview.latest?.badgeSrc || '', /yin-badge/);
  });
});
