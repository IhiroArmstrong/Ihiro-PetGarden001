/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T77 — continue slot read model (no DOM).
 */

import {
  FOCUS_DURATION_MODE_FIXED,
  FOCUS_DURATION_MODE_OPEN,
  loadPreferredFocusDurationMinutes,
  normalizeFocusDurationMinutes
} from './focusDuration.js';
import { OFFICIAL_SITTING_TEMPLATE_ID } from './ritualRecipe/officialSittingTemplates.js';
import { resolveStablePracticeConfigForContinue } from './stablePracticeConfigPrefs.js';
import {
  readStableFocusMinutesDim,
  resolveStableFocusFixedMinutes
} from './stablePrefsStore.js';
import { applyOfficialSittingTemplate } from './ritualRecipe/officialSittingTemplateSelection.js';
import { writeRitualRecipe } from './ritualRecipe/ritualRecipeStore.js';

/** @type {Readonly<Record<string, string>>} */
export const OFFICIAL_TEMPLATE_LABEL_KEYS = Object.freeze({
  [OFFICIAL_SITTING_TEMPLATE_ID.DEFAULT]: 'RITUAL_SITTING_TEMPLATE_DEFAULT',
  [OFFICIAL_SITTING_TEMPLATE_ID.DEEP]: 'RITUAL_SITTING_TEMPLATE_DEEP',
  [OFFICIAL_SITTING_TEMPLATE_ID.ADHD]: 'RITUAL_SITTING_TEMPLATE_ADHD',
  [OFFICIAL_SITTING_TEMPLATE_ID.EVENING]: 'RITUAL_SITTING_TEMPLATE_EVENING'
});

/** Banned as sit-config copy in continue slot (v1 zero time-of-day words). */
export const CONTINUE_SLOT_BANNED_SUBSTRINGS = Object.freeze([
  'evening',
  'night',
  'morning',
  '晚间',
  '夜晚',
  '夜の',
  '朝の',
  'at night',
  'early morning'
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function continueSlotCopyPassesBanlist(text) {
  const lower = String(text || '').toLowerCase();
  return !CONTINUE_SLOT_BANNED_SUBSTRINGS.some((w) => lower.includes(w.toLowerCase()));
}

/**
 * @param {Storage | null | undefined} storage
 * @param {number} [now]
 * @returns {{
 *   templateId: string | null,
 *   templateLabelKey: string | null,
 *   minutes: number,
 *   durationMode: 'fixed' | 'open',
 *   signature: string,
 *   recipeSnapshot: import('./ritualRecipe/ritualRecipeSchema.js').RitualRecipe | null
 * } | null}
 */
export function resolveCoPracticeContinueSlot(storage, now = Date.now()) {
  const config = resolveStablePracticeConfigForContinue(storage, now);
  if (!config?.signature) return null;
  if (config.templateId === OFFICIAL_SITTING_TEMPLATE_ID.EVENING) {
    return null;
  }

  const stableFocusFixed = resolveStableFocusFixedMinutes(storage, now);
  const focusDim = readStableFocusMinutesDim(storage, now);
  /** @type {'fixed' | 'open'} */
  let durationMode = FOCUS_DURATION_MODE_FIXED;
  let minutes = stableFocusFixed ?? loadPreferredFocusDurationMinutes(storage);
  if (focusDim?.kind === FOCUS_DURATION_MODE_OPEN) {
    durationMode = FOCUS_DURATION_MODE_OPEN;
    minutes = normalizeFocusDurationMinutes(focusDim.minutes);
  } else if (stableFocusFixed != null) {
    minutes = stableFocusFixed;
  }

  const templateId = config.templateId;
  const templateLabelKey =
    templateId && OFFICIAL_TEMPLATE_LABEL_KEYS[templateId]
      ? OFFICIAL_TEMPLATE_LABEL_KEYS[templateId]
      : null;

  return {
    templateId,
    templateLabelKey,
    minutes: normalizeFocusDurationMinutes(minutes),
    durationMode,
    signature: config.signature,
    recipeSnapshot: config.recipeSnapshot ?? null
  };
}

/**
 * @param {NonNullable<ReturnType<typeof resolveCoPracticeContinueSlot>>} model
 * @param {Storage | null | undefined} storage
 */
export function applyCoPracticeContinueSlotConfig(model, storage) {
  if (model.templateId) {
    applyOfficialSittingTemplate(model.templateId, storage);
  } else if (model.recipeSnapshot) {
    writeRitualRecipe(model.recipeSnapshot, storage);
  }
}
