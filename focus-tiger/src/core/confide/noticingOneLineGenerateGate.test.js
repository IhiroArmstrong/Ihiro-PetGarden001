/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { noticingOneLineAllowsDesktopGenerate } from './noticingOneLineGenerateGate.js';

test('Route X keeps generate code but Confide UI must not send it to the bubble', () => {
  assert.equal(noticingOneLineAllowsDesktopGenerate(), false);
  const ui = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../ui/ConfideToYinUI.js'),
    'utf8'
  );
  assert.match(ui, /noticingOneLineAllowsDesktopGenerate\(\)/);
  assert.match(ui, /wantGenerate =\s*noticingOneLineAllowsDesktopGenerate\(\) &&/);
});
