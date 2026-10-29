/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Session-scoped ritual recipe prompt bindings (A1c runtime host).
 * Set at Arrival / beginFocus from `SittingSessionPlan.promptBinding`; cleared on Rise.
 */

import {
  FOCUS_DURATION_MODE_OPEN,
  loadPreferredFocusDurationMinutes,
  loadPreferredFocusDurationMode
} from '../focusDuration.js';
import { readRitualRecipe } from './ritualRecipeStore.js';
import { resolveSittingSessionPlan } from './sittingSessionPlan.js';

/** @typedef {import('./ritualRecipePromptBinding.js').RitualRecipePromptBinding} RitualRecipePromptBinding */

/**
 * @typedef {{
 *   arrive: RitualRecipePromptBinding | null,
 *   focus: RitualRecipePromptBinding | null,
 *   transition: RitualRecipePromptBinding | null,
 *   reflect: RitualRecipePromptBinding | null
 * }} SittingPromptBindingMap
 */

/** @type {SittingPromptBindingMap | null} */
let activeBindings = null;

/**
 * @param {SittingPromptBindingMap | null | undefined} bindings
 */
export function setActiveSittingPromptBindings(bindings) {
  if (!bindings) {
    activeBindings = null;
    return;
  }
  activeBindings = {
    arrive: bindings.arrive ?? null,
    focus: bindings.focus ?? null,
    transition: bindings.transition ?? null,
    reflect: bindings.reflect ?? null
  };
}

export function clearActiveSittingPromptBindings() {
  activeBindings = null;
}

/**
 * @param {'arrive' | 'focus' | 'transition' | 'reflect'} moment
 * @returns {RitualRecipePromptBinding | null}
 */
export function getActiveRecipePromptBinding(moment) {
  return activeBindings?.[moment] ?? null;
}

/**
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./sittingSessionPlan.js').SittingSessionPlan}
 */
export function syncSittingPromptBindingsFromStoredRecipe(storage) {
  const recipe = readRitualRecipe(storage);
  const mode = loadPreferredFocusDurationMode(storage);
  const minutes = loadPreferredFocusDurationMinutes(storage);
  const plan = resolveSittingSessionPlan({
    recipe,
    focusMode:
      mode === FOCUS_DURATION_MODE_OPEN ? FOCUS_DURATION_MODE_OPEN : 'fixed',
    durationSec:
      mode === FOCUS_DURATION_MODE_OPEN ? null : Math.round(minutes * 60)
  });
  setActiveSittingPromptBindings(plan.promptBinding);
  return plan;
}
