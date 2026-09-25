/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Round-2 KB matrix probe candidates from real turns.jsonl kb_retrieval_miss rows.
 * Does not judge whether to switch to embedding routing.
 */

import { resolveConfideDesktopSource } from './confideAcceptanceResolve.js';
import { retrieveProductKnowledge } from './confideProductKnowledge.js';
import {
  buildKbMatrixFixtureTextSet,
  compactKbMatrixProbeText,
  normalizeKbMatrixProbeText
} from './confideKbRoutingMatrix.js';

export const KB_RETRIEVAL_MISS_KIND = 'kb_retrieval_miss';

/** Below this count of novel log-derived probes, defer round-2 to 2026-10-12 review. */
export const KB_MATRIX_PROBE_ROUND2_MIN_NOVEL = 5;

export const KB_MATRIX_PROBE_CSV_COLUMNS = Object.freeze([
  'at',
  'text',
  'reason',
  'locale',
  'dataSource',
  'catalogId',
  'alreadyInMatrix'
]);

/**
 * @param {unknown} row
 * @returns {boolean}
 */
export function isKbRetrievalMissRow(row) {
  return Boolean(row && typeof row === 'object' && row.kind === KB_RETRIEVAL_MISS_KIND);
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function csvEscapeKbProbe(value) {
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
export function formatKbMatrixProbeCsvRow(row) {
  const cells = [
    row.at,
    row.text,
    row.reason,
    row.locale,
    row.dataSource,
    row.catalogId,
    row.alreadyInMatrix ? 'yes' : 'no'
  ];
  return cells.map(csvEscapeKbProbe).join(',');
}

/**
 * @param {object[]} novelRows
 * @returns {string}
 */
export function formatKbMatrixProbeCsv(novelRows) {
  const header = KB_MATRIX_PROBE_CSV_COLUMNS.join(',');
  const body = novelRows.map(formatKbMatrixProbeCsvRow);
  return `${[header, ...body].join('\n')}\n`;
}

/**
 * @param {object[]} rows
 * @param {Set<string>} [fixtureTextSet]
 */
export function summarizeKbMatrixProbeCandidates(rows, fixtureTextSet = buildKbMatrixFixtureTextSet()) {
  /** @type {Map<string, object>} */
  const byText = new Map();
  let missRowCount = 0;

  for (const row of rows) {
    if (!isKbRetrievalMissRow(row)) continue;
    missRowCount += 1;
    const text = String(row.text || '').trim();
    if (!text) continue;
    const key = compactKbMatrixProbeText(text);
    if (!key) continue;
    const existing = byText.get(key);
    const at = String(row.at || '');
    if (!existing || at > String(existing.at || '')) {
      byText.set(key, {
        text,
        reason: String(row.reason || ''),
        locale: String(row.locale || ''),
        at
      });
    }
  }

  /** @type {object[]} */
  const candidates = [];
  for (const entry of byText.values()) {
    const dataSource = resolveConfideDesktopSource(entry.text);
    const catalog = retrieveProductKnowledge(entry.text);
    const probeKey = compactKbMatrixProbeText(entry.text);
    const spacedKey = normalizeKbMatrixProbeText(entry.text);
    candidates.push({
      ...entry,
      alreadyInMatrix: fixtureTextSet.has(probeKey) || fixtureTextSet.has(spacedKey),
      dataSource,
      catalogId: catalog.hit ? catalog.id : null,
      catalogHit: Boolean(catalog.hit)
    });
  }
  candidates.sort((a, b) => String(b.at).localeCompare(String(a.at)));

  const novel = candidates.filter((row) => !row.alreadyInMatrix);
  return {
    missRowCount,
    uniqueMissCount: candidates.length,
    novelCount: novel.length,
    novel,
    candidates,
    readyForRound2: novel.length >= KB_MATRIX_PROBE_ROUND2_MIN_NOVEL
  };
}

/**
 * @param {{
 *   filePath: string,
 *   missRowCount: number,
 *   uniqueMissCount: number,
 *   novelCount: number,
 *   readyForRound2: boolean,
 *   csvPath?: string,
 *   jsonPath?: string
 * }} input
 * @returns {string}
 */
export function formatKbMatrixProbeReport(input) {
  const lines = [
    `[kb-matrix-probes] file=${input.filePath}`,
    `missRows=${input.missRowCount} unique=${input.uniqueMissCount} novel=${input.novelCount}`,
    `round2Ready=${input.readyForRound2 ? 'yes' : 'no'} (need novel≥${KB_MATRIX_PROBE_ROUND2_MIN_NOVEL} from logs; else defer to 2026-10-12 with with-prior/Stage2 review)`,
    'source=kb_retrieval_miss only; do not brainstorm probes in a meeting',
    'script must not print "start embedding now"'
  ];
  if (input.csvPath) lines.push(`csv=${input.csvPath}`);
  if (input.jsonPath) lines.push(`json=${input.jsonPath}`);
  return `${lines.join('\n')}\n`;
}
