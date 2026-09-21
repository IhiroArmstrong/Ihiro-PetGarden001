/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Offline replay: keep with-prior only when it lifts gray → a definite bucket.
 * Does not change live routing.
 */

import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';
import { isOkSemanticShadowRow } from './auditConfideSemanticShadow.js';

export const PRIOR_FORK_HELP = 'help';
export const PRIOR_FORK_HARM = 'harm';
export const PRIOR_FORK_OTHER = 'other';
export const PRIOR_FORK_SAME = 'same';

/**
 * @param {unknown} bucket
 * @returns {boolean}
 */
export function isDefiniteSemanticBucket(bucket) {
  return (
    bucket === CONFIDE_SEMANTIC_BUCKET.EMOTIONAL ||
    bucket === CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL
  );
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function bucketId(value) {
  if (value == null) return '';
  return String(value).trim();
}

/**
 * @param {unknown} alone
 * @param {unknown} withPrior
 * @returns {typeof PRIOR_FORK_HELP | typeof PRIOR_FORK_HARM | typeof PRIOR_FORK_OTHER | typeof PRIOR_FORK_SAME}
 */
export function classifyPriorFork(alone, withPrior) {
  const a = bucketId(alone);
  const p = bucketId(withPrior);
  if (!a || !p || a === p) return PRIOR_FORK_SAME;
  if (a === CONFIDE_SEMANTIC_BUCKET.GRAY && isDefiniteSemanticBucket(p)) {
    return PRIOR_FORK_HELP;
  }
  if (isDefiniteSemanticBucket(a) && p === CONFIDE_SEMANTIC_BUCKET.GRAY) {
    return PRIOR_FORK_HARM;
  }
  return PRIOR_FORK_OTHER;
}

/**
 * @param {unknown} alone
 * @param {unknown} withPrior
 * @returns {string}
 */
export function applyAsymmetricPriorRule(alone, withPrior) {
  if (classifyPriorFork(alone, withPrior) === PRIOR_FORK_HELP) {
    return bucketId(withPrior);
  }
  return bucketId(alone);
}

/**
 * @param {unknown} row
 * @returns {boolean}
 */
export function isEligiblePriorReplayRow(row) {
  if (!isOkSemanticShadowRow(row)) return false;
  if (!row.hadPriorTurn) return false;
  const alone = bucketId(row.semanticCoarse);
  const withPrior = bucketId(row.semanticCoarseWithPrior);
  return Boolean(alone && withPrior);
}

/**
 * @param {object[]} rows
 * @returns {{
 *   eligibleCount: number,
 *   naiveHelp: number,
 *   naiveHarm: number,
 *   naiveOther: number,
 *   naiveSame: number,
 *   ruleHelp: number,
 *   ruleHarm: number,
 *   skippedNotEligible: number,
 *   forks: object[]
 * }}
 */
export function summarizeConfideSemanticPriorAsymmetric(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const forks = [];
  let skippedNotEligible = 0;
  let naiveHelp = 0;
  let naiveHarm = 0;
  let naiveOther = 0;
  let naiveSame = 0;
  let ruleHelp = 0;
  let ruleHarm = 0;

  for (const row of list) {
    if (!isEligiblePriorReplayRow(row)) {
      if (row && typeof row === 'object' && row.kind === 'semantic_shadow_classify') {
        skippedNotEligible += 1;
      }
      continue;
    }
    const alone = bucketId(row.semanticCoarse);
    const withPrior = bucketId(row.semanticCoarseWithPrior);
    const naiveFork = classifyPriorFork(alone, withPrior);
    const ruled = applyAsymmetricPriorRule(alone, withPrior);
    const ruleFork = classifyPriorFork(alone, ruled);
    if (naiveFork === PRIOR_FORK_HELP) naiveHelp += 1;
    else if (naiveFork === PRIOR_FORK_HARM) naiveHarm += 1;
    else if (naiveFork === PRIOR_FORK_OTHER) naiveOther += 1;
    else naiveSame += 1;
    if (ruleFork === PRIOR_FORK_HELP) ruleHelp += 1;
    if (ruleFork === PRIOR_FORK_HARM) ruleHarm += 1;
    forks.push({
      at: row.at ?? null,
      text: row.text ?? '',
      alone,
      withPrior,
      naiveFork,
      ruledBucket: ruled,
      ruleFork
    });
  }

  return {
    eligibleCount: forks.length,
    naiveHelp,
    naiveHarm,
    naiveOther,
    naiveSame,
    ruleHelp,
    ruleHarm,
    skippedNotEligible,
    forks
  };
}

/**
 * @param {number} help
 * @param {number} harm
 * @returns {string}
 */
export function formatHelpHarmRatio(help, harm) {
  const denom = help + harm;
  if (!denom) return 'n/a';
  return `${(help / denom).toFixed(4)} (${help}÷${denom})`;
}

/**
 * @param {{
 *   filePath: string,
 *   eligibleCount: number,
 *   naiveHelp: number,
 *   naiveHarm: number,
 *   naiveOther: number,
 *   naiveSame: number,
 *   ruleHelp: number,
 *   ruleHarm: number,
 *   skippedNotEligible: number,
 *   jsonPath: string
 * }} summary
 * @returns {string}
 */
export function formatPriorAsymmetricReport(summary) {
  return [
    'semantic prior asymmetric replay',
    `file: ${summary.filePath}`,
    `eligible=${summary.eligibleCount}`,
    `naiveHelp=${summary.naiveHelp}`,
    `naiveHarm=${summary.naiveHarm}`,
    `naiveOther=${summary.naiveOther}`,
    `naiveSame=${summary.naiveSame}`,
    `naiveHelp÷(help+harm)=${formatHelpHarmRatio(summary.naiveHelp, summary.naiveHarm)}`,
    `ruleHelp=${summary.ruleHelp}`,
    `ruleHarm=${summary.ruleHarm}`,
    `ruleHelp÷(help+harm)=${formatHelpHarmRatio(summary.ruleHelp, summary.ruleHarm)}`,
    `skippedNotEligible=${summary.skippedNotEligible}`,
    `json: ${summary.jsonPath}`
  ].join('\n');
}
