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
const src = readFileSync(join(here, 'reflectionHealthShortcutMount.js'), 'utf8');

describe('reflectionHealthShortcutMount', () => {
  test('locks health log button test id and shortcuts scheme', () => {
    assert.match(src, /dataset\.testid = 'health-shortcut-log-button'/);
    assert.match(src, /buildHealthShortcutRunUrl/);
    assert.match(src, /isIosShortcutsHealthSurface/);
  });
});
