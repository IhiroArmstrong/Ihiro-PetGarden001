/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Stable non-crypto hash (FNV-1a) for privacy-safe local audit grouping.
 * It is not a security primitive and must never be treated as anonymisation.
 * @param {string} value
 * @returns {string}
 */
export function hashConfidePrivateText(value) {
  const text = String(value || '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
