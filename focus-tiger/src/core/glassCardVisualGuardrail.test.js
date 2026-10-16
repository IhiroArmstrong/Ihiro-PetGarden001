/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Unit locks for A13 warm-glass predicates (no browser).
 * @see e2e/helpers/glass-card-visual-guardrail.js
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { A11_DARK_VOICE_CARD_BEFORE_1147 } from '../../scripts/fixtures/a11-dark-voice-card-before-1147.js';
import { classifyGlassRootFill } from '../../scripts/check-glass-card-roots.js';
import { GLASS_FILL } from '../ui/glassPanelStyles.js';
import { A13_GLASS_VISUAL_SURFACES } from './glassCardVisualSurfaces.js';
import {
  isDarkGlassPlateRgb,
  isOpaqueCreamPlateRgb,
  isWarmSanctuaryGlassRgb,
  parseCssRgba,
  tokenStringMatchesGlassFill
} from '../../e2e/helpers/glass-card-visual-guardrail.js';

test('A13 surface manifest has twelve entries', () => {
  assert.equal(A13_GLASS_VISUAL_SURFACES.length, 12);
});

test('GLASS_FILL token string stable for scanners', () => {
  assert.equal(tokenStringMatchesGlassFill(GLASS_FILL), true);
  assert.equal(classifyGlassRootFill(GLASS_FILL), 'warm-rice');
});

test('dark #1147 fixture plate is rejected at source and runtime', () => {
  const dark = 'rgba(28, 28, 32, 0.92)';
  assert.equal(classifyGlassRootFill(dark), 'dark-plate');
  const rgba = parseCssRgba(dark);
  assert.equal(isDarkGlassPlateRgb(rgba), true);
  assert.equal(isWarmSanctuaryGlassRgb(rgba), false);
  assert.match(A11_DARK_VOICE_CARD_BEFORE_1147, /rgba?\(\s*2[0-9]/);
});

test('warm sanctuary glass accepts token and rejects opaque cream', () => {
  const token = parseCssRgba('rgba(255, 252, 245, 0.62)');
  assert.equal(isWarmSanctuaryGlassRgb(token), true);
  const cream = parseCssRgba('rgba(255, 248, 236, 0.98)');
  assert.equal(isOpaqueCreamPlateRgb(cream), true);
  assert.equal(isWarmSanctuaryGlassRgb(cream), false);
});
