/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { normalizeVisibleConfideReply } from '../confide/confideReplyUniqueness.js';
import catalog from './noticingFixedLines.json' with { type: 'json' };
import { isNoticingLiveKind } from './noticingLabelDisposition.js';

export const NOTICING_FIXED_LINE_VERSION = 'v0.3.1';
export const NOTICING_HOLD_KIND = 'hold';
export const NOTICING_INVITE_KIND = 'invite_sit';

/** @type {readonly { id: string, kind: string, zh: string, en: string, ja: string }[]} */
export const NOTICING_FIXED_LINES = Object.freeze(
  catalog.map((row) => Object.freeze({ ...row }))
);

const ZH_BANNED_SUBSTR = Object.freeze([
  '休息',
  '歇',
  '放下',
  '解脱',
  '不用再撑',
  '辛苦了',
  '尽力了',
  '没关系',
  '会好的',
  '别想太多',
  '一直陪',
  '只有我',
  '你好像',
  '听起来',
  '其实你'
]);

const EN_BANNED_PHRASE = Object.freeze([
  'let go',
  'you did your best',
  "it's okay",
  "it'll be fine",
  'get better',
  "don't overthink",
  'always be here',
  'only i',
  'you seem',
  'sounds like'
]);

const EN_BANNED_WORD = Object.freeze([
  'rest',
  'relax',
  'release',
  'relief',
  'peace'
]);

const ZH_INVITE_OPTIONAL = /不坐|不想|不愿意|不接受|不用做|可以不/;

export function noticingFixedLineLocaleKey(id) {
  return `NOTICING_FIXED_${String(id).replace('-', '_')}`;
}

export function shouldUseNoticingFixedLine(route) {
  if (!route) return false;
  if (route === CONFIDE_ROUTE.SAFETY_REDIRECT) return false;
  if (route === CONFIDE_ROUTE.SAFETY_CARE) return false;
  if (route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS) return false;
  if (route === CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN) return false;
  return true;
}

export function noticingFixedLineText(line, locale = 'en') {
  if (!line) return '';
  if (locale === 'zh') return line.zh;
  if (locale === 'ja') return line.ja;
  return line.en;
}

export function zhBannedHits(text) {
  const s = String(text || '');
  return ZH_BANNED_SUBSTR.filter((token) => s.includes(token));
}

export function enBannedHits(text) {
  const s = String(text || '').toLowerCase();
  /** @type {string[]} */
  const hits = [];
  for (const phrase of EN_BANNED_PHRASE) {
    if (s.includes(phrase)) hits.push(phrase);
  }
  for (const word of EN_BANNED_WORD) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(s)) hits.push(word);
  }
  return hits;
}

function englishWordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function zhCharCount(text) {
  return Array.from(String(text || '').replace(/\s/g, '')).length;
}

/** Dedicated harm-to-others corpus. Noticing A/B lint must not rewrite these. */
export const NOTICING_LINT_EXEMPT_LINE_IDS = Object.freeze([
  'aggression-01',
  'aggression-02',
  'aggression-03',
  'aggression-04'
]);

export function lintNoticingFixedLine(line) {
  /** @type {string[]} */
  const errors = [];
  if (!line?.id) errors.push('missing-id');
  errors.push(...zhBannedHits(line.zh).map((h) => `zh-banned:${h}`));
  errors.push(...enBannedHits(line.en).map((h) => `en-banned:${h}`));
  if (zhCharCount(line.zh) > 40) errors.push('zh-too-long');
  if (englishWordCount(line.en) > 25) errors.push('en-too-long');
  if (line.kind === NOTICING_HOLD_KIND) {
    if (String(line.zh).includes('坐')) errors.push('hold-zh-sit');
    if (/\bsittings?\b|\bsit\b/i.test(line.en)) errors.push('hold-en-sit');
  }
  if (!isNoticingLiveKind(line.kind)) errors.push('kind-not-live');
  if (line.kind === NOTICING_INVITE_KIND) {
    if (!ZH_INVITE_OPTIONAL.test(line.zh)) errors.push('invite-zh-optional');
    const en = String(line.en);
    if (!/\bsit/i.test(en)) errors.push('invite-en-sit');
    if (
      !/\bor not\b|\bif not\b|\bnot sitting\b|\brather not\b|\bwon't\b|\bdeclin|\bnot to\b|\bnothing is asked|\bno need to force|\byou don't have to|\byou don't need to/i.test(
        en
      )
    ) {
      errors.push('invite-en-optional');
    }
  }
  return errors;
}

export function lintNoticingFixedLibrary(lines = NOTICING_FIXED_LINES) {
  return lines
    .filter((line) => !NOTICING_LINT_EXEMPT_LINE_IDS.includes(line?.id))
    .map((line) => ({ id: line.id, errors: lintNoticingFixedLine(line) }))
    .filter((row) => row.errors.length > 0);
}

function dateSeed(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate || ''));
  if (!m) return 0;
  return Number(m[1]) * 372 + Number(m[2]) * 31 + Number(m[3]);
}

export function pickNoticingFixedLine({
  route,
  locale = 'en',
  localDate = '',
  salt = 0,
  excludeIds = [],
  excludeNormalizedTexts = []
} = {}) {
  // embedding / classHint / isolationClass / kindFilter are ignored on purpose.
  if (!shouldUseNoticingFixedLine(route)) return null;
  const exclude =
    excludeIds instanceof Set
      ? excludeIds
      : new Set(Array.isArray(excludeIds) ? excludeIds : []);
  const banned = new Set(
    (Array.isArray(excludeNormalizedTexts) ? excludeNormalizedTexts : [])
      .map((t) => normalizeVisibleConfideReply(t))
      .filter(Boolean)
  );
  let pool = NOTICING_FIXED_LINES.filter((row) => !exclude.has(row.id));
  if (banned.size) {
    const filtered = pool.filter(
      (row) =>
        !banned.has(
          normalizeVisibleConfideReply(noticingFixedLineText(row, locale))
        )
    );
    if (filtered.length) pool = filtered;
  }
  if (pool.length === 0) pool = [...NOTICING_FIXED_LINES];
  pool = pool.filter((row) => isNoticingLiveKind(row.kind));
  if (pool.length === 0) return null;
  const idx =
    Math.abs(dateSeed(localDate) + (Number(salt) || 0) + String(route).length) %
    pool.length;
  const row = pool[idx];
  return {
    id: row.id,
    route,
    zh: row.zh,
    en: row.en,
    ja: row.ja,
    review: 'ok',
    noticingKind: row.kind
  };
}
