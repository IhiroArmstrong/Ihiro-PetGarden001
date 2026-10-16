/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { A11_DARK_VOICE_CARD_BEFORE_1147 } from './fixtures/a11-dark-voice-card-before-1147.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classifyGlassRootFill,
  GLASS_CARD_ROOT_HOLDOUT_IDS,
  runGlassCardRootCheck,
  scanGlassCardRootSource
} from './check-glass-card-roots.js';

const here = dirname(fileURLToPath(import.meta.url));

test('#1147 dark voice-card fixture fails as a dark plate', () => {
  const result = scanGlassCardRootSource(A11_DARK_VOICE_CARD_BEFORE_1147, {
    id: 'system-tts-preference-panel',
    selectors: ['.system-tts-pref__panel']
  });
  assert.equal(result.ok, false);
  assert.ok(result.classes.includes('dark-plate'));
});

test('token and warm-rice fills pass; opaque cream does not', () => {
  assert.equal(classifyGlassRootFill('${GLASS_FILL}'), 'token');
  assert.equal(classifyGlassRootFill('TOKEN_GLASS_FILL_STRONG'), 'token');
  assert.equal(classifyGlassRootFill('rgba(255,252,245,.62)'), 'warm-rice');
  assert.equal(classifyGlassRootFill('rgba(255,252,245,0.96)'), 'opaque-cream');
});

test('JS template interpolations before background do not hide sanctuary glass', () => {
  const src = `
    .yin-support-modal {
      border-radius: \${GLASS_RADIUS};
      background: \${GLASS_FILL_STRONG};
    }
  `;
  const result = scanGlassCardRootSource(src, {
    id: 'yin-support-modal',
    selectors: ['.yin-support-modal']
  });
  assert.equal(result.ok, true, result.problems.join('; '));
  assert.ok(result.classes.includes('token'));
});

test('live registered card roots stay sanctuary glass', () => {
  assert.equal(runGlassCardRootCheck(), true);
});

test('presence-signals-panel is sanctuary glass, not an opaque-cream holdout', () => {
  assert.equal(GLASS_CARD_ROOT_HOLDOUT_IDS.includes('presence-signals-panel'), false);
  const src = readFileSync(
    join(here, '../src/ui/PresenceSignalsPanelUI.js'),
    'utf8'
  );
  const result = scanGlassCardRootSource(src, {
    id: 'presence-signals-panel',
    selectors: ['#presence-signals-panel', '.presence-signals-panel']
  });
  assert.equal(result.ok, true, result.problems.join('; '));
  assert.ok(result.classes.includes('token'));
});
