/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Seasonal Theme · once-per-day whisper gate (localStorage).
 */

export const SEASONAL_WHISPER_STORAGE_KEY = 'focus-tiger.seasonal-whisper.v1';

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ seasonId: string, dayIso: string } | null}
 */
export function readSeasonalWhisperState(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SEASONAL_WHISPER_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return null;
    const seasonId = typeof o.seasonId === 'string' ? o.seasonId : '';
    const dayIso = typeof o.dayIso === 'string' ? o.dayIso : '';
    if (!seasonId || !dayIso) return null;
    return { seasonId, dayIso };
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} seasonId
 * @param {string} dayIso
 */
export function markSeasonalWhisperShown(storage, seasonId, dayIso) {
  if (!storage) return;
  try {
    storage.setItem(
      SEASONAL_WHISPER_STORAGE_KEY,
      JSON.stringify({ seasonId, dayIso })
    );
  } catch {
    /* ignore quota */
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} seasonId
 * @param {string} dayIso
 * @returns {boolean}
 */
export function shouldShowSeasonalWhisper(storage, seasonId, dayIso) {
  const prev = readSeasonalWhisperState(storage);
  if (!prev) return true;
  return !(prev.seasonId === seasonId && prev.dayIso === dayIso);
}
