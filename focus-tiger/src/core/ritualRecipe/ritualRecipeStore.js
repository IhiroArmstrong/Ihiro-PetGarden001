/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Local current ritual recipe. Independent of practice backup.
 */

import {
  createDefaultSittingRecipe,
  migrateAndNormalizeRecipe,
  normalizeRitualRecipe
} from './ritualRecipeSchema.js';

export const RITUAL_RECIPE_STORAGE_KEY = 'focus-tiger.ritual-recipe.v1';

/**
 * @param {unknown} storage
 * @returns {Storage | null}
 */
function resolveStorage(storage) {
  if (storage && typeof storage.getItem === 'function') {
    return /** @type {Storage} */ (storage);
  }
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./ritualRecipeSchema.js').RitualRecipe}
 */
export function readRitualRecipe(storage) {
  const store = resolveStorage(storage);
  if (!store) return createDefaultSittingRecipe();
  try {
    const raw = store.getItem(RITUAL_RECIPE_STORAGE_KEY);
    if (!raw) return createDefaultSittingRecipe();
    const parsed = JSON.parse(raw);
    const result = migrateAndNormalizeRecipe(parsed, {
      regenerateId: false,
      forceUserAuthor: false
    });
    if (!result.ok || !result.recipe) return createDefaultSittingRecipe();
    return result.recipe;
  } catch {
    return createDefaultSittingRecipe();
  }
}

/**
 * @param {unknown} recipe
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./ritualRecipeSchema.js').RitualRecipe}
 */
export function writeRitualRecipe(recipe, storage) {
  const normalized = normalizeRitualRecipe(
    /** @type {import('./ritualRecipeSchema.js').RitualRecipe} */ (recipe)
  );
  const store = resolveStorage(storage);
  if (!store) return normalized;
  try {
    const next = JSON.stringify(normalized);
    if (store.getItem(RITUAL_RECIPE_STORAGE_KEY) === next) return normalized;
    store.setItem(RITUAL_RECIPE_STORAGE_KEY, next);
  } catch {
    // ignore quota / private mode
  }
  return normalized;
}
