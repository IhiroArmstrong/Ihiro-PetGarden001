/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Ritual Recipe v1 schema: validate / normalize / migrate.
 * @see docs/RITUAL_RECIPE_A1_SPEC.md
 */

import {
  isAllowedPromptId,
  isAllowedRoomId,
  isAllowedSoundId,
  RITUAL_RECIPE_DEFAULT_ROOM_ID
} from './ritualRecipeAssets.js';

export const RITUAL_RECIPE_SCHEMA_VERSION = 1;
export const RITUAL_RECIPE_MAX_BYTES = 8192;
export const RECOVER_COOLDOWN_SEC = 180;
export const FOCUS_DURATION_SEC_CHIPS = Object.freeze([600, 900, 1500, 2700]);
export const RITUAL_RECIPE_TITLE_MAX = 40;
export const RITUAL_RECIPE_NOTES_MAX = 200;

export const RITUAL_RECIPE_REJECT = Object.freeze({
  SIZE: 'size',
  PARSE: 'parse',
  VERSION: 'version',
  STRUCTURE: 'structure',
  ASSET: 'asset'
});

/**
 * @typedef {'official' | 'guest' | 'user'} RitualRecipeAuthorType
 * @typedef {'en' | 'ja'} RitualRecipeLocale
 * @typedef {'fixed' | 'open'} RitualRecipeFocusMode
 */

/**
 * @typedef {{
 *   schemaVersion: number,
 *   id: string,
 *   title: string,
 *   locale: RitualRecipeLocale,
 *   authorType: RitualRecipeAuthorType,
 *   companion: 'yin',
 *   soundId: string | null,
 *   roomId: string,
 *   moments: {
 *     arrive: { promptId: string | null },
 *     focus: { durationSec: number, mode: RitualRecipeFocusMode, promptId: string | null },
 *     recover: { cooldownSec: number },
 *     transition: { promptId: string | null },
 *     reflect: { promptId: string | null }
 *   },
 *   notes: string,
 *   share: { enabled: boolean, visibility: 'private' },
 *   moderation: { status: 'draft' }
 * }} RitualRecipe
 */

/**
 * @typedef {{
 *   ok: boolean,
 *   reason: string | null,
 *   recipe: RitualRecipe | null,
 *   warnings: string[]
 * }} RitualRecipeValidation
 */

/**
 * @param {string} [prefix]
 * @returns {string}
 */
