/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Stage 2 favorable-disagreement inventory: mill KEEP (PO-reviewed) plus
 * Prompt 12 historical KEEP. Historical rows do not count as real CSV.
 */

import { CONFIDE_STAGE2_SYNONYM_CANDIDATES } from './confideStage2SynonymCandidates.js';
import { MILL_SOURCE } from './confideStage2ChallengeCandidates.js';
import {
  MILL_PO_REVIEWER,
  summarizeFavorableDisagreementMill
} from './confideFavorableDisagreementMill.js';
import { resolveStage2LiteralSnapshot } from './confideStage2FavorableScreen.js';

const HISTORICAL_META = Object.freeze({
  'busy-03': { golden_cluster: 'recent_activity', seed_text: '最近都在捣鼓什么' },
  'busy-04': { golden_cluster: 'time_activity', seed_text: "what's eating up my hours lately" },
  'busy-05': { golden_cluster: 'time_activity_week', seed_text: 'where did all my time go this week' },
  'show-01': { golden_cluster: 'recent_visit', seed_text: '这几天有来吗' },
  'show-03': { golden_cluster: 'visit_frequency', seed_text: 'have I been coming by these days' },
  'show-04': { golden_cluster: 'recent_visit_week', seed_text: 'did I drop in this week' },
  'mem-01': { golden_cluster: 'memory_recall', seed_text: '把你记得的念一遍' },
  'mem-03': { golden_cluster: 'memory_notes', seed_text: 'dump your notes on me' },
  'dur-02': { golden_cluster: 'activity_tracking', seed_text: 'how much sitting have I clocked' },
  'dur-03': { golden_cluster: 'visit_count', seed_text: '这周我来了几回' },
  'emo-01': { golden_cluster: 'emotional_weight', seed_text: '胸口像压了块石头' },
  'emo-02': { golden_cluster: 'emotional_emptiness', seed_text: '今天整个人是空的' }
});

function languageOf(text) {
  return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
}

/**
 * Prompt 12 KEEP that PO confirmed as historical (not real CSV).
 * @type {readonly object[]}
 */
export const CONFIDE_STAGE2_HISTORICAL_KEEP = Object.freeze(
  Object.keys(HISTORICAL_META).map((id) => {
    const seed = CONFIDE_STAGE2_SYNONYM_CANDIDATES.find((row) => row.id === id);
    if (!seed) throw new Error(`missing historical seed ${id}`);
    const meta = HISTORICAL_META[id];
    const snap = resolveStage2LiteralSnapshot(seed.text);
    return Object.freeze({
      sample_id: `hist-${id}`,
      text: seed.text,
      language: languageOf(seed.text),
      golden_bucket: seed.expectedBucket,
      golden_cluster: meta.golden_cluster,
      seed_text: meta.seed_text,
      literal_bucket: snap.literalCoarse,
      semantic_bucket: seed.expectedBucket,
      source: MILL_SOURCE.HISTORICAL,
      source_method: 'H',
      source_detail: 'H.prompt12-keep',
      difficulty: 'medium',
      is_favorable_disagreement: 'yes',
      drop_reason: null,
      reviewer: MILL_PO_REVIEWER,
      scoreA: null,
      scoreB: null,
      grayMargin: null,
      route: snap.route,
      literal_source: snap.source
    });
  })
);

/**
 * @param {readonly object[]} millRows
 */
export function buildStage2FavorableInventory(millRows) {
  const millFavorable = millRows.filter(
    (row) => row.is_favorable_disagreement === 'yes' && row.reviewer === MILL_PO_REVIEWER
  );
  return Object.freeze([...millFavorable, ...CONFIDE_STAGE2_HISTORICAL_KEEP]);
}

function normalizeText(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[?!.,，。？！]+$/g, '');
}

/**
 * @param {readonly object[]} inventoryRows
 */
export function summarizeStage2FavorableInventory(inventoryRows) {
  const summary = summarizeFavorableDisagreementMill(inventoryRows);
  const uniqueTexts = new Set(inventoryRows.map((row) => normalizeText(row.text)));
  return {
    ...summary,
    uniqueTexts: uniqueTexts.size,
    millReviewed: inventoryRows.filter((row) => row.source !== MILL_SOURCE.HISTORICAL).length,
    historical: summary.bySource[MILL_SOURCE.HISTORICAL]
  };
}

