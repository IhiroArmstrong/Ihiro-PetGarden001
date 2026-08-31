/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'IdleYinTapAnchorUI.js'), 'utf8');
const poseSrc = readFileSync(
  join(here, '../character/PoseManager.js'),
  'utf8'
);
const mainSrc = readFileSync(join(here, '../main.js'), 'utf8');

test('Idle Yin tap is hidden when not armed (no silent click on a visible hit)', () => {
  assert.match(src, /setArmed/);
  assert.match(src, /this\.root\.hidden = !show/);
  assert.match(src, /if \(!this\._armed\) return/);
  assert.match(src, /z-index: 12/);
  assert.match(src, /idle-yin-tap-hint/);
  assert.match(src, /IDLE_YIN_TAP_HINT/);
});

test('Idle Yin tap hit covers the forehead band, not only the Recover body oval', () => {
  const topMatch = src.match(/IDLE_YIN_TAP_HIT_LAYOUT = Object\.freeze\(\{[\s\S]*?top: '(\d+)%'/);
  assert.ok(topMatch, 'expected IDLE_YIN_TAP_HIT_LAYOUT.top');
  const topPct = Number(topMatch[1]);
  assert.ok(topPct <= 32, `forehead hit top must be ≤32%, got ${topPct}`);
  assert.doesNotMatch(src, /top: 46%/);
  assert.match(mainSrc, /wrapPlayEmotionWithIdleYinTapSync\(emotionController/);
  assert.match(
    mainSrc,
    /playEmotion\(IDLE_YIN_TAP_EMOTION_KEY, \{[\s\S]*?returnCrossFadeMs: CAPCUT_DISSOLVE_MS[\s\S]*?freezeUntilCrossFadeEnds: true/
  );
  assert.match(poseSrc, /pointerEvents = clamped === 0 \? 'none'/);
});
