/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { t } from '../locales/i18n.js';

/** @type {number} */
export const SESSION_END_DURATION_MIN_ELAPSED_SECONDS = 30;

/**
 * @param {number} elapsedSeconds
 * @returns {number | null} whole minutes, or null when too short to mention
 */
export function resolveObservedSessionMinutes(elapsedSeconds) {
  const elapsed = Number(elapsedSeconds);
  if (!Number.isFinite(elapsed) || elapsed < SESSION_END_DURATION_MIN_ELAPSED_SECONDS) {
    return null;
  }
  return Math.max(1, Math.round(elapsed / 60));
}

/**
 * @param {number} elapsedSeconds
 * @returns {string | null} localized observational line
 */
export function formatObservedSessionDurationLine(elapsedSeconds) {
  const minutes = resolveObservedSessionMinutes(elapsedSeconds);
  if (minutes === null) return null;
  const line = String(t('SESSION_END_OBSERVED_MINUTES')).replace(
    /\{minutes\}/g,
    String(minutes)
  );
  const trimmed = line.trim();
  return trimmed || null;
}
