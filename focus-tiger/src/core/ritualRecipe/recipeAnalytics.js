/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Ritual Recipe analytics (A5). Default off. No user id, title, or notes.
 * @see docs/RITUAL_RECIPE_ANALYTICS.md
 */

export const RITUAL_RECIPE_ANALYTICS_OPT_IN_STORAGE_KEY =
  'focus-tiger.ritual-recipe-analytics-opt-in.v1';

export const RECIPE_ANALYTICS_EVENTS = Object.freeze({
  SESSION_STARTED: 'recipe_session_started',
  EDITED: 'recipe_edited',
  RESET_DEFAULT: 'recipe_reset_default',
  EXPORTED: 'recipe_exported',
  IMPORT_PREVIEWED: 'recipe_import_previewed',
  ADOPTED: 'recipe_adopted',
  IMPORT_REJECTED: 'recipe_import_rejected',
  SHARE_CREATED: 'recipe_share_created',
  SHARE_OPENED: 'recipe_share_opened',
  SHORTCUT_SESSION_STARTED: 'shortcut_session_started'
});

const SESSION_SOURCES = new Set(['default', 'official', 'custom', 'imported']);
const FOCUS_MODES = new Set(['fixed', 'open']);
const FIELD_CHANGED = new Set(['focus_duration', 'prompt', 'sound', 'room']);
const RESET_SCOPES = new Set(['moment', 'all']);
const IMPORT_ORIGINS = new Set(['file', 'link']);
const IMPORT_REASONS = new Set(['size', 'parse', 'version', 'structure', 'asset']);

const FORBIDDEN_PROP_KEYS = Object.freeze([
  'title',
  'notes',
  'id',
  'userId',
  'email',
  'clientId'
]);

/**
 * @typedef {{ enabled: boolean, consentedAt: string | null }} RecipeAnalyticsOptIn
 */

/**
 * @param {unknown} raw
 * @returns {RecipeAnalyticsOptIn}
 */
export function normalizeRecipeAnalyticsOptIn(raw) {
  if (!raw || typeof raw !== 'object') {
    return { enabled: false, consentedAt: null };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  return {
    enabled: o.enabled === true,
    consentedAt:
      typeof o.consentedAt === 'string' && o.consentedAt ? o.consentedAt : null
  };
}

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
 * @returns {RecipeAnalyticsOptIn}
 */
export function readRecipeAnalyticsOptIn(storage) {
  const store = resolveStorage(storage);
  if (!store) return normalizeRecipeAnalyticsOptIn(null);
  try {
    const raw = store.getItem(RITUAL_RECIPE_ANALYTICS_OPT_IN_STORAGE_KEY);
    if (!raw) return normalizeRecipeAnalyticsOptIn(null);
    return normalizeRecipeAnalyticsOptIn(JSON.parse(raw));
  } catch {
    return normalizeRecipeAnalyticsOptIn(null);
  }
}

/**
 * @param {boolean} enabled
 * @param {Storage | null | undefined} [storage]
 * @returns {RecipeAnalyticsOptIn}
 */
export function setRecipeAnalyticsOptIn(enabled, storage) {
  const next = {
    enabled: enabled === true,
    consentedAt: enabled === true ? new Date().toISOString() : null
  };
  const store = resolveStorage(storage);
  if (!store) return next;
  try {
    store.setItem(
      RITUAL_RECIPE_ANALYTICS_OPT_IN_STORAGE_KEY,
      JSON.stringify(next)
    );
  } catch {
    // ignore
  }
  return next;
}

/**
 * @param {string} name
 * @param {Record<string, unknown>} props
 * @returns {Record<string, unknown>}
 */
export function sanitizeRecipeAnalyticsProps(name, props) {
  /** @type {Record<string, unknown>} */
  const out = {};
  const src = props && typeof props === 'object' ? props : {};
  for (const key of Object.keys(src)) {
    if (FORBIDDEN_PROP_KEYS.includes(key)) continue;
    out[key] = src[key];
  }

  if (name === RECIPE_ANALYTICS_EVENTS.SESSION_STARTED) {
    return {
      source: SESSION_SOURCES.has(/** @type {string} */ (out.source))
        ? out.source
        : 'default',
      focus_mode: FOCUS_MODES.has(/** @type {string} */ (out.focus_mode))
        ? out.focus_mode
        : 'fixed',
      chip_override: out.chip_override === true
    };
  }
  if (name === RECIPE_ANALYTICS_EVENTS.EDITED) {
    const fields = Array.isArray(out.fields_changed)
      ? out.fields_changed.filter((f) => FIELD_CHANGED.has(String(f)))
      : [];
    return { fields_changed: [...new Set(fields)] };
  }
  if (name === RECIPE_ANALYTICS_EVENTS.RESET_DEFAULT) {
    return {
      scope: RESET_SCOPES.has(/** @type {string} */ (out.scope))
        ? out.scope
        : 'all'
    };
  }
  if (
    name === RECIPE_ANALYTICS_EVENTS.IMPORT_PREVIEWED ||
    name === RECIPE_ANALYTICS_EVENTS.ADOPTED
  ) {
    const origin = IMPORT_ORIGINS.has(/** @type {string} */ (out.origin))
      ? out.origin
      : 'file';
    if (name === RECIPE_ANALYTICS_EVENTS.IMPORT_PREVIEWED) {
      const warnings = Number(out.warnings);
      return {
        origin,
        warnings: Number.isFinite(warnings) ? Math.max(0, warnings) : 0
      };
    }
    return { origin };
  }
  if (name === RECIPE_ANALYTICS_EVENTS.IMPORT_REJECTED) {
    return {
      reason: IMPORT_REASONS.has(/** @type {string} */ (out.reason))
        ? out.reason
        : 'structure'
    };
  }
  if (name === RECIPE_ANALYTICS_EVENTS.SHORTCUT_SESSION_STARTED) {
    return { has_template: out.has_template === true };
  }
  return {};
}

/**
 * Client events. SHARE_OPENED is server-only and is ignored here.
 * @param {string} name
 * @param {Record<string, unknown>} [props]
 * @param {{
 *   storage?: Storage | null,
 *   sink?: (name: string, props: Record<string, unknown>) => void
 * }} [options]
 * @returns {boolean} true if emitted
 */
export function trackRecipeEvent(name, props = {}, options = {}) {
  if (name === RECIPE_ANALYTICS_EVENTS.SHARE_OPENED) return false;
  const allowed = new Set(Object.values(RECIPE_ANALYTICS_EVENTS));
  if (!allowed.has(name)) return false;
  if (!readRecipeAnalyticsOptIn(options.storage).enabled) return false;
  const clean = sanitizeRecipeAnalyticsProps(name, props);
  const sink =
    options.sink ||
    ((eventName, eventProps) => {
      console.log('[RecipeAnalytics]', eventName, eventProps);
    });
  sink(name, clean);
  return true;
}
