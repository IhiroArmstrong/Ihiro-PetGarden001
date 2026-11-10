/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mergePracticeBackupCloudStoreValue } from './practiceBackupCloudMerge.js';
import { practiceBackupCloudEnabled } from './practiceBackupCloudEnabled.js';

describe('mergePracticeBackupCloudStoreValue (T93 D1)', () => {
  it('does not turn the cloud gate on', () => {
    assert.equal(practiceBackupCloudEnabled, false);
  });

  it('keeps local when cloud is null', () => {
    const local = {
      entries: [
        {
          at: '2026-01-01T00:00:00.000Z',
          minutes: 10,
          arrive: true,
          reflect: false
        }
      ]
    };
    const merged = mergePracticeBackupCloudStoreValue(
      'focus-tiger.journey-log.v1',
      local,
      null
    );
    assert.equal(merged, local);
  });

  it('takes max minutes for the same practice day (does not sum)', () => {
    const merged = mergePracticeBackupCloudStoreValue(
      'focus-tiger.practice-days.v1',
      { days: [{ date: '2026-08-01', totalMinutes: 15 }] },
      { days: [{ date: '2026-08-01', totalMinutes: 10 }] }
    );
    assert.deepEqual(merged.days, [{ date: '2026-08-01', totalMinutes: 15 }]);
  });

  it('unions entitlement ownership keys', () => {
    const merged = mergePracticeBackupCloudStoreValue(
      'focus-tiger.entitlement-ownership.v1',
      { owned: { 'journey.log': { at: '2026-01-01T00:00:00.000Z', meta: null } } },
      {
        owned: {
          'milestone.glow.played': { at: '2026-02-01T00:00:00.000Z', meta: null }
        }
      }
    );
    assert.ok(merged.owned['journey.log']);
    assert.ok(merged.owned['milestone.glow.played']);
  });

  it('unions ritual completions by ritualId+at', () => {
    const merged = mergePracticeBackupCloudStoreValue(
      'focus-tiger.ritual-completions.v1',
      {
        entries: [
          { ritualId: 'morning', at: '2026-01-01T00:00:00.000Z', selections: {} }
        ]
      },
      {
        entries: [
          {
            ritualId: 'work-transition',
            at: '2026-02-01T00:00:00.000Z',
            selections: {}
          }
        ]
      }
    );
    assert.equal(merged.entries.length, 2);
  });

  it('unions milestone glow ids', () => {
    const merged = mergePracticeBackupCloudStoreValue(
      'focus-tiger.milestone-glow.v1',
      { records: [{ id: 'glow-7' }] },
      { records: [{ id: 'glow-21' }] }
    );
    const ids = merged.records.map((row) => row.id).sort();
    assert.deepEqual(ids, ['glow-21', 'glow-7']);
  });

  it('mustard seed only grows (revealed stays true)', () => {
    const merged = mergePracticeBackupCloudStoreValue(
      'focus-tiger.mustard-seed-seal.v1',
      {
        revealed: true,
        revealedAt: '2026-01-01T00:00:00.000Z',
        scoreAtReveal: 21,
        revealedCaseIds: ['mustard-seed-sumeru'],
        lastShownCaseId: 'mustard-seed-sumeru'
      },
      { revealed: false, revealedCaseIds: [] }
    );
    assert.equal(merged.revealed, true);
    assert.equal(merged.revealedAt, '2026-01-01T00:00:00.000Z');
    assert.equal(merged.scoreAtReveal, 21);
  });

  it('lotus pond takes the higher lifetime minutes', () => {
    const merged = mergePracticeBackupCloudStoreValue(
      'focus-tiger.lotus-pond.v1',
      { lifetimeMinutes: 400 },
      { lifetimeMinutes: 120 }
    );
    assert.equal(merged.lifetimeMinutes, 400);
  });
});
