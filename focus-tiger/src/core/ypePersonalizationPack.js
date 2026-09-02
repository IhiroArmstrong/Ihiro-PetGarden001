/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * PersonalizationStatePack v1 cache + validation (YPE V2 insight whitelist).
 * @see docs/YIN_PERSONALIZATION_ENGINE.md §G
 * @see docs/task-briefs/task-ype-v2-secret-transform.md
 */

import { normalizeYpeCompanionStyle } from './yinPersonalizationEngine.js';

export const YPE_PERSONALIZATION_PACK_STORAGE_KEY =
  'focus-tiger.ype-personalization-pack.v1';

export const YPE_PACK_SCHEMA_VERSION = 1;

/** Frozen V2 tokens — unknown strings are dropped, not a whole-pack reject. */
export const YPE_PATTERN_INSIGHT_TOKENS = Object.freeze([
  'returns_often',
  'reflects_often'
]);

const ALLOWED_PACK_KEYS = new Set([
  'schemaVersion',
  'packVersion',
  'issuedAt',
  'expiresAt',
  'companionStyle',
  'patternInsights'
]);

const FORBIDDEN_PACK_KEYS = [
  'rankHint',
  'memoryRankHints',
  'memoryHints',
  'eligibleMemoryIds',
  'interventionStyle',
  'intervention_probability',
  'interventionProbability',
  'algorithmVersion'
];

/**
 * Keep whitelist strings; drop objects / unknown tokens; freeze-table order.
 * @param {unknown} insights
 * @returns {string[] | null} null when not an array
 */
export function sanitizePatternInsights(insights) {
  if (!insights || !Array.isArray(insights)) return null;
  const allowed = new Set(YPE_PATTERN_INSIGHT_TOKENS);
  const seen = new Set();
  for (const item of insights) {
    if (typeof item !== 'string') continue;
    if (!allowed.has(item) || seen.has(item)) continue;
    seen.add(item);
  }
  return YPE_PATTERN_INSIGHT_TOKENS.filter((token) => seen.has(token));
}

/**
 * @param {unknown} raw
 * @returns {{ ok: true, pack: object } | { ok: false, reason: string }}
 */
export function validatePersonalizationStatePack(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, reason: 'not-object' };
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  if (o.schemaVersion !== YPE_PACK_SCHEMA_VERSION) {
    return { ok: false, reason: 'bad-schema' };
  }
  for (const key of FORBIDDEN_PACK_KEYS) {
    if (key in o) return { ok: false, reason: `forbidden-${key}` };
  }
  for (const key of Object.keys(o)) {
    if (!ALLOWED_PACK_KEYS.has(key)) {
      return { ok: false, reason: 'unknown-pack-key' };
    }
  }
  const packVersion = Number(o.packVersion);
  if (!Number.isFinite(packVersion) || packVersion < 1) {
    return { ok: false, reason: 'bad-pack-version' };
  }
  const issuedAt = typeof o.issuedAt === 'string' ? o.issuedAt : '';
  const expiresAt = typeof o.expiresAt === 'string' ? o.expiresAt : '';
  if (!issuedAt || !expiresAt) {
    return { ok: false, reason: 'bad-timestamps' };
  }
  const expiresMs = Date.parse(expiresAt);
  if (Number.isFinite(expiresMs) && expiresMs < Date.now()) {
    return { ok: false, reason: 'expired' };
  }
  const companionStyle = normalizeYpeCompanionStyle(o.companionStyle);
  const patternInsights = sanitizePatternInsights(o.patternInsights);
  if (!patternInsights) {
    return { ok: false, reason: 'bad-insights' };
  }
  return {
    ok: true,
    pack: {
      schemaVersion: YPE_PACK_SCHEMA_VERSION,
      packVersion: Math.floor(packVersion),
      issuedAt,
      expiresAt,
      companionStyle,
      patternInsights
    }
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {object | null}
 */
export function readCachedPersonalizationPack(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(YPE_PERSONALIZATION_PACK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = validatePersonalizationStatePack(JSON.parse(raw));
    return parsed.ok ? parsed.pack : null;
  } catch {
    return null;
  }
}

/**
 * Skip write when JSON unchanged (BACKGROUND_NETWORK Q2).
 * @param {Storage | null | undefined} storage
 * @param {unknown} pack
 * @returns {boolean} whether cache changed
 */
export function writeCachedPersonalizationPack(storage, pack) {
  const validated = validatePersonalizationStatePack(pack);
  if (!validated.ok || !storage) return false;
  const next = JSON.stringify(validated.pack);
  try {
    const prev = storage.getItem(YPE_PERSONALIZATION_PACK_STORAGE_KEY);
    if (prev === next) return false;
    storage.setItem(YPE_PERSONALIZATION_PACK_STORAGE_KEY, next);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function discardCachedPersonalizationPack(storage) {
  if (!storage) return;
  try {
    storage.removeItem(YPE_PERSONALIZATION_PACK_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
