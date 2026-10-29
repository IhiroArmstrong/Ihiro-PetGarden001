/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveRecipePromptBinding,
  RITUAL_RECIPE_WIRED_PROMPT_BINDINGS
} from './ritualRecipePromptBinding.js';
import { OFFICIAL_SITTING_TEMPLATES, OFFICIAL_SITTING_TEMPLATE_ID } from './officialSittingTemplates.js';
import { resolveSittingSessionPlan } from './sittingSessionPlan.js';
import { createDefaultSittingRecipe } from './ritualRecipeSchema.js';

test('whitelist spec placeholders stay unwired at runtime', () => {
  assert.equal(resolveRecipePromptBinding('arrive.soft'), null);
  assert.equal(resolveRecipePromptBinding('transition.hand'), null);
  assert.equal(resolveRecipePromptBinding('reflect.line'), null);
});

test('Deep and Evening catalog ids resolve bindings', () => {
  assert.equal(
    resolveRecipePromptBinding('arrive.deep.quiet')?.kind,
    'localeKey'
  );
  assert.equal(
    resolveRecipePromptBinding('focus.deep.hold')?.poolKey,
    'RITUAL_RECIPE_FOCUS_DEEP_HOLD'
  );
  assert.equal(
    resolveRecipePromptBinding('reflect.evening.close')?.keys?.length,
    3
  );
});

test('unknown prompt id resolves null without throwing', () => {
  assert.equal(resolveRecipePromptBinding('not-in-catalog'), null);
  assert.equal(resolveRecipePromptBinding(null), null);
});

test('Deep official template plan carries wired prompt bindings', () => {
  const deep = OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.DEEP];
  const recipe = {
    ...createDefaultSittingRecipe(),
    authorType: 'official',
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
  assert.ok(plan.promptBinding.arrive);
  assert.ok(plan.promptBinding.focus);
  assert.equal(plan.promptBinding.arrive?.kind, 'localeKey');
  assert.equal(
    plan.promptBinding.arrive?.key,
    RITUAL_RECIPE_WIRED_PROMPT_BINDINGS['arrive.deep.quiet'].key
  );
});

test('Default sitting plan keeps null prompt bindings', () => {
  const plan = resolveSittingSessionPlan({
    recipe: createDefaultSittingRecipe(),
    focusMode: 'fixed',
    durationSec: 600
  });
  assert.equal(plan.promptBinding.arrive, null);
  assert.equal(plan.promptBinding.focus, null);
  assert.equal(plan.promptBinding.transition, null);
  assert.equal(plan.promptBinding.reflect, null);
});
