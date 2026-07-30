import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shouldSyncHomeCtasForRecords } from './WideIdleMoreMenu.js';

/**
 * @param {unknown} target
 * @returns {{ target: unknown }}
 */
const record = (target) => ({ target });

/**
 * @param {unknown[]} owned
 * @returns {{ contains: (node: unknown) => boolean }}
 */
const rowContaining = (owned) => ({
  contains: (node) => owned.includes(node)
});

describe('shouldSyncHomeCtasForRecords', () => {
  it('ignores mutations the home CTA row made to itself', () => {
    const ball = { id: 'ft-wide-home-sit' };
    const ctaRow = rowContaining([ball]);

    // The row writes aria-disabled/hidden on its own balls; reacting to that
    // re-enters the observer forever and freezes the page.
    assert.equal(shouldSyncHomeCtasForRecords([record(ctaRow)], ctaRow), false);
    assert.equal(shouldSyncHomeCtasForRecords([record(ball)], ctaRow), false);
    assert.equal(
      shouldSyncHomeCtasForRecords([record(ball), record(ctaRow)], ctaRow),
      false
    );
  });

  it('syncs when the proxied dock chrome changes', () => {
    const ball = { id: 'ft-wide-home-sit' };
    const ctaRow = rowContaining([ball]);
    const sitPill = { id: 'btn-focus' };

    assert.equal(shouldSyncHomeCtasForRecords([record(sitPill)], ctaRow), true);
    assert.equal(
      shouldSyncHomeCtasForRecords([record(ball), record(sitPill)], ctaRow),
      true
    );
  });

  it('is inert without records and permissive before the row mounts', () => {
    assert.equal(shouldSyncHomeCtasForRecords([], rowContaining([])), false);
    assert.equal(shouldSyncHomeCtasForRecords(null, rowContaining([])), false);
    assert.equal(shouldSyncHomeCtasForRecords([record({})], null), true);
  });
});
