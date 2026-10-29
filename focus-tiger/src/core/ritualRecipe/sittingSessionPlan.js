/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Map the current recipe + this-session Focus chip onto a sit plan.
 * Default sitting must equal the pre-recipe path: chip/pref still win,
 * null soundId does not override ambient, Recover stays 180s.
 */

import { isAllowedSoundId } from './ritualRecipeAssets.js';
import {
  RECIPE_ANALYTICS_EVENTS,
  trackRecipeEvent
} from './recipeAnalytics.js';
import { RECOVER_COOLDOWN_SEC } from './ritualRecipeSchema.js';
import {
  OFFICIAL_SITTING_TEMPLATE_ID,
  OFFICIAL_SITTING_TEMPLATES
} from './officialSittingTemplates.js';

/**
 * @typedef {{
 *   source: 'default' | 'official' | 'custom' | 'imported',
 *   focusMode: 'fixed' | 'open',
 *   durationSec: number | null,
 *   chipOverride: boolean,
 *   soundId: string | null,
 *   roomId: string,
 *   recoverCooldownSec: number,
 *   promptId: {
 *     arrive: string | null,
 *     focus: string | null,
 *     transition: string | null,
 *     reflect: string | null
 *   }
 * }} SittingSessionPlan
 */

/**
 * @param {import('./ritualRecipeSchema.js').RitualRecipe | null | undefined} recipe
 * @returns {boolean}
 */
export function isDefaultSittingRecipe(recipe) {
  const d = OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT];
  return (
    !!recipe &&
    recipe.authorType === 'official' &&
    recipe.soundId == null &&
    recipe.roomId === d.roomId &&
    recipe.moments?.focus?.mode === 'fixed' &&
    recipe.moments?.focus?.durationSec === d.moments.focus.durationSec &&
    recipe.moments?.focus?.promptId == null &&
    recipe.moments?.arrive?.promptId == null &&
    recipe.moments?.transition?.promptId == null &&
    recipe.moments?.reflect?.promptId == null &&
    recipe.moments?.recover?.cooldownSec === d.moments.recover.cooldownSec
  );
}

/**
 * @param {{
 *   recipe: import('./ritualRecipeSchema.js').RitualRecipe,
 *   focusMode: 'fixed' | 'open',
 *   durationSec?: number | null
 * }} input
 * @returns {SittingSessionPlan}
 */
export function resolveSittingSessionPlan({
  recipe,
  focusMode,
  durationSec = null
}) {
  const mode = focusMode === 'open' ? 'open' : 'fixed';
  const recipeMode = recipe?.moments?.focus?.mode === 'open' ? 'open' : 'fixed';
  const recipeSec = Number(recipe?.moments?.focus?.durationSec);
  const sessionSec =
    mode === 'open'
      ? null
      : Number.isFinite(Number(durationSec))
        ? Number(durationSec)
        : recipeSec;
  const chipOverride =
    mode !== recipeMode ||
    (mode === 'fixed' && sessionSec !== recipeSec);
  const rawSound = recipe?.soundId ?? null;
  const soundId =
    typeof rawSound === 'string' && isAllowedSoundId(rawSound) ? rawSound : null;

  /** @type {SittingSessionPlan['source']} */
  let source = 'custom';
  if (isDefaultSittingRecipe(recipe)) source = 'default';
  else if (recipe?.authorType === 'official') source = 'official';

  return {
    source,
    focusMode: mode,
    durationSec: sessionSec,
    chipOverride,
    soundId,
    roomId: recipe?.roomId || OFFICIAL_SITTING_TEMPLATES[OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT].roomId,
    recoverCooldownSec: Number.isFinite(Number(recipe?.moments?.recover?.cooldownSec))
      ? Number(recipe.moments.recover.cooldownSec)
      : RECOVER_COOLDOWN_SEC,
    promptId: {
      arrive: recipe?.moments?.arrive?.promptId ?? null,
      focus: recipe?.moments?.focus?.promptId ?? null,
      transition: recipe?.moments?.transition?.promptId ?? null,
      reflect: recipe?.moments?.reflect?.promptId ?? null
    }
  };
}

/**
 * @param {SittingSessionPlan} plan
 * @param {{ storage?: Storage | null, sink?: (name: string, props: Record<string, unknown>) => void }} [options]
 * @returns {boolean}
 */
export function emitRecipeSessionStarted(plan, options = {}) {
  return trackRecipeEvent(
    RECIPE_ANALYTICS_EVENTS.SESSION_STARTED,
    {
      source: plan.source,
      focus_mode: plan.focusMode,
      chip_override: plan.chipOverride
    },
    options
  );
}
