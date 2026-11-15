/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Match-text cleanup for the output gate. Draft. Not a clinical review.
 * The displayed sentence is kept separately; this copy is only for matching.
 */

/**
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeForMatch(raw) {
  let text = String(raw ?? '').normalize('NFKC');
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  text = text.replace(/[\u0000-\u001F\u007F]/g, ' ');
  text = text.toLowerCase();
  text = text.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
  text = text.replace(
    /(?<![a-z])((?:[a-z] ){3,}[a-z])(?![a-z])/g,
    (run) => run.replace(/ /g, '')
  );
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * @param {unknown} raw
 * @returns {'en' | 'zh' | 'ja' | 'other'}
 */
export function primaryOutputLanguage(raw) {
  const text = normalizeForMatch(raw);
  if (!text) return 'other';
  const kana = (text.match(/[\u3040-\u30ff]/g) || []).length;
  const han = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = (text.match(/[a-z]/g) || []).length;
  if (kana > 0 && kana >= han && kana >= latin) return 'ja';
  if (kana > 0 && latin === 0) return 'ja';
  if (han > 0 && latin === 0) return 'zh';
  if (latin > 0 && han === 0 && kana === 0) return 'en';
  if (han > latin && han > kana) return 'zh';
  if (latin > 0) return 'en';
  return 'other';
}

/**
 * Visible length after dropping zero-width characters.
 * @param {unknown} raw
 * @returns {number}
 */
export function visibleLength(raw) {
  return [...String(raw ?? '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim()].length;
}
