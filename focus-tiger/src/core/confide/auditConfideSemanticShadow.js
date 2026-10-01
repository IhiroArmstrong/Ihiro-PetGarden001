/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Prompt 8: summarize semantic shadow rows from turns.jsonl.
 * Reports N / D / D÷N and CSV of disagreements only.
 * Does not judge whether to switch production routing.
 */

export const CONFIDE_SEMANTIC_SHADOW_KIND = 'semantic_shadow_classify';

export const CONFIDE_SEMANTIC_LIVE_KIND = 'semantic_live_classify';

export const SEMANTIC_SHADOW_CSV_COLUMNS = Object.freeze([
  'at',
  'text',
  'route',
  'source',
  'literalCoarse',
  'semanticCoarse',
  'scoreA',
  'scoreB',
  'grayMargin',
  'hadPriorTurn',
  'semanticCoarseWithPrior',
  'scoreAWithPrior',
  'scoreBWithPrior',
  'favorable_disagreement'
]);

/**
 * @param {unknown} row
 * @returns {boolean}
 */
export function isOkSemanticShadowRow(row) {
  if (!row || typeof row !== 'object') return false;
  if (row.kind !== CONFIDE_SEMANTIC_SHADOW_KIND) return false;
  return row.ok === true;
}

/**
 * @param {{ literalCoarse?: unknown, semanticCoarse?: unknown }} row
 * @returns {boolean}
 */
export function isSemanticShadowDisagreement(row) {
  return String(row.literalCoarse ?? '') !== String(row.semanticCoarse ?? '');
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function csvEscape(value) {
  if (value == null) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * @param {object} row
 * @returns {string}
 */
export function formatSemanticShadowCsvRow(row) {
  const cells = [
    row.at,
    row.text,
    row.route,
    row.source,
    row.literalCoarse,
    row.semanticCoarse,
    row.scoreA,
    row.scoreB,
    row.grayMargin,
    row.hadPriorTurn,
    row.semanticCoarseWithPrior,
    row.scoreAWithPrior,
    row.scoreBWithPrior,
    ''
  ];
  return cells.map(csvEscape).join(',');
}

/**
 * @param {object[]} disagreementRows
 * @returns {string}
 */
export function formatSemanticShadowDisagreementCsv(disagreementRows) {
  const header = SEMANTIC_SHADOW_CSV_COLUMNS.join(',');
  const body = disagreementRows.map(formatSemanticShadowCsvRow);
  return `${[header, ...body].join('\n')}\n`;
}

/**
 * @param {number} sampleCount
 * @param {number} disagreementCount
 * @returns {string}
 */
export function formatSemanticShadowRatio(sampleCount, disagreementCount) {
  if (!sampleCount) return 'n/a';
  return `${(disagreementCount / sampleCount).toFixed(4)} (${disagreementCount}÷${sampleCount})`;
}

/**
 * @param {unknown} row
 * @returns {boolean}
 */
export function isConfideSemanticLiveFailOpen(row) {
  if (!row || typeof row !== 'object') return false;
  if (row.kind !== CONFIDE_SEMANTIC_LIVE_KIND) return false;
  return row.ok !== true || row.reason !== 'ok';
}

/**
 * @param {unknown} row
 * @returns {boolean}
 */
export function isConfideSemanticLiveJudged(row) {
  if (!row || typeof row !== 'object') return false;
  if (row.kind !== CONFIDE_SEMANTIC_LIVE_KIND) return false;
  return row.ok === true && row.reason === 'ok';
}

/**
 * @param {object[]} rows
 * @returns {{
 *   liveCount: number,
 *   failOpenCount: number,
 *   semanticOkCount: number,
 *   samples: object[]
 * }}
 */
export function summarizeConfideSemanticLive(rows) {
  const samples = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    if (row.kind !== CONFIDE_SEMANTIC_LIVE_KIND) continue;
    samples.push(row);
  }
  const failOpenCount = samples.filter(isConfideSemanticLiveFailOpen).length;
  const semanticOkCount = samples.filter(isConfideSemanticLiveJudged).length;
  return {
    liveCount: samples.length,
    failOpenCount,
    semanticOkCount,
    samples
  };
}

/**
 * @param {{
 *   liveCount: number,
 *   failOpenCount: number,
 *   semanticOkCount: number
 * }} summary
 * @returns {string}
 */
export function formatSemanticLiveAuditLines(summary) {
  return [
    `live=${summary.liveCount}`,
    `failOpen=${summary.failOpenCount}`,
    `semanticOk=${summary.semanticOkCount}`
  ].join('\n');
}

/**
 * @param {{
 *   filePath: string,
 *   sampleCount: number,
 *   disagreementCount: number,
 *   skippedNotOk: number,
 *   skippedMalformed?: number,
 *   csvPath: string,
 *   liveSummary?: {
 *     liveCount: number,
 *     failOpenCount: number,
 *     semanticOkCount: number
 *   }
 * }} summary
 * @returns {string}
 */
export function formatSemanticShadowReport(summary) {
  const lines = [
    'semantic shadow disagreement',
    `file: ${summary.filePath}`,
    `N=${summary.sampleCount}`,
    `D=${summary.disagreementCount}`,
    `D÷N=${formatSemanticShadowRatio(summary.sampleCount, summary.disagreementCount)}`,
    `skippedNotOk=${summary.skippedNotOk}`,
    `skippedMalformed=${summary.skippedMalformed ?? 0}`,
    `csv: ${summary.csvPath}`
  ];
  if (summary.liveSummary) {
    lines.push(formatSemanticLiveAuditLines(summary.liveSummary));
  }
  return lines.join('\n');
}

/**
 * Parse turns.jsonl. Skip blank and invalid lines; never throw on one bad row.
 *
 * @param {string} raw
 * @returns {{ rows: object[], skippedMalformed: number }}
 */
export function parseTurnsJsonl(raw) {
  const rows = [];
  let skippedMalformed = 0;
  const text = typeof raw === 'string' ? raw : '';
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') rows.push(parsed);
      else skippedMalformed += 1;
    } catch {
      skippedMalformed += 1;
    }
  }
  return { rows, skippedMalformed };
}

/**
 * @param {object[]} rows
 * @returns {{
 *   sampleCount: number,
 *   disagreementCount: number,
 *   skippedNotOk: number,
 *   samples: object[],
 *   disagreements: object[]
 * }}
 */
export function summarizeConfideSemanticShadow(rows) {
  const samples = [];
  let skippedNotOk = 0;

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    if (row.kind !== CONFIDE_SEMANTIC_SHADOW_KIND) continue;
    if (row.ok !== true) {
      skippedNotOk += 1;
      continue;
    }
    samples.push(row);
  }

  const disagreements = samples.filter(isSemanticShadowDisagreement);
  return {
    sampleCount: samples.length,
    disagreementCount: disagreements.length,
    skippedNotOk,
    samples,
    disagreements
  };
}
