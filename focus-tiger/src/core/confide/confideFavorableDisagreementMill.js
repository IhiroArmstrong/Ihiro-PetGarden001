/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Favorable-disagreement mill: golden first, then literal vs semantic.
 * Formula: Literal ≠ Golden AND Semantic = Golden.
 * Does not write production routing. Machine "yes" still needs PO reviewer.
 */

import { csvEscape } from './auditConfideSemanticShadow.js';
import { CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED } from './confideStage2SynonymCandidates.js';
import { resolveStage2LiteralSnapshot } from './confideStage2FavorableScreen.js';
import {
  CONFIDE_STAGE2_CHALLENGE_CANDIDATES,
  MILL_SOURCE
} from './confideStage2ChallengeCandidates.js';

export const FAVORABLE_DISAGREEMENT_MILL_COLUMNS = Object.freeze([
  'sample_id',
  'text',
  'language',
  'golden_bucket',
  'golden_cluster',
  'literal_bucket',
  'semantic_bucket',
  'source',
  'source_method',
  'source_detail',
  'difficulty',
  'is_favorable_disagreement',
  'drop_reason',
  'reviewer',
  'scoreA',
  'scoreB',
  'grayMargin',
  'route',
  'literal_source'
]);

const REAL_MINIMUM = 5;

/**
 * @param {import('./confideStage2ChallengeCandidates.js').Stage2ChallengeCandidate} candidate
 * @param {{
 *   semanticCoarse: string | null,
 *   scoreA?: number | null,
 *   scoreB?: number | null,
 *   grayMargin?: number | null
 * }} scored
 */
export function millFavorableDisagreement(candidate, scored) {
  const snap = resolveStage2LiteralSnapshot(candidate.text);
  const golden = candidate.golden_bucket;
  const semantic = scored.semanticCoarse ?? null;
  let dropReason = null;
  if (CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED.includes(candidate.text)) {
    dropReason = 'patched_anchor';
  } else if (snap.literalCoarse === golden) {
    dropReason = 'literal_already_correct';
  } else if (semantic !== golden) {
    dropReason = 'semantic_not_golden';
  }
  return {
    sample_id: candidate.sample_id,
    text: candidate.text,
    language: candidate.language,
    golden_bucket: golden,
    golden_cluster: candidate.golden_cluster,
    seed_text: candidate.seed_text,
    literal_bucket: snap.literalCoarse,
    semantic_bucket: semantic,
    source: candidate.source,
    source_method: candidate.source_method,
    source_detail: candidate.source_detail,
    difficulty: candidate.difficulty,
    is_favorable_disagreement: dropReason ? '' : 'yes',
    drop_reason: dropReason,
    reviewer: candidate.reviewer || '',
    scoreA: scored.scoreA ?? null,
    scoreB: scored.scoreB ?? null,
    grayMargin: scored.grayMargin ?? null,
    route: snap.route,
    literal_source: snap.source
  };
}

/**
 * @param {readonly object[]} rows
 */
export function summarizeFavorableDisagreementMill(rows) {
  const favorable = rows.filter((row) => row.is_favorable_disagreement === 'yes');
  const bySource = {
    [MILL_SOURCE.SYNTHETIC]: 0,
    [MILL_SOURCE.REAL]: 0,
    [MILL_SOURCE.ADVERSARIAL]: 0,
    [MILL_SOURCE.HISTORICAL]: 0
  };
  const byMethod = { A: 0, B: 0, C: 0 };
  /** @type {Record<string, number>} */
  const byCluster = {};
  /** @type {Record<string, { n: number, semanticHit: number }>} */
  const bySourceDetail = {};
  /** @type {Record<string, number>} */
  const dropReasons = {};

  for (const row of favorable) {
    if (bySource[row.source] != null) bySource[row.source] += 1;
    if (byMethod[row.source_method] != null) byMethod[row.source_method] += 1;
    byCluster[row.golden_cluster] = (byCluster[row.golden_cluster] || 0) + 1;
  }
  for (const row of rows) {
    const key = row.source_detail || 'unknown';
    if (!bySourceDetail[key]) bySourceDetail[key] = { n: 0, semanticHit: 0 };
    bySourceDetail[key].n += 1;
    if (row.semantic_bucket === row.golden_bucket) bySourceDetail[key].semanticHit += 1;
    if (row.drop_reason) {
      dropReasons[row.drop_reason] = (dropReasons[row.drop_reason] || 0) + 1;
    }
  }

  const semanticHits = rows.filter((row) => row.semantic_bucket === row.golden_bucket).length;
  const literalHits = rows.filter((row) => row.literal_bucket === row.golden_bucket).length;
  const pct = (num, den) => (den === 0 ? 0 : Math.round((num / den) * 1000) / 10);
  const realCount = bySource[MILL_SOURCE.REAL];

  return {
    pool: rows.length,
    favorable: favorable.length,
    bySource,
    byMethod,
    byCluster,
    bySourceDetail: Object.fromEntries(
      Object.entries(bySourceDetail).map(([key, val]) => [
        key,
        { n: val.n, semanticAccuracyPct: pct(val.semanticHit, val.n) }
      ])
    ),
    dropReasons,
    literalBaselinePct: pct(literalHits, rows.length),
    semanticAccuracyPct: pct(semanticHits, rows.length),
    semanticAccuracyOnFavorableSetPct: favorable.length ? 100 : 0,
    realCount,
    realMinimum: REAL_MINIMUM,
    realMinimumPass: realCount >= REAL_MINIMUM
  };
}

/**
 * @param {object} row
 */
export function formatFavorableDisagreementMillCsvRow(row) {
  return FAVORABLE_DISAGREEMENT_MILL_COLUMNS.map((col) => {
    if (col === 'literal_source') return csvEscape(row.literal_source);
    return csvEscape(row[col]);
  }).join(',');
}

export function favorableDisagreementMillCsvHeader() {
  return FAVORABLE_DISAGREEMENT_MILL_COLUMNS.join(',');
}

export { CONFIDE_STAGE2_CHALLENGE_CANDIDATES, MILL_SOURCE };
