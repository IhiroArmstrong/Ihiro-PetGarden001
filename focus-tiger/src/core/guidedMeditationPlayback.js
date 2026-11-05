/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Web streams HTTPS Range on <video src>. Electron downloads the whole file first.
 * Audio fallback is user-initiated (or Electron cache miss after video failure).
 */

/**
 * @param {boolean} isDesktop
 * @returns {'stream' | 'download'}
 */
export function resolveGuidedMeditationPlaybackMode(isDesktop) {
  return isDesktop ? 'download' : 'stream';
}

/**
 * @param {{ userChoseAudio?: boolean }} flags
 * @returns {boolean}
 */
export function shouldUseGuidedMeditationAudio(flags = {}) {
  return Boolean(flags.userChoseAudio);
}

/**
 * Approximate buffered fraction from HTMLMediaElement.buffered vs duration.
 * @param {HTMLMediaElement | null | undefined} media
 * @returns {number | null} 0–1 or null if unknown
 */
export function bufferedFraction(media) {
  if (!media?.buffered || media.buffered.length === 0) return null;
  const duration = Number(media.duration);
  if (!Number.isFinite(duration) || duration <= 0) return null;
  const end = media.buffered.end(media.buffered.length - 1);
  return Math.max(0, Math.min(1, end / duration));
}

/**
 * @param {number} received
 * @param {number | null} total
 * @returns {string}
 */
export function formatDownloadProgress(received, total) {
  const rec = Number(received);
  const tot = Number(total);
  if (!Number.isFinite(rec) || rec < 0) return '';
  const recMb = rec / (1024 * 1024);
  if (Number.isFinite(tot) && tot > 0) {
    return `${recMb.toFixed(1)} / ${(tot / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${recMb.toFixed(1)} MB`;
}
