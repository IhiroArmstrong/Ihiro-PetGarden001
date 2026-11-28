/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import {
  INNER_MIRROR_THEME_KEYS,
  INNER_MIRROR_THEME_TABLE
} from './innerMirrorThemeTable.js';

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function englishTokenHits(haystack, token) {
  const t = String(token || '').trim();
  if (!t) return false;
  const pattern = new RegExp(`\\b${escapeRegExp(t)}\\b`, 'i');
  return pattern.test(haystack);
}

function chineseTokenHits(haystack, token) {
  const t = String(token || '').trim();
  if (t.length < 2) return false;
  return haystack.includes(t);
}

/**
 * Match one left sentence against the closed table. Crisis must be filtered first.
 * @param {string} text
 * @returns {string[]}
 */
export function matchInnerMirrorThemes(text) {
  const raw = String(text || '');
  if (!raw.trim()) return [];
  const hits = [];
  for (const key of INNER_MIRROR_THEME_KEYS) {
    const row = INNER_MIRROR_THEME_TABLE[key];
    if (!row) continue;
    const zhHit = row.zh.some((token) => chineseTokenHits(raw, token));
    const enHit = row.en.some((token) => englishTokenHits(raw, token));
    if (zhHit || enHit) hits.push(key);
  }
  return hits;
}

/**
 * Count keys in the last `windowDays` local calendar days. Crisis rows never enter.
 * @param {Array<{ at?: string, themes?: string[], themeStatus?: string }>} entries
 * @param {{ now?: Date, windowDays?: number }} [opts]
 */
export function countInnerMirrorThemes(entries, opts = {}) {
  const windowDays = Number(opts.windowDays) > 0 ? Number(opts.windowDays) : 7;
  const now = opts.now instanceof Date ? opts.now : new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (windowDays - 1));
  const counts = Object.fromEntries(INNER_MIRROR_THEME_KEYS.map((k) => [k, 0]));
  let leftCount = 0;
  for (const row of Array.isArray(entries) ? entries : []) {
    if (!row || row.themeStatus === 'void') continue;
    const at = row.at ? new Date(row.at) : null;
    if (!at || Number.isNaN(at.getTime()) || at < start) continue;
    leftCount += 1;
    for (const key of Array.isArray(row.themes) ? row.themes : []) {
      if (key in counts) counts[key] += 1;
    }
  }
  return { leftCount, counts };
}
