/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Fetch a lesson MP4 and verify SHA-256 + byte length before playback.
 */

/**
 * @param {ArrayBuffer} buffer
 * @returns {Promise<string>} lowercase hex
 */
export async function sha256HexFromBuffer(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * @param {object} input
 * @param {string} input.url
 * @param {string} input.expectedSha256 lowercase hex
 * @param {number} input.expectedBytes
 * @param {AbortSignal} [input.signal]
 * @returns {Promise<Blob>}
 */
export async function fetchVerifiedGuidedMeditationVideo(input) {
  const url = String(input.url || '');
  const expectedSha256 = String(input.expectedSha256 || '')
    .trim()
    .toLowerCase();
  const expectedBytes = Number(input.expectedBytes);
  if (!url || !expectedSha256 || !Number.isFinite(expectedBytes) || expectedBytes <= 0) {
    throw new Error('guided-meditation-media-misconfigured');
  }

  const res = await fetch(url, {
    method: 'GET',
    signal: input.signal,
    credentials: 'omit',
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error(`guided-meditation-fetch-${res.status}`);
  }

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength !== expectedBytes) {
    throw new Error('guided-meditation-bytes-mismatch');
  }
  const hex = await sha256HexFromBuffer(buffer);
  if (hex !== expectedSha256) {
    throw new Error('guided-meditation-sha256-mismatch');
  }
  return new Blob([buffer], { type: 'video/mp4' });
}
