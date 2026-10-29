/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PRACTICE_BACKUP_EXPORT_KEYS } from '../practiceBackup/localBackupStorageRegistry.js';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from '../localStateKeys.js';
import {
  RITUAL_RECIPE_STORAGE_KEY,
  readRitualRecipe,
  writeRitualRecipe
} from './ritualRecipeStore.js';
import { RITUAL_RECIPE_ANALYTICS_OPT_IN_STORAGE_KEY } from './recipeAnalytics.js';

function mem() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

test('empty storage yields Default sitting', () => {
  const recipe = readRitualRecipe(mem());
  assert.equal(recipe.title, 'Default sitting');
  assert.equal(recipe.moments.focus.durationSec, 600);
});

test('round-trip write does not enter practice backup whitelist', () => {
  const storage = mem();
  const written = writeRitualRecipe(
    {
      ...readRitualRecipe(storage),
      title: 'My sitting',
      authorType: 'user'
    },
    storage
  );
  assert.equal(written.title, 'My sitting');
  assert.equal(readRitualRecipe(storage).title, 'My sitting');
  assert.equal(
    PRACTICE_BACKUP_EXPORT_KEYS.includes(RITUAL_RECIPE_STORAGE_KEY),
    false
  );
  assert.equal(
    PRACTICE_BACKUP_EXPORT_KEYS.includes(
      RITUAL_RECIPE_ANALYTICS_OPT_IN_STORAGE_KEY
    ),
    false
  );
  assert.ok(FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(RITUAL_RECIPE_STORAGE_KEY));
  assert.ok(
    FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(
      RITUAL_RECIPE_ANALYTICS_OPT_IN_STORAGE_KEY
    )
  );
});

test('identical JSON skip rewrite', () => {
  const storage = mem();
  let writes = 0;
  const wrapped = {
    getItem: storage.getItem,
    setItem(k, v) {
      writes += 1;
      storage.setItem(k, v);
    },
    removeItem: storage.removeItem
  };
  const first = writeRitualRecipe(readRitualRecipe(wrapped), wrapped);
  const before = writes;
  writeRitualRecipe(first, wrapped);
  assert.equal(writes, before);
});
