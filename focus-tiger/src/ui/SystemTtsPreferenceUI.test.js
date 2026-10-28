/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('system voice toggle lives in soundscape panel (no standalone preference card)', () => {
  const mainSrc = readFileSync(join(__dirname, '../main.js'), 'utf8');
  assert.doesNotMatch(mainSrc, /SystemTtsPreferenceUI/);
  assert.doesNotMatch(mainSrc, /__systemTtsPreference/);
});
