/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shared object-name fold for catalog keywords and user text (T29).
 * Space variants match only by joining two adjacent tokens — never by
 * squeezing the whole sentence (otherwise `his it` would include `sit`).
 */

import { normalizeConfideIntentText } from './confideBoundaryRespect.js';

const CJK_RE = /[\u3040-\u30ff\u3400-\u9fff]/;

/**
 * @param {string} token
 * @returns {string}
 */
export function stemEnglishPluralConservative(token) {
  const w = String(token || '');
  if (w.length <= 4) return w;
  if (w.endsWith('us') || w.endsWith('ss')) return w;
  if (w.endsWith('ies')) return `${w.slice(0, -3)}y`;
  if (/(?:[xz]|ch|sh)es$/.test(w) || w.endsWith('sses')) return w.slice(0, -2);
  if (w.endsWith('s')) return w.slice(0, -1);
  return w;
}

/**
 * @param {string} token
 * @returns {string}
 */
function cleanLatinToken(token) {
  return token.replace(/'/g, '').replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}

/**
 * Fold case / whitespace / in-word hyphens. Does not stem.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function tokenizeConfideObjectRaw(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return [];
  const lower = raw.replace(/[A-Z]/g, (ch) => ch.toLowerCase());
  const dehyphen = lower.replace(/([a-z0-9])-([a-z0-9])/gi, '$1$2');
  const spaced = dehyphen.replace(/\s+/g, ' ').trim();
  if (!spaced) return [];
  /** @type {string[]} */
  const out = [];
  for (const tok of spaced.split(' ')) {
    if (!tok) continue;
    if (CJK_RE.test(tok)) {
      out.push(tok);
      continue;
    }
    const cleaned = cleanLatinToken(tok);
    if (cleaned) out.push(cleaned);
  }
  return out;
}

/**
 * Lowercase Latin letters only; fold whitespace; strip in-word hyphens;
 * conservative plural on each token. CJK unchanged. Tokens stay spaced.
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeConfideObjectPhrase(text) {
  return tokenizeConfideObjectRaw(text)
    .map((tok) => (CJK_RE.test(tok) ? tok : stemEnglishPluralConservative(tok)))
    .join(' ');
}

/**
 * @param {string} text
 * @returns {string[]}
 */
export function tokenizeConfideObjectPhrase(text) {
  const phrase = normalizeConfideObjectPhrase(text);
  return phrase ? phrase.split(' ') : [];
}

/**
 * @param {readonly string[]} hayTokens
 * @param {readonly string[]} needleTokens
 * @returns {boolean}
 */
function containsTokenSequence(hayTokens, needleTokens) {
  if (!needleTokens.length || hayTokens.length < needleTokens.length) return false;
  for (let i = 0; i <= hayTokens.length - needleTokens.length; i += 1) {
    let ok = true;
    for (let j = 0; j < needleTokens.length; j += 1) {
      if (hayTokens[i + j] !== needleTokens[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

/**
 * @param {readonly string[]} hayTokens
 * @param {string} compact
 * @returns {boolean}
 */
function adjacentPairEquals(hayTokens, compact) {
  if (!compact) return false;
  for (let i = 0; i < hayTokens.length - 1; i += 1) {
    if (hayTokens[i] + hayTokens[i + 1] === compact) return true;
  }
  return false;
}

/**
 * Catalog keyword vs user text after the shared fold.
 * Adjacent two-token joins are allowed; whole-sentence compression is not.
 *
 * @param {string} haystack
 * @param {string} needle
 * @returns {boolean}
 */
export function confideObjectKeywordMatches(haystack, needle) {
  const n = String(needle || '').trim();
  if (!n) return false;
  if (CJK_RE.test(n)) {
    return normalizeConfideIntentText(haystack).includes(n);
  }
  const hayRaw = tokenizeConfideObjectRaw(haystack);
  const needleRaw = tokenizeConfideObjectRaw(n);
  if (!hayRaw.length || !needleRaw.length) return false;
  if (containsTokenSequence(hayRaw, needleRaw)) return true;
  const hayStem = hayRaw.map((tok) =>
    CJK_RE.test(tok) ? tok : stemEnglishPluralConservative(tok)
  );
  const needleStem = needleRaw.map((tok) =>
    CJK_RE.test(tok) ? tok : stemEnglishPluralConservative(tok)
  );
  if (containsTokenSequence(hayStem, needleStem)) return true;
  const compactRaw = needleRaw.join('');
  const compactStem = needleStem.join('');
  if (adjacentPairEquals(hayRaw, compactRaw) || adjacentPairEquals(hayRaw, compactStem)) {
    return true;
  }
  if (adjacentPairEquals(hayStem, compactStem)) return true;
  for (let i = 0; i < hayRaw.length; i += 1) {
    if (hayRaw[i] === compactRaw || hayStem[i] === compactStem) return true;
    if (compactRaw.length >= 4 && hayRaw[i].includes(compactRaw)) return true;
    if (compactStem.length >= 4 && hayStem[i].includes(compactStem)) return true;
  }
  return false;
}
