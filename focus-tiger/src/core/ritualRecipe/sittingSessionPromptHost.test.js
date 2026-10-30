/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultSittingRecipe } from './ritualRecipeSchema.js';
import { writeRitualRecipe } from './ritualRecipeStore.js';
import {
  clearActiveSittingPromptBindings,
  getActiveRecipePromptBinding,
  setActiveSittingPromptBindings,
  syncSittingPromptBindingsFromStoredRecipe
} from './sittingSessionPromptHost.js';
import {
  OFFICIAL_SITTING_TEMPLATE_ID,
  OFFICIAL_SITTING_TEMPLATES
} from './officialSittingTemplates.js';

test('sync from storage applies Evening reflect binding', () => {
  const storage = {
    /** @type {Record<string, string>} */
    data: {},
    getItem(key) {
      return this.data[key] ?? null;
    },
    setItem(key, value) {
      this.data[key] = value;
    }
  };
  clearActiveSittingPromptBindings();
  const evening =
    OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.EVENING];
  writeRitualRecipe(
    {
      ...createDefaultSittingRecipe(),
      authorType: 'official',
      title: evening.title,
      soundId: evening.soundId,
      moments: {
        ...createDefaultSittingRecipe().moments,
        ...evening.moments,
        recover: { cooldownSec: 180 }
      }
    },
    storage
  );
  storage.data['focus-tiger.focus-duration-pref.v1'] = JSON.stringify({
    minutes: 10,
    mode: 'fixed'
  });
  syncSittingPromptBindingsFromStoredRecipe(storage);
  const reflect = getActiveRecipePromptBinding('reflect');
  assert.equal(reflect?.kind, 'localeKeys');
  clearActiveSittingPromptBindings();
});

test('setActive clears prior bindings', () => {
  setActiveSittingPromptBindings({
    arrive: { kind: 'localeKey', key: 'RITUAL_RECIPE_PROMPT_ARRIVE_DEEP_QUIET' },
    focus: null,
    transition: null,
    reflect: null
  });
  assert.ok(getActiveRecipePromptBinding('arrive'));
  clearActiveSittingPromptBindings();
  assert.equal(getActiveRecipePromptBinding('arrive'), null);
});
