/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { OFFICIAL_SITTING_TEMPLATE_ID } from './officialSittingTemplates.js';
import { applyOfficialSittingTemplate } from './officialSittingTemplateSelection.js';
import {
  applyUserRecipeEdit,
  forkOfficialRecipeForUserEdit,
  listPromptIdsForMoment,
  resetUserRecipeMoment,
  resetUserRecipeToDefaultSitting
} from './ritualRecipeUserEdit.js';
import { createDefaultSittingRecipe } from './ritualRecipeSchema.js';
import {
  readRitualRecipe,
  RITUAL_RECIPE_STORAGE_KEY,
  writeRitualRecipe
} from './ritualRecipeStore.js';
import {
  isDefaultSittingRecipe,
  resolveSittingSessionPlan
} from './sittingSessionPlan.js';

function memoryStorage() {
  /** @type {Record<string, string>} */
  const map = {};
  return {
    getItem: (k) => (k in map ? map[k] : null),
    setItem: (k, v) => {
      map[k] = String(v);
    },
    removeItem: (k) => {
      delete map[k];
    }
  };
}

describe('ritualRecipeUserEdit', () => {
  test('listPromptIdsForMoment filters by prefix', () => {
    assert.ok(listPromptIdsForMoment('arrive').every((id) => id.startsWith('arrive.')));
    assert.ok(listPromptIdsForMoment('focus').every((id) => id.startsWith('focus.')));
  });

  test('forkOfficialRecipeForUserEdit assigns user authorType', () => {
    const d = createDefaultSittingRecipe();
    const forked = forkOfficialRecipeForUserEdit(d);
    assert.equal(forked.authorType, 'user');
    assert.notEqual(forked.id, d.id);
  });

  test('applyUserRecipeEdit on Deep template forks and sets custom source', () => {
    const storage = memoryStorage();
    applyOfficialSittingTemplate(OFFICIAL_SITTING_TEMPLATE_ID.DEEP, storage);
    applyUserRecipeEdit({ focusMinutes: 15 }, storage);
    const recipe = readRitualRecipe(storage);
    assert.equal(recipe.authorType, 'user');
    assert.equal(recipe.moments.focus.durationSec, 900);
    const plan = resolveSittingSessionPlan({
      recipe,
      focusMode: 'fixed',
      durationSec: 900
    });
    assert.equal(plan.source, 'custom');
  });

  test('resetUserRecipeToDefaultSitting restores default sitting', () => {
    const storage = memoryStorage();
    applyOfficialSittingTemplate(OFFICIAL_SITTING_TEMPLATE_ID.EVENING, storage);
    applyUserRecipeEdit({ soundId: 'rain' }, storage);
    resetUserRecipeToDefaultSitting(storage);
    const recipe = readRitualRecipe(storage);
    assert.equal(isDefaultSittingRecipe(recipe), true);
  });

  test('resetUserRecipeMoment focus segment matches default chip', () => {
    const storage = memoryStorage();
    applyUserRecipeEdit({ focusMinutes: 45 }, storage);
    resetUserRecipeMoment('focus', storage);
    const recipe = readRitualRecipe(storage);
    assert.equal(recipe.moments.focus.durationSec, 600);
    assert.equal(recipe.moments.focus.mode, 'fixed');
  });

  test('writeRitualRecipe persists under storage key', () => {
    const storage = memoryStorage();
    writeRitualRecipe(createDefaultSittingRecipe(), storage);
    assert.ok(storage.getItem(RITUAL_RECIPE_STORAGE_KEY));
  });
});
