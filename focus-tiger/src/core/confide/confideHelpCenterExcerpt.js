/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * User-facing Help Center short excerpts for Confide miss (CR-50).
 * Never recites a full article. Never uses internal docs.
 */

import { HELP_CENTER_ARTICLES } from '../helpCenterCatalog.js';
import helpCenterSlice from '../../locales/slices/help-center.json' with { type: 'json' };
import { decideKbNearMatch } from './kbNearMatch.js';

const EN = helpCenterSlice.en || {};

/**
 * @param {string} body
 * @returns {string}
 */
export function formatHelpCenterExcerpt(body) {
  const text = String(body || '').trim();
  if (!text) return '';
  const firstPara = text.split(/\n\n/)[0].replace(/\s+/g, ' ').trim();
  if (firstPara.length <= 280) return firstPara;
  const cut = firstPara.slice(0, 280);
  const lastStop = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('。'));
  return (lastStop >= 80 ? cut.slice(0, lastStop + 1) : cut).trim();
}

/**
 * English retrieval phrases (title + first paragraph). Not user-ask lists.
 * @param {{ titleKey: string, bodyKey: string }} article
 * @returns {string[]}
 */
export function helpCenterEmbeddingPhrases(article) {
  const title = String(EN[article?.titleKey] || '').trim();
  const excerpt = formatHelpCenterExcerpt(EN[article?.bodyKey] || '');
  return [title, excerpt].filter((row) => row.length >= 8);
}

/**
 * @param {readonly { id: string, vector: number[] }[]} rows
 * @param {number[]} userVector
 * @param {(a: number[], b: number[]) => number} scoreFn
 * @returns {{ nearestId: string | null, nearestScore: number | null }}
 */
export function pickNearestHelpCenterMatch(rows, userVector, scoreFn) {
  let nearestId = null;
  let nearestScore = -1;
  for (const row of rows) {
    const score = scoreFn(userVector, row.vector);
    if (score > nearestScore) {
      nearestScore = score;
      nearestId = row.id;
    }
  }
  return {
    nearestId,
    nearestScore: nearestId ? nearestScore : null
  };
}

/**
 * @param {{ nearestId?: string | null, nearestScore?: number | null }} row
 * @returns {{ action: 'hit' | 'skip', id: string | null }}
 */
export function decideHelpCenterExcerpt(row) {
  const near = decideKbNearMatch(row);
  if (near.action === 'hit' && near.id) {
    return { action: 'hit', id: near.id };
  }
  return { action: 'skip', id: null };
}

/**
 * @returns {readonly typeof HELP_CENTER_ARTICLES}
 */
export function listHelpCenterExcerptArticles() {
  return HELP_CENTER_ARTICLES;
}
