/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

test('GroundExerciseChoiceUI exposes stable testids and choice routes', () => {
  const src = readFileSync(join(here, 'GroundExerciseChoiceUI.js'), 'utf8');
  assert.match(src, /ground-exercise-choice/);
  assert.match(src, /ground-exercise-\$\{choice\.route\}/);
  assert.match(src, /RESET_ROUTES\.GROUND/);
  assert.match(src, /RESET_ROUTES\.LOOK/);
  assert.match(src, /GROUND_EXERCISE_FEEL_LABEL/);
  assert.match(src, /GROUND_EXERCISE_LOOK_LABEL/);
});

test('GroundExerciseChoiceUI uses overlay backdrop dim like Five Moments', () => {
  const src = readFileSync(join(here, 'GroundExerciseChoiceUI.js'), 'utf8');
  assert.match(src, /createOverlayBackdrop/);
  assert.match(src, /zIndex: 17/);
});
