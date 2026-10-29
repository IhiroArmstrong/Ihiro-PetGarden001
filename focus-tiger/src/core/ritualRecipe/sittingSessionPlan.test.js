/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FOCUS_DURATION_DEFAULT_MINUTES } from '../focusDuration.js';
import {
  createDefaultSittingRecipe,
  RECOVER_COOLDOWN_SEC
} from './ritualRecipeSchema.js';
import {
  OFFICIAL_SITTING_TEMPLATE_ID,
  OFFICIAL_SITTING_TEMPLATES
} from './officialSittingTemplates.js';
import {
  emitRecipeSessionStarted,
  isDefaultSittingRecipe,
  resolveSittingSessionPlan
} from './sittingSessionPlan.js';

const here = dirname(fileURLToPath(import.meta.url));
const mainSrc = readFileSync(join(here, '../../main.js'), 'utf8');
const recoverSrc = readFileSync(
  join(here, '../MindfulReminderController.js'),
  'utf8'
);

test('Default sitting recipe matches pre-recipe duration and Recover cooldown', () => {
  const recipe = createDefaultSittingRecipe();
  assert.equal(isDefaultSittingRecipe(recipe), true);
  assert.equal(
    recipe.moments.focus.durationSec,
    FOCUS_DURATION_DEFAULT_MINUTES * 60
  );
  assert.equal(recipe.moments.recover.cooldownSec, RECOVER_COOLDOWN_SEC);
  assert.equal(RECOVER_COOLDOWN_SEC, 180);
  assert.match(
    recoverSrc,
    /ACTIVE_RECOVER_COOLDOWN_MS = 3 \* 60 \* 1000/
  );
  assert.equal(recipe.soundId, null);
});

test('Default plan with recipe duration is not a chip override', () => {
  const recipe = createDefaultSittingRecipe();
  const plan = resolveSittingSessionPlan({
    recipe,
    focusMode: 'fixed',
    durationSec: 600
  });
  assert.equal(plan.source, 'default');
  assert.equal(plan.chipOverride, false);
  assert.equal(plan.soundId, null);
  assert.equal(plan.recoverCooldownSec, 180);
  assert.deepEqual(plan.promptId, {
    arrive: null,
    focus: null,
    transition: null,
    reflect: null
  });
});

test('chip 25 minutes against Default is this-session override and does not mutate recipe', () => {
  const recipe = createDefaultSittingRecipe();
  const before = JSON.stringify(recipe);
  const plan = resolveSittingSessionPlan({
    recipe,
    focusMode: 'fixed',
    durationSec: 1500
  });
  assert.equal(plan.chipOverride, true);
  assert.equal(plan.source, 'default');
  assert.equal(plan.soundId, null);
  assert.equal(JSON.stringify(recipe), before);
});

test('open-ended chip against Default is a chip override', () => {
  const plan = resolveSittingSessionPlan({
    recipe: createDefaultSittingRecipe(),
    focusMode: 'open',
    durationSec: 600
  });
  assert.equal(plan.focusMode, 'open');
  assert.equal(plan.chipOverride, true);
});

test('Deep template plan is official and distinct from Default', () => {
  const deep = OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.DEEP];
  const recipe = {
    ...createDefaultSittingRecipe(),
    title: deep.title,
    soundId: deep.soundId,
    moments: {
      ...createDefaultSittingRecipe().moments,
      ...deep.moments,
      recover: { cooldownSec: 180 }
    }
  };
  const plan = resolveSittingSessionPlan({
    recipe,
    focusMode: 'fixed',
    durationSec: 2700
  });
  assert.equal(isDefaultSittingRecipe(recipe), false);
  assert.equal(plan.source, 'official');
  assert.equal(plan.soundId, 'the-inner-sound');
  assert.equal(plan.chipOverride, false);
});

test('recipe_session_started stays gated when analytics opt-in is off', () => {
  const emitted = [];
  const storage = {
    getItem() {
      return null;
    }
  };
  const plan = resolveSittingSessionPlan({
    recipe: createDefaultSittingRecipe(),
    focusMode: 'fixed',
    durationSec: 600
  });
  const ok = emitRecipeSessionStarted(plan, {
    storage,
    sink: (name, props) => emitted.push({ name, props })
  });
  assert.equal(ok, false);
  assert.equal(emitted.length, 0);
});

test('main sit path reads recipe and still writes duration pref, not recipe, on chip', () => {
  assert.match(mainSrc, /resolveSittingSessionPlan/);
  assert.match(mainSrc, /readRitualRecipe/);
  assert.match(mainSrc, /startSittingMusic\(\{\s*recipeSoundId: sittingPlan\.soundId/);
  assert.match(mainSrc, /savePreferredFocusDurationMinutes\(minutes\)/);
  assert.equal(/onDurationSelected:[\s\S]*?writeRitualRecipe/.test(mainSrc), false);
});
