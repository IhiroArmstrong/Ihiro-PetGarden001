/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'HealthShortcutLogPreferenceUI.js'), 'utf8');

describe('HealthShortcutLogPreferenceUI', () => {
  test('exposes preference toggle test id', () => {
    assert.match(src, /dataset\.testid = 'health-shortcut-log-toggle'/);
    assert.match(src, /id = 'health-shortcut-log-preference-panel'/);
  });

  test('uses panel z-index layer', () => {
    assert.match(src, /z-index: \$\{Z\.PANEL\}/);
  });

  test('disables toggle when health shortcut preference unavailable', () => {
    assert.match(src, /canConfigureHealthShortcutLogPreference/);
    assert.match(src, /toggleInput\.disabled = !canConfigure/);
    assert.match(src, /HEALTH_SHORTCUT_PREF_UNAVAILABLE/);
  });
});
