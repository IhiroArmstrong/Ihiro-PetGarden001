/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Runtime map: catalog `promptId` → locale key(s) or COPY_POOL key.
 * Whitelist ids without an entry here resolve to null (Default moment behavior).
 * @see docs/ritual-recipe-asset-catalog-v0.md
 */

import { isAllowedPromptId } from './ritualRecipeAssets.js';

/**
 * @typedef {{ kind: 'localeKey', key: string }} RitualRecipeLocaleKeyBinding
 * @typedef {{ kind: 'pool', poolKey: string }} RitualRecipePoolBinding
 * @typedef {{ kind: 'localeKeys', keys: [string, string, string] }} RitualRecipeReflectBinding
 * @typedef {RitualRecipeLocaleKeyBinding | RitualRecipePoolBinding | RitualRecipeReflectBinding} RitualRecipePromptBinding
 */

/** @type {Readonly<Record<string, RitualRecipePromptBinding>>} */
export const RITUAL_RECIPE_WIRED_PROMPT_BINDINGS = Object.freeze({
  'arrive.deep.quiet': Object.freeze({
    kind: 'localeKey',
    key: 'RITUAL_RECIPE_PROMPT_ARRIVE_DEEP_QUIET'
  }),
  'arrive.evening.soft': Object.freeze({
    kind: 'localeKey',
    key: 'RITUAL_RECIPE_PROMPT_ARRIVE_EVENING_SOFT'
  }),
  'focus.deep.hold': Object.freeze({
    kind: 'pool',
    poolKey: 'RITUAL_RECIPE_FOCUS_DEEP_HOLD'
  }),
  'transition.deep.return': Object.freeze({
    kind: 'localeKey',
    key: 'RITUAL_RECIPE_PROMPT_TRANSITION_DEEP_RETURN'
  }),
  'transition.evening.rest': Object.freeze({
    kind: 'localeKey',
    key: 'RITUAL_RECIPE_PROMPT_TRANSITION_EVENING_REST'
  }),
  'reflect.deep.note': Object.freeze({
    kind: 'localeKeys',
    keys: Object.freeze([
      'RITUAL_RECIPE_PROMPT_REFLECT_DEEP_Q1',
      'RITUAL_RECIPE_PROMPT_REFLECT_DEEP_Q2',
      'RITUAL_RECIPE_PROMPT_REFLECT_DEEP_Q3'
    ])
  }),
  'reflect.evening.close': Object.freeze({
    kind: 'localeKeys',
    keys: Object.freeze([
      'RITUAL_RECIPE_PROMPT_REFLECT_EVENING_Q1',
      'RITUAL_RECIPE_PROMPT_REFLECT_EVENING_Q2',
      'RITUAL_RECIPE_PROMPT_REFLECT_EVENING_Q3'
    ])
  })
});

/**
 * @param {unknown} promptId
 * @returns {RitualRecipePromptBinding | null}
 */
export function resolveRecipePromptBinding(promptId) {
  if (promptId == null) return null;
  if (typeof promptId !== 'string' || !isAllowedPromptId(promptId)) return null;
  return RITUAL_RECIPE_WIRED_PROMPT_BINDINGS[promptId] ?? null;
}

/**
 * @param {{
 *   arrive?: string | null,
 *   focus?: string | null,
 *   transition?: string | null,
 *   reflect?: string | null
 * }} promptIds
 * @returns {{
 *   arrive: RitualRecipePromptBinding | null,
 *   focus: RitualRecipePromptBinding | null,
 *   transition: RitualRecipePromptBinding | null,
 *   reflect: RitualRecipePromptBinding | null
 * }}
 */
export function resolveRecipePromptBindingsForMoments(promptIds) {
  return {
    arrive: resolveRecipePromptBinding(promptIds.arrive ?? null),
    focus: resolveRecipePromptBinding(promptIds.focus ?? null),
    transition: resolveRecipePromptBinding(promptIds.transition ?? null),
    reflect: resolveRecipePromptBinding(promptIds.reflect ?? null)
  };
}
