/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Full-line corpus for Confide mood-veto / safety / routing **devset + lab freeze** leak audits.
 * SSOT lines live only in fixture modules / fixtures/*.json — not in veto / routing code.
 * (General round-acceptance / KB catalog phrases are out of scope — too many legitimate overlaps.)
 */

import {
  KB_MOOD_VETO_LAB_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MOOD_ROWS
} from './confideKbMoodVetoLabSet.js';
import { CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS } from './confideMoodVetoDevsetZhV1.js';
import { CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS } from './confideRoutingDevsetZhV2.js';
import { CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS } from './confideRouteDevsetZhV2.js';
import { CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS } from './confideSafetyDevsetZhV1.js';

/** Minimum trimmed length to count as a leak target (skip ultra-short tokens). */
export const CONFIDE_ACCEPTANCE_LEAK_MIN_CHARS = 6;

/**
 * Pre–R-Confide-Class literals already embedded in #1188 `isConfideMoodAsideFromProductKnowledge`.
 * Audit ignores these until ablation removes the regex (task-confide-class-blind-acceptance.md).
 *
 * Shrink-only: after ablation this list must be emptied. New entries require
 * written PO approval — do not grow this table as a leak back-door.
 * @type {readonly string[]}
 */
export const CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS = Object.freeze([
  '有点烦',
  '有點煩',
  '会不会好一点',
  '會不會好一點'
]);

/**
 * Runtime modules where embedding frozen/devset lines would be「头痛医头」patching.
 * @type {readonly string[]}
 */
export const CONFIDE_MOOD_VETO_LEAK_SCAN_RELATIVE_PATHS = Object.freeze([
  'src/core/confide/confideProductKnowledgeSemantic.js',
  'src/core/confide/confideKbNearMatch.js',
  'src/core/confide/confideSemanticStage2.js',
  'src/core/confide/confideSemanticStage2b.js'
]);

/**
 * Runtime modules where embedding safety-devset full lines would be coverage
 * patching against the development set.
 * @type {readonly string[]}
 */
export const CONFIDE_SAFETY_LEAK_SCAN_RELATIVE_PATHS = Object.freeze([
  'src/core/confide/confideSafetyKeywords.js',
  'src/core/confide/confideClassify.js',
  'src/core/confide/confideCrisisParaphraseShadow.js',
  'src/core/confide/confideSemanticCrisisExamples.js',
  'src/core/confide/confideSemanticCrisisLayer.js',
  'src/core/confide/confideRhetoricalCrisisConfirm.js',
  'desktop/companion/l1RhetoricalCrisisConfirm.js'
]);

/** Combined leak-scan surfaces (mood-veto + safety classifiers). */
export const CONFIDE_ACCEPTANCE_LEAK_SCAN_RELATIVE_PATHS = Object.freeze([
  ...CONFIDE_MOOD_VETO_LEAK_SCAN_RELATIVE_PATHS,
  ...CONFIDE_SAFETY_LEAK_SCAN_RELATIVE_PATHS
]);

/** @deprecated Scan uses {@link CONFIDE_MOOD_VETO_LEAK_SCAN_RELATIVE_PATHS} only. */
export const CONFIDE_ACCEPTANCE_LEAK_ALLOWLIST_BASENAMES = Object.freeze([
  'confideAggressionAcceptanceFixtures.js',
  'confideMetaQueryAcceptanceFixtures.js',
  'confideRoundAcceptanceSupplementFixtures.js',
  'confideRoundAcceptanceFixtures.js',
  'confideGenerateFailureFallbackFixtures.js',
  'confideKbMoodVetoLabSet.js',
  'confideKbRoutingMatrix.js',
  'stage2bNegativeControlTexts.js',
  'confideMoodVetoDevsetZhV1.js',
  'confideRoutingDevsetZhV2.js',
  'confideRouteDevsetZhV2.js',
  'confideSafetyDevsetZhV1.js',
  'confideGoldenScriptV1.js',
  'confideAcceptanceFrozenSentenceCorpus.js',
  'confideKbCatalogNearReview.js',
  'confideStage2RealMeatCandidates.js'
]);

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isConfideAcceptanceLeakTargetLine(text) {
  const t = String(text || '').trim();
  return t.length >= CONFIDE_ACCEPTANCE_LEAK_MIN_CHARS;
}

/**
 * @returns {readonly string[]}
 */
export function listConfideMoodVetoFrozenAndDevsetFullLines() {
  const bag = new Set();
  const add = (text) => {
    if (isConfideAcceptanceLeakTargetLine(text)) bag.add(String(text).trim());
  };

  for (const row of KB_MOOD_VETO_LAB_MOOD_ROWS) add(row.text);
  for (const row of KB_MOOD_VETO_LAB_CONTROL_ROWS) add(row.text);
  for (const row of CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS) add(row.text);
  for (const row of CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS) add(row.text);
  for (const row of CONFIDE_ROUTE_DEVSET_ZH_V2_ITEMS) add(row.text);
  for (const row of CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS) add(row.text);

  return Object.freeze([...bag].sort((a, b) => b.length - a.length));
}

/** @deprecated Use {@link listConfideMoodVetoFrozenAndDevsetFullLines}. */
export function listConfideAcceptanceFrozenFullLines() {
  return listConfideMoodVetoFrozenAndDevsetFullLines();
}
