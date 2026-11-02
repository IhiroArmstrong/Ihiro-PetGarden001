/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function hashCompanionChannelText(text) {
  const nfc = String(text).normalize('NFC');
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const digest = await subtle.digest('SHA-256', new TextEncoder().encode(nfc));
    return Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, '0')
    ).join('');
  }
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(nfc, 'utf8').digest('hex');
}
