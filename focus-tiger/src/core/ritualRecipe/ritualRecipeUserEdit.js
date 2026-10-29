/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * User edits to ritual-recipe.v1 (A2).
 * @see docs/task-briefs/task-ritual-recipe-a2-edit-my-recipe.md
 */

import {
  savePreferredFocusDurationMinutes,
  savePreferredOpenEndedFocus
} from '../focusDuration.js';
import {
  RITUAL_RECIPE_PROMPT_IDS,
  RITUAL_RECIPE_SOUND_IDS
} from './ritualRecipeAssets.js';
import {
  RECIPE_ANALYTICS_EVENTS,
  trackRecipeEvent
} from './recipeAnalytics.js';
import {
  clampFocusDurationSec,
  createDefaultSittingRecipe,
  FOCUS_DURATION_SEC_CHIPS,
  generateRitualRecipeId,
  normalizeRitualRecipe
} from './ritualRecipeSchema.js';
import { readRitualRecipe, writeRitualRecipe } from './ritualRecipeStore.js';

/** @type {readonly ('arrive' | 'focus' | 'transition' | 'reflect')[]} */
export const RITUAL_RECIPE_EDITABLE_MOMENT_IDS = Object.freeze([
  'arrive',
  'focus',
  'transition',
  'reflect'
]);

/**
 * @param {'arrive' | 'focus' | 'transition' | 'reflect'} momentId
 * @returns {readonly string[]}
 */
export function listPromptIdsForMoment(momentId) {
  const prefix =
    momentId === 'arrive'
      ? 'arrive.'
      : momentId === 'focus'
        ? 'focus.'
        : momentId === 'transition'
          ? 'transition.'
          : 'reflect.';
  return RITUAL_RECIPE_PROMPT_IDS.filter((id) => id.startsWith(prefix));
}

export { RITUAL_RECIPE_SOUND_IDS };

/**
 * @param {import('./ritualRecipeSchema.js').RitualRecipe} recipe
 * @returns {import('./ritualRecipeSchema.js').RitualRecipe}
 */
export function forkOfficialRecipeForUserEdit(recipe) {
  if (recipe.authorType === 'user') return recipe;
  return normalizeRitualRecipe({
    ...recipe,
    id: generateRitualRecipeId(),
    authorType: 'user',
    title: recipe.title || 'My sitting'
  });
}

/**
 * @param {import('./ritualRecipeSchema.js').RitualRecipe} recipe
 * @param {Storage | null | undefined} storage
 */
function syncFocusPrefFromRecipe(recipe, storage) {
  const focus = recipe.moments.focus;
  if (focus.mode === 'open') {
    savePreferredOpenEndedFocus(storage);
    return;
  }
  const minutes = Math.round(focus.durationSec / 60);
  savePreferredFocusDurationMinutes(minutes, storage);
}

/**
 * @param {string[]} fields
 * @param {Storage | null | undefined} storage
 */
function emitEdited(fields, storage) {
  trackRecipeEvent(
    RECIPE_ANALYTICS_EVENTS.EDITED,
    { fields_changed: fields },
    { storage }
  );
}

/**
 * @param {'moment' | 'all'} scope
 * @param {Storage | null | undefined} storage
 */
function emitReset(scope, storage) {
  trackRecipeEvent(
    RECIPE_ANALYTICS_EVENTS.RESET_DEFAULT,
    { scope },
    { storage }
  );
}

/**
 * @typedef {{
 *   focusMinutes?: number | 'open',
 *   soundId?: string | null,
 *   momentPrompt?: { momentId: 'arrive' | 'focus' | 'transition' | 'reflect', promptId: string | null }
 * }} RitualRecipeUserEditPatch
 */

/**
 * @param {RitualRecipeUserEditPatch} patch
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./ritualRecipeSchema.js').RitualRecipe | null}
 */
export function applyUserRecipeEdit(patch, storage) {
  const prior = readRitualRecipe(storage);
  let recipe = forkOfficialRecipeForUserEdit(prior);
  /** @type {string[]} */
  const fieldsChanged = [];

  if (patch.focusMinutes !== undefined) {
    if (patch.focusMinutes === 'open') {
      recipe = normalizeRitualRecipe({
        ...recipe,
        moments: {
          ...recipe.moments,
          focus: {
            ...recipe.moments.focus,
            mode: 'open',
            durationSec: FOCUS_DURATION_SEC_CHIPS[0]
          }
        }
      });
    } else {
      const sec = clampFocusDurationSec(Number(patch.focusMinutes) * 60);
      recipe = normalizeRitualRecipe({
        ...recipe,
        moments: {
          ...recipe.moments,
          focus: {
            ...recipe.moments.focus,
            mode: 'fixed',
            durationSec: sec
          }
        }
      });
    }
    syncFocusPrefFromRecipe(recipe, storage);
    fieldsChanged.push('focus_duration');
  }

  if (patch.soundId !== undefined) {
    recipe = normalizeRitualRecipe({
      ...recipe,
      soundId: patch.soundId
    });
    fieldsChanged.push('sound');
  }

  if (patch.momentPrompt) {
    const { momentId, promptId } = patch.momentPrompt;
    if (!RITUAL_RECIPE_EDITABLE_MOMENT_IDS.includes(momentId)) {
      return null;
    }
    if (momentId === 'focus') {
      recipe = normalizeRitualRecipe({
        ...recipe,
        moments: {
          ...recipe.moments,
          focus: { ...recipe.moments.focus, promptId }
        }
      });
    } else {
      recipe = normalizeRitualRecipe({
        ...recipe,
        moments: {
          ...recipe.moments,
          [momentId]: { promptId }
        }
      });
    }
    fieldsChanged.push('prompt');
  }

  if (!fieldsChanged.length) return recipe;

  writeRitualRecipe(recipe, storage);
  emitEdited(fieldsChanged, storage);
  return recipe;
}

/**
 * @param {'arrive' | 'focus' | 'transition' | 'reflect'} momentId
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./ritualRecipeSchema.js').RitualRecipe | null}
 */
export function resetUserRecipeMoment(momentId, storage) {
  if (!RITUAL_RECIPE_EDITABLE_MOMENT_IDS.includes(momentId)) return null;
  const defaults = createDefaultSittingRecipe();
  const prior = readRitualRecipe(storage);
  let recipe = forkOfficialRecipeForUserEdit(prior);

  if (momentId === 'focus') {
    recipe = normalizeRitualRecipe({
      ...recipe,
      moments: {
        ...recipe.moments,
        focus: { ...defaults.moments.focus }
      }
    });
    syncFocusPrefFromRecipe(recipe, storage);
  } else {
    recipe = normalizeRitualRecipe({
      ...recipe,
      moments: {
        ...recipe.moments,
        [momentId]: { ...defaults.moments[momentId] }
      }
    });
  }

  writeRitualRecipe(recipe, storage);
  emitReset('moment', storage);
  return recipe;
}

/**
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./ritualRecipeSchema.js').RitualRecipe}
 */
export function resetUserRecipeToDefaultSitting(storage) {
  const prior = readRitualRecipe(storage);
  const next = normalizeRitualRecipe({
    ...createDefaultSittingRecipe(),
    id: prior.id,
    locale: prior.locale === 'ja' ? 'ja' : 'en'
  });
  writeRitualRecipe(next, storage);
  syncFocusPrefFromRecipe(next, storage);
  emitReset('all', storage);
  return next;
}