export function generateRitualRecipeId(prefix = 'rcp_') {
  const bytes =
    globalThis.crypto?.randomUUID?.().replace(/-/g, '') ||
    `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  return `${prefix}${bytes.slice(0, 20)}`;
}

/**
 * @returns {RitualRecipe}
 */
export function createDefaultSittingRecipe() {
  return {
    schemaVersion: RITUAL_RECIPE_SCHEMA_VERSION,
    id: generateRitualRecipeId(),
    title: 'Default sitting',
    locale: 'en',
    authorType: 'official',
    companion: 'yin',
    soundId: null,
    roomId: RITUAL_RECIPE_DEFAULT_ROOM_ID,
    moments: {
      arrive: { promptId: null },
      focus: {
        durationSec: 600,
        mode: 'fixed',
        promptId: null
      },
      recover: { cooldownSec: RECOVER_COOLDOWN_SEC },
      transition: { promptId: null },
      reflect: { promptId: null }
    },
    notes: '',
    share: { enabled: false, visibility: 'private' },
    moderation: { status: 'draft' }
  };
}

/**
 * @param {unknown} text
 * @returns {number}
 */
export function utf8ByteLength(text) {
  return new TextEncoder().encode(String(text ?? '')).length;
}

/**
 * @param {number} sec
 * @returns {number}
 */
export function clampFocusDurationSec(sec) {
  const n = Number(sec);
  if (!Number.isFinite(n)) return 600;
  let best = FOCUS_DURATION_SEC_CHIPS[0];
  let bestDist = Math.abs(n - best);
  for (const chip of FOCUS_DURATION_SEC_CHIPS) {
    const dist = Math.abs(n - chip);
    if (dist < bestDist) {
      best = chip;
      bestDist = dist;
    }
  }
  return best;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function asPlainText(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();
}

/**
 * @param {unknown} id
 * @param {string[]} warnings
 * @returns {string | null}
 */
function normalizePromptId(id, warnings) {
  if (id == null || id === '') return null;
  if (isAllowedPromptId(id)) return /** @type {string} */ (id);
  warnings.push('unknown_prompt_id');
  return null;
}

/**
 * @param {unknown} id
 * @param {string[]} warnings
 * @returns {string | null}
 */
function normalizeSoundId(id, warnings) {
  if (id == null || id === '') return null;
  if (typeof id === 'string' && id.startsWith('user-')) {
    warnings.push('user_sound_id_forbidden');
    return null;
  }
  if (isAllowedSoundId(id)) return /** @type {string} */ (id);
  warnings.push('unknown_sound_id');
  return null;
}

/**
 * @param {unknown} id
 * @param {string[]} warnings
 * @returns {string}
 */
function normalizeRoomId(id, warnings) {
  if (id == null || id === '') return RITUAL_RECIPE_DEFAULT_ROOM_ID;
  if (isAllowedRoomId(id)) return /** @type {string} */ (id);
  warnings.push('unknown_room_id');
  return RITUAL_RECIPE_DEFAULT_ROOM_ID;
}

/**
 * @param {unknown} rawMoment
 * @returns {Record<string, unknown>}
 */
function asObject(rawMoment) {
  if (!rawMoment || typeof rawMoment !== 'object' || Array.isArray(rawMoment)) {
    return {};
  }
  return /** @type {Record<string, unknown>} */ (rawMoment);
}

/**
 * Drop unknown / retired fields (spec §5.5).
 * @param {Record<string, unknown>} moment
 * @param {string[]} warnings
 * @param {string} name
 */
function noteDroppedLegacyMomentFields(moment, warnings, name) {
  if ('skippable' in moment) warnings.push(`dropped_${name}_skippable`);
  if ('durationSec' in moment && (name === 'arrive' || name === 'transition')) {
    warnings.push(`dropped_${name}_durationSec`);
  }
  if (name === 'recover' && 'promptId' in moment) {
    warnings.push('dropped_recover_promptId');
  }
  if ('soundId' in moment || 'roomId' in moment) {
    warnings.push(`dropped_${name}_per_moment_media`);
  }
}

/**
 * @param {unknown} raw
 * @param {{ regenerateId?: boolean, forceUserAuthor?: boolean }} [options]
 * @returns {RitualRecipeValidation}
 */
export function migrateAndNormalizeRecipe(raw, options = {}) {
  const warnings = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      ok: false,
      reason: RITUAL_RECIPE_REJECT.STRUCTURE,
      recipe: null,
      warnings
    };
  }
  const src = /** @type {Record<string, unknown>} */ (raw);
  const version = Number(src.schemaVersion);
  if (!Number.isFinite(version)) {
    return {
      ok: false,
      reason: RITUAL_RECIPE_REJECT.STRUCTURE,
      recipe: null,
      warnings
    };
  }
  if (version > RITUAL_RECIPE_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: RITUAL_RECIPE_REJECT.VERSION,
      recipe: null,
      warnings
    };
  }

  const momentsRaw = asObject(src.moments);
  const arriveRaw = asObject(momentsRaw.arrive);
  const focusRaw = asObject(momentsRaw.focus);
  const recoverRaw = asObject(momentsRaw.recover);
  const transitionRaw = asObject(momentsRaw.transition);
  const reflectRaw = asObject(momentsRaw.reflect);

  if (!momentsRaw.arrive || !momentsRaw.focus || !momentsRaw.recover) {
    return {
      ok: false,
      reason: RITUAL_RECIPE_REJECT.STRUCTURE,
      recipe: null,
      warnings
    };
  }
  if (!momentsRaw.transition || !momentsRaw.reflect) {
    return {
      ok: false,
      reason: RITUAL_RECIPE_REJECT.STRUCTURE,
      recipe: null,
      warnings
    };
  }

  noteDroppedLegacyMomentFields(arriveRaw, warnings, 'arrive');
  noteDroppedLegacyMomentFields(focusRaw, warnings, 'focus');
  noteDroppedLegacyMomentFields(recoverRaw, warnings, 'recover');
  noteDroppedLegacyMomentFields(transitionRaw, warnings, 'transition');
  noteDroppedLegacyMomentFields(reflectRaw, warnings, 'reflect');

  const title = asPlainText(src.title).slice(0, RITUAL_RECIPE_TITLE_MAX);
  if (!title) {
    return {
      ok: false,
      reason: RITUAL_RECIPE_REJECT.STRUCTURE,
      recipe: null,
      warnings
    };
  }

  let notes = asPlainText(src.notes).slice(0, RITUAL_RECIPE_NOTES_MAX);
  if (src.notes == null) notes = '';

  /** @type {RitualRecipeLocale} */
  let locale = 'en';
  if (src.locale === 'ja' || src.locale === 'en') {
    locale = src.locale;
  } else if (src.locale != null) {
    warnings.push('locale_clamped_en');
  }

  /** @type {RitualRecipeFocusMode} */
  let mode = focusRaw.mode === 'open' ? 'open' : 'fixed';
  let durationSec = clampFocusDurationSec(focusRaw.durationSec);
  if (mode === 'fixed') {
    const rawDur = Number(focusRaw.durationSec);
    if (
      Number.isFinite(rawDur) &&
      !FOCUS_DURATION_SEC_CHIPS.includes(/** @type {600|900|1500|2700} */ (rawDur))
    ) {
      warnings.push('focus_duration_clamped');
    }
  }

  let cooldownSec = RECOVER_COOLDOWN_SEC;
  if (
    recoverRaw.cooldownSec != null &&
    Number(recoverRaw.cooldownSec) !== RECOVER_COOLDOWN_SEC
  ) {
    warnings.push('recover_cooldown_clamped');
  } else if (
    recoverRaw.durationSec != null &&
    recoverRaw.cooldownSec == null
  ) {
    warnings.push('recover_durationSec_migrated');
    if (Number(recoverRaw.durationSec) !== RECOVER_COOLDOWN_SEC) {
      warnings.push('recover_cooldown_clamped');
    }
  }

  /** @type {RitualRecipeAuthorType} */
  let authorType = 'user';
  if (
    !options.forceUserAuthor &&
    (src.authorType === 'official' ||
      src.authorType === 'guest' ||
      src.authorType === 'user')
  ) {
    authorType = src.authorType;
  } else if (options.forceUserAuthor) {
    authorType = 'user';
  }

  const companion = src.companion === 'yin' ? 'yin' : 'yin';
  if (src.companion != null && src.companion !== 'yin') {
    warnings.push('companion_forced_yin');
  }

  const keepId =
    options.regenerateId === false &&
    typeof src.id === 'string' &&
    src.id.trim();
  const recipe = {
    schemaVersion: RITUAL_RECIPE_SCHEMA_VERSION,
    id: keepId ? src.id.trim() : generateRitualRecipeId(),
    title,
    locale,
    authorType,
    companion,
    soundId: normalizeSoundId(src.soundId, warnings),
    roomId: normalizeRoomId(src.roomId, warnings),
    moments: {
      arrive: { promptId: normalizePromptId(arriveRaw.promptId, warnings) },
      focus: {
        durationSec: mode === 'open' ? durationSec : durationSec,
        mode,
        promptId: normalizePromptId(focusRaw.promptId, warnings)
      },
      recover: { cooldownSec },
      transition: { promptId: normalizePromptId(transitionRaw.promptId, warnings) },
      reflect: { promptId: normalizePromptId(reflectRaw.promptId, warnings) }
    },
    notes,
    share: { enabled: false, visibility: 'private' },
    moderation: { status: 'draft' }
  };

  return { ok: true, reason: null, recipe, warnings };
}

/**
 * @param {unknown} input
 * @param {{ role?: 'client' | 'server', regenerateId?: boolean }} [options]
 * @returns {RitualRecipeValidation}
 */
export function validateRitualRecipeInput(input, options = {}) {
  const role = options.role === 'server' ? 'server' : 'client';
  if (typeof input === 'string') {
    if (utf8ByteLength(input) > RITUAL_RECIPE_MAX_BYTES) {
      return {
        ok: false,
        reason: RITUAL_RECIPE_REJECT.SIZE,
        recipe: null,
        warnings: []
      };
    }
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch {
      return {
        ok: false,
        reason: RITUAL_RECIPE_REJECT.PARSE,
        recipe: null,
        warnings: []
      };
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        ok: false,
        reason: RITUAL_RECIPE_REJECT.STRUCTURE,
        recipe: null,
        warnings: []
      };
    }
    return validateRitualRecipeInput(parsed, options);
  }

  const result = migrateAndNormalizeRecipe(input, {
    regenerateId: options.regenerateId !== false,
    forceUserAuthor: true
  });
  if (!result.ok || !result.recipe) return result;

  if (role === 'server') {
    const assetWarnings = result.warnings.filter((w) =>
      /unknown_(prompt|sound|room)_id|user_sound_id_forbidden/.test(w)
    );
    if (assetWarnings.length > 0) {
      return {
        ok: false,
        reason: RITUAL_RECIPE_REJECT.ASSET,
        recipe: null,
        warnings: result.warnings
      };
    }
  }

  return result;
}

/**
 * @param {RitualRecipe} recipe
 * @returns {RitualRecipe}
 */
export function normalizeRitualRecipe(recipe) {
  const result = migrateAndNormalizeRecipe(recipe, {
    regenerateId: false,
    forceUserAuthor: false
  });
  if (!result.ok || !result.recipe) {
    return createDefaultSittingRecipe();
  }
  return result.recipe;
}
