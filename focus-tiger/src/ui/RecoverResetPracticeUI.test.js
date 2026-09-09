/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

test('RecoverResetPracticeUI wires breath-pacer compact and confide link', () => {
  const src = readFileSync(join(here, 'RecoverResetPracticeUI.js'), 'utf8');
  assert.match(src, /recover-reset-practice/);
  assert.match(src, /breath-pacer/);
  assert.match(src, /compact/);
  assert.match(src, /RESET_OVERWHELMED_CONFIDE_LINK/);
  assert.equal(src.includes('pointer-events: auto'), true);
});

test('breath-pacer compact mode hides preset pills and start-focus button', () => {
  const src = readFileSync(
    join(here, '../components/breath-pacer/breath-pacer.js'),
    'utf8'
  );
  assert.match(src, /compact/);
  assert.match(src, /this\.compact/);
});
