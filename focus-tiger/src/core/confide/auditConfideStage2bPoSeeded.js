/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Count Stage 2b live-gate numbers from semantic_shadow_classify rows.
 * Does not judge whether to cut live. Does not write "can cut Stage 2b".
 */

import { CONFIDE_SEMANTIC_SHADOW_KIND } from './auditConfideSemanticShadow.js';
import { isConfideStage2bLabSeeded } from './confideSemanticStage2b.js';
import { previewConfideLiteralSource } from './previewConfideLiteralSource.js';

export const STAGE2B_PO_SEEDED_GATE = Object.freeze({
  MIN_UNIQUE_TEXTS: 25,
  MIN_FAMILIES: 6,
  MAX_FALSE_PULLS: 1
});

/**
 * @param {unknown} text
 * @returns {string}
 */
export function normalizeStage2bSeedText(text) {
  return String(text ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * @param {string} raw
 * @returns {Map<string, string>}
 */
export function parseStage2bFamilyTsv(raw) {
  const map = new Map();
  const text = typeof raw === 'string' ? raw : '';
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const tab = trimmed.indexOf('\t');
    if (tab < 0) continue;
    const sentence = normalizeStage2bSeedText(trimmed.slice(0, tab));
    const family = trimmed.slice(tab + 1).trim();
    if (!sentence || !family) continue;
    map.set(sentence, family);
  }
  return map;
}

/**
 * @param {string} raw
 * @returns {string[]}
 */
export function parseStage2bSentenceList(raw) {
  const text = typeof raw === 'string' ? raw : '';
  const out = [];
  const seen = new Set();
  for (const line of text.split('\n')) {
    const sentence = normalizeStage2bSeedText(line.replace(/^\s*#.*$/, ''));
    if (!sentence || sentence.startsWith('#')) continue;
    if (seen.has(sentence)) continue;
    seen.add(sentence);
    out.push(sentence);
  }
  return out;
}

/**
 * @param {unknown} row
 * @returns {boolean}
 */
export function isOkPoSeededShadowRow(row) {
  if (!row || typeof row !== 'object') return false;
  if (row.kind !== CONFIDE_SEMANTIC_SHADOW_KIND) return false;
  if (row.ok !== true) return false;
  return isConfideStage2bLabSeeded(row.seedSource);
}

/**
 * @param {object[]} rows
 * @param {{
 *   familyByText?: Map<string, string> | Record<string, string>,
 *   negativeTexts?: Iterable<string>
 * }} [opts]
 * @returns {{
 *   uniqueTexts: string[],
 *   uniqueWouldPromote: string[],
 *   uniqueFamilies: string[],
 *   unlabeledTexts: string[],
 *   falsePulls: string[],
 *   skippedNotOkPoSeeded: number,
 *   uniqueTextCount: number,
 *   uniqueWouldPromoteCount: number,
 *   uniqueFamilyCount: number,
 *   unlabeledCount: number,
 *   falsePullCount: number,
 *   meetsUniqueTexts: boolean,
 *   meetsFamilies: boolean,
 *   meetsFalsePulls: boolean
 * }}
 */
export function summarizeConfideStage2bPoSeededGate(rows, opts = {}) {
  const familyByText = mapFromFamilyInput(opts.familyByText);
  const negativeSet = new Set(
    [...(opts.negativeTexts || [])].map(normalizeStage2bSeedText).filter(Boolean)
  );

  let skippedNotOkPoSeeded = 0;
  /** @type {Map<string, { wouldPromote: boolean }>} */
  const unique = new Map();

  for (const row of rows || []) {
    if (!row || typeof row !== 'object') continue;
    if (row.kind !== CONFIDE_SEMANTIC_SHADOW_KIND) continue;
    if (!isConfideStage2bLabSeeded(row.seedSource)) continue;
    if (row.ok !== true) {
      skippedNotOkPoSeeded += 1;
      continue;
    }
    const text = normalizeStage2bSeedText(row.text);
    if (!text) continue;
    const wouldPromote = row.stage2bWouldPromote === true;
    const prev = unique.get(text);
    unique.set(text, {
      wouldPromote: Boolean(prev?.wouldPromote) || wouldPromote
    });
  }

  const uniqueTexts = [...unique.keys()].sort();
  const uniqueWouldPromote = uniqueTexts.filter((t) => unique.get(t)?.wouldPromote);
  const unlabeledTexts = [];
  const familySet = new Set();
  for (const text of uniqueTexts) {
    const family = familyByText.get(text);
    if (family) familySet.add(family);
    else unlabeledTexts.push(text);
  }
  const falsePulls = uniqueWouldPromote.filter((t) => negativeSet.has(t));

  const uniqueTextCount = uniqueTexts.length;
  const uniqueWouldPromoteCount = uniqueWouldPromote.length;
  const uniqueFamilyCount = familySet.size;
  const unlabeledCount = unlabeledTexts.length;
  const falsePullCount = falsePulls.length;

  return {
    uniqueTexts,
    uniqueWouldPromote,
    uniqueFamilies: [...familySet].sort(),
    unlabeledTexts,
    falsePulls,
    skippedNotOkPoSeeded,
    uniqueTextCount,
    uniqueWouldPromoteCount,
    uniqueFamilyCount,
    unlabeledCount,
    falsePullCount,
    meetsUniqueTexts: uniqueTextCount >= STAGE2B_PO_SEEDED_GATE.MIN_UNIQUE_TEXTS,
    meetsFamilies: uniqueFamilyCount >= STAGE2B_PO_SEEDED_GATE.MIN_FAMILIES,
    meetsFalsePulls: falsePullCount <= STAGE2B_PO_SEEDED_GATE.MAX_FALSE_PULLS
  };
}

/**
 * Literal-only preview for confirmation candidates. Does not claim semantic M.
 * @param {string[]} texts
 * @returns {{ text: string, literalCoarse: string | null, route: string | null, source: string | null, skipped: boolean }[]}
 */
export function previewStage2bConfirmCandidates(texts) {
  return (texts || []).map((raw) => {
    const preview = previewConfideLiteralSource(raw);
    return {
      text: preview.text,
      literalCoarse: preview.literalCoarse,
      route: preview.route,
      source: preview.source,
      skipped: preview.skipped
    };
  });
}

/**
 * @param {{
 *   filePath: string,
 *   uniqueTextCount: number,
 *   uniqueWouldPromoteCount: number,
 *   uniqueFamilyCount: number,
 *   unlabeledCount: number,
 *   falsePullCount: number,
 *   skippedNotOkPoSeeded: number,
 *   skippedMalformed?: number,
 *   meetsUniqueTexts: boolean,
 *   meetsFamilies: boolean,
 *   meetsFalsePulls: boolean,
 *   jsonPath: string
 * }} summary
 * @returns {string}
 */
export function formatStage2bPoSeededGateReport(summary) {
  return [
    'stage2b lab_seeded gate',
    `file: ${summary.filePath}`,
    `uniqueLabSeeded=${summary.uniqueTextCount} (need ≥${STAGE2B_PO_SEEDED_GATE.MIN_UNIQUE_TEXTS}) ${yn(summary.meetsUniqueTexts)}`,
    `uniqueWouldPromote=${summary.uniqueWouldPromoteCount}`,
    `uniqueFamilies=${summary.uniqueFamilyCount} (need ≥${STAGE2B_PO_SEEDED_GATE.MIN_FAMILIES}) ${yn(summary.meetsFamilies)}`,
    `unlabeled=${summary.unlabeledCount}`,
    `falsePulls=${summary.falsePullCount} (need ≤${STAGE2B_PO_SEEDED_GATE.MAX_FALSE_PULLS}) ${yn(summary.meetsFalsePulls)}`,
    `skippedNotOkPoSeeded=${summary.skippedNotOkPoSeeded}`,
    `skippedMalformed=${summary.skippedMalformed ?? 0}`,
    `json: ${summary.jsonPath}`,
    'not a live cutover verdict'
  ].join('\n');
}

/**
 * @param {Map<string, string> | Record<string, string> | undefined} input
 * @returns {Map<string, string>}
 */
function mapFromFamilyInput(input) {
  if (!input) return new Map();
  if (input instanceof Map) {
    const map = new Map();
    for (const [key, value] of input) {
      const text = normalizeStage2bSeedText(key);
      const family = String(value || '').trim();
      if (text && family) map.set(text, family);
    }
    return map;
  }
  const map = new Map();
  for (const [key, value] of Object.entries(input)) {
    const text = normalizeStage2bSeedText(key);
    const family = String(value || '').trim();
    if (text && family) map.set(text, family);
  }
  return map;
}

/**
 * @param {boolean} ok
 * @returns {string}
 */
function yn(ok) {
  return ok ? 'yes' : 'no';
}
