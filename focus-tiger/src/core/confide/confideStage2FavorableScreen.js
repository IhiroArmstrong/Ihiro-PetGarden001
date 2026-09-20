/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Screen Prompt 12 candidates: keep only literal-wrong + semantic-right.
 * Does not write production routing. PO still confirms favorable_disagreement.
 */

import { formatSemanticShadowCsvRow, SEMANTIC_SHADOW_CSV_COLUMNS } from './auditConfideSemanticShadow.js';
import { confideClassify } from './confideClassify.js';
import { resolveConfideDesktopSource } from './confideAcceptanceResolve.js';
import { resolveConfideLiteralCoarseBucket } from './confideSemanticCoarseMap.js';
import {
  CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED,
  CONFIDE_STAGE2_SYNONYM_CANDIDATES
} from './confideStage2SynonymCandidates.js';

/**
 * @param {string} text
 * @returns {{ route: string | null, source: string, literalCoarse: string | null }}
 */
export function resolveStage2LiteralSnapshot(text) {
  const route = confideClassify(text);
  const source = resolveConfideDesktopSource(text);
  const literalCoarse = resolveConfideLiteralCoarseBucket({ route, source });
  return { route, source, literalCoarse };
}

/**
 * @param {{
 *   text: string,
 *   expectedBucket: string,
 *   semanticCoarse: string | null,
 *   scoreA?: number | null,
 *   scoreB?: number | null,
 *   grayMargin?: number | null
 * }} row
 */
export function screenStage2FavorableCandidate(row) {
  const snap = resolveStage2LiteralSnapshot(row.text);
  if (CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED.includes(row.text)) {
    return { keep: false, dropReason: 'patched_anchor', ...snap };
  }
  if (snap.literalCoarse === row.expectedBucket) {
    return { keep: false, dropReason: 'literal_already_correct', ...snap };
  }
  if (row.semanticCoarse !== row.expectedBucket) {
    return {
      keep: false,
      dropReason: 'semantic_not_expected',
      ...snap,
      semanticCoarse: row.semanticCoarse
    };
  }
  return {
    keep: true,
    dropReason: null,
    ...snap,
    semanticCoarse: row.semanticCoarse,
    scoreA: row.scoreA ?? null,
    scoreB: row.scoreB ?? null,
    grayMargin: row.grayMargin ?? null
  };
}

/**
 * @param {object} screened
 * @param {{ text: string, note?: string }} candidate
 * @returns {string}
 */
export function formatStage2SuggestedCsvRow(screened, candidate) {
  return formatSemanticShadowCsvRow({
    at: new Date(0).toISOString(),
    text: candidate.text,
    route: screened.route,
    source: screened.source,
    literalCoarse: screened.literalCoarse,
    semanticCoarse: screened.semanticCoarse,
    scoreA: screened.scoreA,
    scoreB: screened.scoreB,
    grayMargin: screened.grayMargin,
    hadPriorTurn: false,
    semanticCoarseWithPrior: null,
    scoreAWithPrior: null,
    scoreBWithPrior: null
  });
}

export function stage2SuggestedCsvHeader() {
  return SEMANTIC_SHADOW_CSV_COLUMNS.join(',');
}

export { CONFIDE_STAGE2_SYNONYM_CANDIDATES, CONFIDE_STAGE2_PATCHED_ANCHORS_EXCLUDED };
