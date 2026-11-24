/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Packaged companion runtime cannot import renderer src/.
 * Hash must stay in sync with confidePrivacy.js (FNV-1a, not anonymisation).
 */

function hashConfidePrivateText(value) {
  const text = String(value || '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Local l3_generate rows must match semantic-crisis logs: hash + length, no original.
 * @param {unknown} record
 * @returns {object}
 */
export function sanitizeL3GenerateTurnLogRecord(record) {
  const row =
    record && typeof record === 'object' && !Array.isArray(record) ? record : {};
  const text = typeof row.text === 'string' ? row.text : '';
  const out = { ...row };
  delete out.text;
  out.kind = typeof row.kind === 'string' && row.kind ? row.kind : 'l3_generate';
  out.queryHash = hashConfidePrivateText(text);
  out.textLength = text.length;
  out.raw = '';
  return out;
}
