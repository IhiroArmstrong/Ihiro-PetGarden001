/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { isAllowedPromptId, isAllowedSoundId } from './ritualRecipeAssets.js';
import { createDefaultSittingRecipe } from './ritualRecipeSchema.js';
import {
  OFFICIAL_SITTING_TEMPLATE_ID,
  OFFICIAL_SITTING_TEMPLATES
} from './officialSittingTemplates.js';

function collectPromptIds(template) {
  return [
    template.moments.arrive.promptId,
    template.moments.focus.promptId,
    template.moments.transition.promptId,
    template.moments.reflect.promptId
  ].filter((id) => id != null);
}

test('official Default template matches createDefaultSittingRecipe identity fields', () => {
  const recipe = createDefaultSittingRecipe();
  const d = OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT];
  assert.equal(d.soundId, recipe.soundId);
  assert.equal(d.roomId, recipe.roomId);
  assert.deepEqual(d.moments.focus, recipe.moments.focus);
  assert.deepEqual(d.moments.arrive, recipe.moments.arrive);
  assert.deepEqual(d.moments.transition, recipe.moments.transition);
  assert.deepEqual(d.moments.reflect, recipe.moments.reflect);
  assert.equal(d.moments.recover.cooldownSec, recipe.moments.recover.cooldownSec);
});

test('Deep / ADHD / Evening Focus lengths match spec §10', () => {
  assert.equal(
    OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.DEEP].moments.focus
      .durationSec,
    2700
  );
  assert.equal(
    OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.ADHD].moments.focus
      .durationSec,
    900
  );
  assert.equal(
    OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.EVENING].moments.focus
      .durationSec,
    600
  );
});

test('Evening is distinguishable from Default by sound and prompt ids', () => {
  const d = OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT];
  const e = OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.EVENING];
  assert.equal(e.moments.focus.durationSec, d.moments.focus.durationSec);
  assert.notEqual(e.soundId, d.soundId);
  assert.ok(collectPromptIds(e).length > 0);
});

test('ADHD uses fewer prompts than Deep and a stable catalog sound', () => {
  const adhd = OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.ADHD];
  const deep = OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.DEEP];
  assert.equal(collectPromptIds(adhd).length, 0);
  assert.ok(collectPromptIds(deep).length >= 3);
  assert.equal(isAllowedSoundId(adhd.soundId), true);
  assert.equal(isAllowedSoundId(deep.soundId), true);
});

test('designed prompt and sound ids are on the v0 whitelist', () => {
  for (const template of Object.values(OFFICIAL_SITTING_TEMPLATES)) {
    if (template.soundId != null) {
      assert.equal(isAllowedSoundId(template.soundId), true, template.templateId);
    }
    for (const id of collectPromptIds(template)) {
      assert.equal(isAllowedPromptId(id), true, id);
    }
  }
});
