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
const src = readFileSync(join(here, 'QuietTogetherLanternsChrome.js'), 'utf8');

test('refresh prefers live sitting snapshot over cached chrome count', () => {
  assert.match(
    src,
    /const snapshot = getLanternSittingSnapshot\(\);\s*const sitting = snapshot != null \? snapshot : this\._sitting;/
  );
});
