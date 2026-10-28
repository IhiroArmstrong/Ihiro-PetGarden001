/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

describe('WorkEndPreferenceUI layering + confirm affordance (T61 §2)', () => {
  it('panel sits above onboarding hint bubbles (z35 > z34)', () => {
    const src = readFileSync(join(here, 'WorkEndPreferenceUI.js'), 'utf8');
    assert.match(src, /\.work-end-pref__panel[\s\S]*z-index: \$\{Z\.REMINDER_PANEL\}/);
  });

  it('confirm button has visible press feedback', () => {
    const src = readFileSync(join(here, 'WorkEndPreferenceUI.js'), 'utf8');
    assert.match(src, /\.work-end-pref__confirm:active:not\(:disabled\)/);
  });

  it('confirm flash turns the arrow into a green checkmark', () => {
    const src = readFileSync(join(here, 'WorkEndPreferenceUI.js'), 'utf8');
    assert.match(src, /\.work-end-pref__confirm\.is-saved/);
    assert.match(src, /confirmBtn\.textContent = showSaved \? '✓' : '→'/);
  });

  it('menu proxy opens via openPanel()', () => {
    const src = readFileSync(join(here, 'WorkEndPreferenceUI.js'), 'utf8');
    assert.match(src, /openPanel\(\)/);
    assert.match(src, /id = 'work-end-preference-panel'/);
  });
});
