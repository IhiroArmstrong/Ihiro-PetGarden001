/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Select and persist official sitting templates (A4).
 * @see docs/task-briefs/task-ritual-recipe-a4-official-templates.md
 */

import {
  savePreferredFocusDurationMinutes,
  savePreferredOpenEndedFocus
} from '../focusDuration.js';
import {
  OFFICIAL_SITTING_TEMPLATE_ID,
  OFFICIAL_SITTING_TEMPLATES
} from './officialSittingTemplates.js';
import {
  normalizeRitualRecipe,
  RITUAL_RECIPE_SCHEMA_VERSION
} from './ritualRecipeSchema.js';
import { readRitualRecipe, writeRitualRecipe } from './ritualRecipeStore.js';
import { isDefaultSittingRecipe } from './sittingSessionPlan.js';

/** @type {readonly string[]} */
export const SELECTABLE_OFFICIAL_SITTING_TEMPLATE_IDS = Object.freeze([
  OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT,
  OFFICIAL_SITTING_TEMPLATE_ID.DEEP,
  OFFICIAL_SITTING_TEMPLATE_ID.ADHD,
  OFFICIAL_SITTING_TEMPLATE_ID.EVENING
]);

/**
 * @param {import('./officialSittingTemplates.js').OfficialSittingTemplate} template
 * @param {import('./ritualRecipeSchema.js').RitualRecipe} recipe
 * @returns {boolean}
 */
export function recipeMatchesOfficialTemplate(template, recipe) {
  if (!recipe || recipe.authorType !== 'official') return false;
  if (template.templateId === OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT) {
    return isDefaultSittingRecipe(recipe);
  }
  const focus = recipe.moments?.focus;
  const tFocus = template.moments.focus;
  return (
    recipe.soundId === template.soundId &&
    recipe.roomId === template.roomId &&
    focus?.mode === tFocus.mode &&
    focus?.durationSec === tFocus.durationSec &&
    (recipe.moments?.arrive?.promptId ?? null) ===
      (template.moments.arrive.promptId ?? null) &&
    (focus?.promptId ?? null) === (tFocus.promptId ?? null) &&
    (recipe.moments?.transition?.promptId ?? null) ===
      (template.moments.transition.promptId ?? null) &&
    (recipe.moments?.reflect?.promptId ?? null) ===
      (template.moments.reflect.promptId ?? null)
  );
}

/**
 * @param {import('./ritualRecipeSchema.js').RitualRecipe | null | undefined} recipe
 * @returns {string | null}
 */
export function resolveOfficialTemplateIdForRecipe(recipe) {
  if (!recipe) return OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT;
  for (const templateId of SELECTABLE_OFFICIAL_SITTING_TEMPLATE_IDS) {
    const template = OFFICIAL_SITTING_TEMPLATES[templateId];
    if (template && recipeMatchesOfficialTemplate(template, recipe)) {
      return templateId;
    }
  }
  return null;
}

/**
 * @param {string} templateId
 * @param {import('./ritualRecipeSchema.js').RitualRecipe} prior
 * @returns {import('./ritualRecipeSchema.js').RitualRecipe}
 */
export function buildRecipeFromOfficialTemplate(templateId, prior) {
  const template = OFFICIAL_SITTING_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`unknown_official_template:${templateId}`);
  }
  return normalizeRitualRecipe({
    schemaVersion: RITUAL_RECIPE_SCHEMA_VERSION,
    id: prior.id,
    title: template.title,
    locale: prior.locale === 'ja' ? 'ja' : 'en',
    authorType: 'official',
    companion: 'yin',
    soundId: template.soundId,
    roomId: template.roomId,
    moments: {
      arrive: { promptId: template.moments.arrive.promptId },
      focus: {
        durationSec: template.moments.focus.durationSec,
        mode: template.moments.focus.mode,
        promptId: template.moments.focus.promptId
      },
      recover: { cooldownSec: template.moments.recover.cooldownSec },
      transition: { promptId: template.moments.transition.promptId },
      reflect: { promptId: template.moments.reflect.promptId }
    },
    notes: '',
    share: { enabled: false, visibility: 'private' },
    moderation: { status: 'draft' }
  });
}

/**
 * @param {string} templateId
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./ritualRecipeSchema.js').RitualRecipe | null}
 */
export function applyOfficialSittingTemplate(templateId, storage) {
  if (!SELECTABLE_OFFICIAL_SITTING_TEMPLATE_IDS.includes(templateId)) {
    return null;
  }
  const prior = readRitualRecipe(storage);
  const next = buildRecipeFromOfficialTemplate(templateId, prior);
  writeRitualRecipe(next, storage);
  const template = OFFICIAL_SITTING_TEMPLATES[templateId];
  const minutes = Math.round(template.moments.focus.durationSec / 60);
  if (template.moments.focus.mode === 'open') {
    savePreferredOpenEndedFocus(storage);
  } else {
    savePreferredFocusDurationMinutes(minutes, storage);
  }
  return next;
}
