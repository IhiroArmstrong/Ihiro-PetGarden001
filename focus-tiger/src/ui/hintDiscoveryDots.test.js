import test from 'node:test';
import assert from 'node:assert/strict';

import {
  rectsOverlap,
  resolvePurposeCardAwayFromTips
} from '../ui/hintDiscoveryDots.js';

test('rectsOverlap detects pad-aware collision', () => {
  assert.equal(
    rectsOverlap(
      { left: 0, top: 0, right: 100, bottom: 80 },
      { left: 90, top: 70, right: 200, bottom: 160 },
      8
    ),
    true
  );
  assert.equal(
    rectsOverlap(
      { left: 0, top: 0, right: 100, bottom: 80 },
      { left: 120, top: 0, right: 200, bottom: 80 },
      8
    ),
    false
  );
});

test('resolvePurposeCardAwayFromTips shifts right of colliding tip', () => {
  const next = resolvePurposeCardAwayFromTips(
    { left: 12, top: 40, width: 280, height: 140 },
    [{ left: 20, top: 100, right: 260, bottom: 160 }],
    { vw: 1200, vh: 800, gap: 12 }
  );
  assert.ok(next.left >= 260 + 12);
  assert.equal(
    rectsOverlap(
      {
        left: next.left,
        top: next.top,
        right: next.left + 280,
        bottom: next.top + 140
      },
      { left: 20, top: 100, right: 260, bottom: 160 },
      8
    ),
    false
  );
});
