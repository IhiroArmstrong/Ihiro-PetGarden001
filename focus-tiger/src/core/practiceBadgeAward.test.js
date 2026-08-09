import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computePracticeBadgeTargetCount,
  mergeCatalogBadgeAwards
} from './practiceBadgeAward.js';

const TINY = Object.freeze([
  { id: 'a' },
  { id: 'b' },
  { id: 'c' },
  { id: 'd' }
]);

function normalize(raw) {
  if (!Array.isArray(raw)) return [];
  return TINY.map((e) => e.id).filter((id) => raw.includes(id));
}

describe('practiceBadgeAward', () => {
  it('paid: no practice → min floor', () => {
    assert.equal(
      computePracticeBadgeTargetCount(
        {},
        { min: 3, max: 9, requirePractice: false }
      ),
      3
    );
  });

  it('free: no practice → 0', () => {
    assert.equal(
      computePracticeBadgeTargetCount(
        {},
        { min: 1, max: 9, requirePractice: true }
      ),
      0
    );
  });

  it('free: first practice day → at least 1', () => {
    assert.equal(
      computePracticeBadgeTargetCount(
        { practiceDayCount: 1, lifetimeMinutes: 10 },
        { min: 1, max: 9, requirePractice: true }
      ),
      1
    );
  });

  it('scales with score then clamps to max', () => {
    assert.equal(
      computePracticeBadgeTargetCount(
        { practiceDayCount: 3, lifetimeMinutes: 0 },
        { min: 3, max: 9, requirePractice: false }
      ),
      4
    );
    assert.equal(
      computePracticeBadgeTargetCount(
        { practiceDayCount: 30, lifetimeMinutes: 600 },
        { min: 3, max: 9, requirePractice: false }
      ),
      9
    );
  });

  it('merge only grows catalog prefix', () => {
    const first = mergeCatalogBadgeAwards(TINY, [], 2, normalize);
    assert.deepEqual(first.badgeIds, ['a', 'b']);
    const grown = mergeCatalogBadgeAwards(
      TINY,
      first.badgeIds,
      3,
      normalize
    );
    assert.deepEqual(grown.badgeIds, ['a', 'b', 'c']);
    assert.deepEqual(grown.newlyAddedIds, ['c']);
    const same = mergeCatalogBadgeAwards(TINY, grown.badgeIds, 2, normalize);
    assert.deepEqual(same.badgeIds, grown.badgeIds);
    assert.deepEqual(same.newlyAddedIds, []);
  });
});
