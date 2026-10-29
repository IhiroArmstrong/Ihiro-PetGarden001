/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FOCUS_DURATION_STORAGE_KEY,
  loadPreferredFocusDurationMinutes
} from '../focusDuration.js';
import {
  OFFICIAL_SITTING_TEMPLATE_ID,
  OFFICIAL_SITTING_TEMPLATES
} from './officialSittingTemplates.js';
import {
  applyOfficialSittingTemplate,
  buildRecipeFromOfficialTemplate,
  recipeMatchesOfficialTemplate,
  resolveOfficialTemplateIdForRecipe,
  SELECTABLE_OFFICIAL_SITTING_TEMPLATE_IDS
} from './officialSittingTemplateSelection.js';
import { createDefaultSittingRecipe } from './ritualRecipeSchema.js';
import {
  readRitualRecipe,
  RITUAL_RECIPE_STORAGE_KEY,
  writeRitualRecipe
} from './ritualRecipeStore.js';

function mem() {
  /** @type {Record<string, string>} */
  const map = {};
  return {
    getItem(k) {
      return map[k] ?? null;
    },
    setItem(k, v) {
      map[k] = v;
    }
  };
}

test('four official templates are selectable in stable order', () => {
  assert.deepEqual(SELECTABLE_OFFICIAL_SITTING_TEMPLATE_IDS, [
    'official.default',
    'official.deep',
    'official.adhd',
    'official.evening'
  ]);
});

test('Default recipe resolves to official.default', () => {
  const recipe = createDefaultSittingRecipe();
  assert.equal(
    resolveOfficialTemplateIdForRecipe(recipe),
    OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT
  );
});

test('apply Deep writes recipe and 45m focus pref', () => {
  const storage = mem();
  writeRitualRecipe(createDefaultSittingRecipe(), storage);
  const next = applyOfficialSittingTemplate(
    OFFICIAL_SITTING_TEMPLATE_ID.DEEP,
    storage
  );
  assert.ok(next);
  assert.equal(
    resolveOfficialTemplateIdForRecipe(readRitualRecipe(storage)),
    OFFICIAL_SITTING_TEMPLATE_ID.DEEP
  );
  assert.equal(loadPreferredFocusDurationMinutes(storage), 45);
  assert.equal(next?.soundId, 'the-inner-sound');
  assert.equal(next?.moments.focus.durationSec, 2700);
});

test('apply ADHD writes 15m pref', () => {
  const storage = mem();
  applyOfficialSittingTemplate(OFFICIAL_SITTING_TEMPLATE_ID.ADHD, storage);
  assert.equal(loadPreferredFocusDurationMinutes(storage), 15);
});

test('custom recipe does not resolve to an official template id', () => {
  const storage = mem();
  writeRitualRecipe(
    {
      ...createDefaultSittingRecipe(),
      title: 'My tweak',
      authorType: 'user'
    },
    storage
  );
  assert.equal(resolveOfficialTemplateIdForRecipe(readRitualRecipe(storage)), null);
});

test('recipeMatchesOfficialTemplate locks Evening sound + prompts', () => {
  const prior = createDefaultSittingRecipe();
  const evening = buildRecipeFromOfficialTemplate(
    OFFICIAL_SITTING_TEMPLATE_ID.EVENING,
    prior
  );
  const template =
    OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.EVENING];
  assert.equal(recipeMatchesOfficialTemplate(template, evening), true);
  assert.equal(
    resolveOfficialTemplateIdForRecipe(evening),
    OFFICIAL_SITTING_TEMPLATE_ID.EVENING
  );
});

test('apply unknown template id is a no-op', () => {
  const storage = mem();
  writeRitualRecipe(createDefaultSittingRecipe(), storage);
  const before = storage.getItem(RITUAL_RECIPE_STORAGE_KEY);
  assert.equal(applyOfficialSittingTemplate('official.nope', storage), null);
  assert.equal(storage.getItem(RITUAL_RECIPE_STORAGE_KEY), before);
});

test('apply Default restores Default sitting identity', () => {
  const storage = mem();
  applyOfficialSittingTemplate(OFFICIAL_SITTING_TEMPLATE_ID.DEEP, storage);
  applyOfficialSittingTemplate(OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT, storage);
  assert.equal(
    resolveOfficialTemplateIdForRecipe(readRitualRecipe(storage)),
    OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT
  );
  assert.equal(loadPreferredFocusDurationMinutes(storage), 10);
  assert.equal(storage.getItem(FOCUS_DURATION_STORAGE_KEY)?.includes('"minutes":10'), true);
});
