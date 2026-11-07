/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T77 — practice config signature (official template id or custom recipe fingerprint).
 */

import { resolveOfficialTemplateIdForRecipe } from './ritualRecipe/officialSittingTemplateSelection.js';

/**
 * @param {import('./ritualRecipe/ritualRecipeSchema.js').RitualRecipe | null | undefined} recipe
 * @returns {string}
 */
function hashCustomRecipeFields(recipe) {
  if (!recipe) return 'empty';
  const focus = recipe.moments?.focus;
  return [
    recipe.soundId ?? '',
    recipe.roomId ?? '',
    focus?.mode ?? '',
    focus?.durationSec ?? '',
    focus?.promptId ?? '',
    recipe.moments?.arrive?.promptId ?? '',
    recipe.moments?.transition?.promptId ?? '',
    recipe.moments?.reflect?.promptId ?? ''
  ].join('|');
}

/**
 * @param {import('./ritualRecipe/ritualRecipeSchema.js').RitualRecipe | null | undefined} recipe
 * @returns {{
 *   signature: string,
 *   templateId: string | null,
 *   recipeSnapshot: import('./ritualRecipe/ritualRecipeSchema.js').RitualRecipe | null
 * }}
 */
export function buildPracticeConfigSignature(recipe) {
  const templateId = resolveOfficialTemplateIdForRecipe(recipe);
  if (templateId) {
    return {
      signature: `tmpl:${templateId}`,
      templateId,
      recipeSnapshot: null
    };
  }
  const custom = hashCustomRecipeFields(recipe);
  return {
    signature: `custom:${custom}`,
    templateId: null,
    recipeSnapshot: recipe ?? null
  };
}

/**
 * @param {string} signature
 * @returns {boolean}
 */
export function practiceConfigSignatureBannedTimeWords(signature) {
  return /\b(evening|night|morning|晚间|夜晚|夜の|朝の)\b/i.test(signature);
}
