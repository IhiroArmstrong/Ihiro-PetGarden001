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

test('RecoverResetPracticeUI only wires ground and look menu routes', () => {
  const src = readFileSync(join(here, 'RecoverResetPracticeUI.js'), 'utf8');
  assert.match(src, /recover-reset-practice/);
  assert.match(src, /RESET_ROUTES\.GROUND/);
  assert.match(src, /RESET_ROUTES\.LOOK/);
  assert.equal(src.includes('breath-pacer'), false);
  assert.equal(src.includes('RESET_ROUTES.BREATH'), false);
  assert.equal(src.includes('RESET_ROUTES.OVERWHELMED'), false);
  assert.equal(src.includes('RESET_OVERWHELMED_CONFIDE'), false);
  assert.equal(src.includes('is-pass-through'), false);
});

test('resetPracticeRoutes no longer exposes legacy breath or overwhelmed routes', () => {
  const src = readFileSync(join(here, 'resetPracticeRoutes.js'), 'utf8');
  assert.match(src, /GROUND/);
  assert.match(src, /LOOK/);
  assert.equal(src.includes("BREATH: 'breath'"), false);
  assert.equal(src.includes("OVERWHELMED: 'overwhelmed'"), false);
});
