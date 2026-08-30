/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Explicit batch id linking reflections.v1 bundles ↔ presence-signals rows.
 */

/**
 * @returns {string}
 */
export function createPresenceSessionId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `psess-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizePresenceSessionId(value) {
  const id = typeof value === 'string' ? value.trim() : '';
  return id || null;
}
