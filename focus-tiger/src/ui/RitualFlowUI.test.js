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
const src = readFileSync(join(here, 'RitualFlowUI.js'), 'utf8');

test('ritual leave retrospective is a weak welcome echo, not a full-panel block', () => {
  assert.match(src, /RETROSPECTIVE_ECHO_CSS/);
  assert.match(src, /data-testid=ritual-leave-retrospective/);
  assert.match(src, /_renderWelcome/);
  assert.match(src, /dataset\.ritualContinue/);
  assert.match(src, /dataset\.ritualLeave/);
  assert.doesNotMatch(src, /ritualStep = 'retrospective'/);
  assert.doesNotMatch(src, /_showRetrospectiveThenWelcome/);
  assert.doesNotMatch(src, /RETROSPECTIVE_BUBBLE_CSS/);
});
