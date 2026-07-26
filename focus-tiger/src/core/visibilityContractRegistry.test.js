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

test('gap list is non-empty until Breath / micro-ritual / bridge narrow anchors land', () => {
  const gaps = listVisibilityLockGaps();
  const ids = gaps.map((c) => c.id);
  // Structural scan: these were identified as wide-only or unanchored as of 2026-07-26
  for (const expected of [
    'arrival-breath-sit-still-hidden',
    'micro-ritual-sit-unavailable',
    'honesty-bridge-entries-hidden',
    'honesty-panel-entry-hidden',
    'focusing-focus-hud-visible',
    'choose-bow-companion-in-viewport',
    'heatmap-hidden-when-focusing'
  ]) {
    assert.ok(
      ids.includes(expected),
      `expected gap ${expected} still tracked (got: ${ids.join(', ')})`
    );
  }
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
