import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VISIBILITY_CONTRACTS,
  VISIBILITY_SUPPRESS_TRIGGER_PATHS,
  listVisibilityE2eSpecFiles,
  listVisibilityLockGaps
} from './visibilityContractRegistry.js';

test('visibility contract ids are unique', () => {
  const ids = VISIBILITY_CONTRACTS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('both-viewport contracts declare wide + narrow selectors', () => {
  for (const c of VISIBILITY_CONTRACTS) {
    if (c.viewport !== 'both') continue;
    assert.ok(
      c.wideSelector,
      `${c.id}: missing wideSelector`
    );
    assert.ok(
      c.narrowSelector,
      `${c.id}: missing narrowSelector`
    );
  }
});

test('locked contracts have required test anchors', () => {
  for (const c of VISIBILITY_CONTRACTS) {
    if (c.lockStatus !== 'locked') continue;
    if (c.viewport === 'wide' || c.viewport === 'both') {
      assert.ok(
        c.testAnchorWide,
        `${c.id}: locked wide/both needs testAnchorWide`
      );
    }
    if (c.viewport === 'narrow' || c.viewport === 'both') {
      assert.ok(
        c.testAnchorNarrow,
        `${c.id}: locked narrow/both needs testAnchorNarrow`
      );
    }
  }
});

test('gap list tracks only post-PR#2 P1/P2 coverage debt (class-2)', () => {
  const gaps = listVisibilityLockGaps();
  const ids = gaps.map((c) => c.id).sort();
  assert.deepEqual(ids, [
    'choose-bow-companion-in-viewport',
    'focusing-focus-hud-visible',
    'heatmap-hidden-when-focusing',
    'honesty-bridge-entries-hidden',
    'honesty-panel-entry-hidden'
  ]);
  // Class-1 merge blockers must be locked (not in gap list)
  const all = VISIBILITY_CONTRACTS.map((c) => c.id);
  assert.ok(all.includes('arrival-breath-sit-still-hidden'));
  assert.ok(all.includes('micro-ritual-sit-unavailable'));
  assert.equal(
    VISIBILITY_CONTRACTS.find((c) => c.id === 'arrival-breath-sit-still-hidden')
      ?.lockStatus,
    'locked'
  );
  assert.equal(
    VISIBILITY_CONTRACTS.find((c) => c.id === 'micro-ritual-sit-unavailable')
      ?.lockStatus,
    'locked'
  );
});

test('listVisibilityE2eSpecFiles returns e2e specs only', () => {
  const files = listVisibilityE2eSpecFiles();
  assert.ok(files.length >= 2);
  for (const f of files) {
    assert.match(f, /^e2e\/.+\.spec\.js$/);
  }
});

test('suppress trigger paths include NarrowIdleShell and main', () => {
  assert.ok(
    VISIBILITY_SUPPRESS_TRIGGER_PATHS.some((p) =>
      p.endsWith('NarrowIdleShell.js')
    )
  );
  assert.ok(
    VISIBILITY_SUPPRESS_TRIGGER_PATHS.some((p) => p.endsWith('main.js'))
  );
});
