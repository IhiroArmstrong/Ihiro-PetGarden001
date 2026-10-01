/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

describe('ReminderPreferenceUI layering + confirm affordance', () => {
  it('panel sits above onboarding hint bubbles (z35 > z34)', () => {
    const src = readFileSync(join(here, 'ReminderPreferenceUI.js'), 'utf8');
    assert.match(src, /\.reminder-pref__panel[\s\S]*z-index: 35/);
  });

  it('confirm button has visible press feedback', () => {
    const src = readFileSync(join(here, 'ReminderPreferenceUI.js'), 'utf8');
    assert.match(src, /\.reminder-pref__confirm:active:not\(:disabled\)/);
  });

  it('confirm flash turns the arrow into a green checkmark', () => {
    const src = readFileSync(join(here, 'ReminderPreferenceUI.js'), 'utf8');
    assert.match(src, /\.reminder-pref__confirm\.is-saved/);
    assert.match(src, /confirmBtn\.textContent = showSaved \? '✓' : '→'/);
  });

  it('programmatic time sync does not re-enter change handler', () => {
    const src = readFileSync(join(here, 'ReminderPreferenceUI.js'), 'utf8');
    assert.match(src, /this\._syncingTimeValue = true/);
    assert.match(src, /if \(this\._syncingTimeValue\) return/);
  });

  it('preference side-effects defer until after saved flash paints', () => {
    const src = readFileSync(join(here, 'ReminderPreferenceUI.js'), 'utf8');
    assert.match(src, /window\.requestAnimationFrame\(\(\) => notify\(\)\)/);
  });
});
