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
});
