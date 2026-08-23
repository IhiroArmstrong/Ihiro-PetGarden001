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
const src = readFileSync(join(here, 'ActiveRecoverAnchorUI.js'), 'utf8');

test('cooldown re-tap is wired to onCooldownTap (not a silent return)', () => {
  assert.match(src, /onCooldownTap/);
  assert.match(src, /this\.handlers\.onCooldownTap\?\.\(\)/);
  assert.equal(
    src.includes('if (!this._focusing || this._cooldown) return'),
    false,
    'cooldown must not silently swallow the click'
  );
});

test('cooldown hides glow and hint but keeps an invisible hit', () => {
  assert.match(src, /is-cooldown/);
  assert.match(src, /this\.glow\.hidden = cooling/);
  assert.match(src, /this\.hint\.hidden = cooling/);
  assert.match(src, /this\.root\.hidden = !focusing/);
  assert.match(src, /isHitArmed/);
});

test('recover hint sits near Yin, not in the Fullscreen companion bottom band', () => {
  assert.match(src, /top: 50%/);
  assert.match(src, /bottom: auto/);
  assert.equal(src.includes('top: 64%'), false);
  assert.equal(src.includes('homeClearanceBottomCss'), false);
});

test('recover hint contrast stays readable on the glow (not robe-grey ghost alpha)', () => {
  const colors = [...src.matchAll(/color:\s*rgba\(\s*62,\s*46,\s*32,\s*(0\.\d+)\s*\)/g)];
  assert.ok(colors.length >= 2, 'desktop + 375 must set the readable brown');
  for (const [, alpha] of colors) {
    assert.ok(Number(alpha) >= 0.72, `hint alpha ${alpha} must stay >= 0.72`);
  }
  assert.equal(src.includes('0.38'), false);
  assert.equal(src.includes('0.34'), false);
});
