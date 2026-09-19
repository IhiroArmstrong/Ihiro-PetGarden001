/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Summarize Read Hybrid classify rows from Electron turns.jsonl for gapfill audit.
 * Read-only: replays production regex matchers; does not mutate logs or send path.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { matchConfideExecutableTool } from './confideExecutableTools.js';
import { parseConfideReadHybridJson } from './confideToolCallParse.js';
import { shouldRunConfideReadHybridClassify } from './confideReadHybrid.js';

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function parseHybridToolIdFromRaw(raw) {
  const parsed = parseConfideReadHybridJson(raw);
  if (!parsed.ok) return null;
  return parsed.tool;
}

/**
 * @param {string} text
 * @returns {import('./confideExecutableTools.js').CONFIDE_EXECUTABLE_TOOLS[number] | null}
 */
export function replayConfideExecutableToolMatch(text) {
  return matchConfideExecutableTool({
    route: CONFIDE_ROUTE.FALLBACK,
    text
  });
}

/**
 * @typedef {{
 *   at?: string,
 *   kind?: string,
 *   text?: string,
 *   raw?: string,
 *   ok?: boolean
 * }} TurnLogRow
 */

/**
 * @param {TurnLogRow[]} rows
 * @param {{ requireText?: boolean, sinceIso?: string }} [opts]
 * @returns {{
 *   totalRows: number,
 *   hybridRows: number,
 *   withText: number,
 *   skippedNoText: number,
 *   skippedBeforeSince: number,
 *   toolNonNone: number,
 *   toolNone: number,
 *   regexWouldMatch: number,
 *   falseGapfill: number,
 *   trueGapfill: number,
 *   wouldSkipClassify: number,
 *   samples: {
 *     falseGapfill: Array<{ at?: string, text: string, hybridTool: string, regexTool: string }>,
 *     trueGapfill: Array<{ at?: string, text: string, hybridTool: string }>
 *   }
 * }}
 */
export function summarizeReadHybridGapfill(rows, opts = {}) {
  const requireText = Boolean(opts.requireText);
  const sinceMs =
    typeof opts.sinceIso === 'string' && opts.sinceIso.trim()
      ? Date.parse(opts.sinceIso)
      : NaN;

  const hybridRows = rows.filter((row) => row?.kind === 'read_hybrid_classify');
  let skippedNoText = 0;
  let skippedBeforeSince = 0;
  let withText = 0;
  let toolNonNone = 0;
  let toolNone = 0;
  let regexWouldMatch = 0;
  let falseGapfill = 0;
  let trueGapfill = 0;
  let wouldSkipClassify = 0;
  const falseGapfillSamples = [];
  const trueGapfillSamples = [];

  for (const row of hybridRows) {
    const atMs = row.at ? Date.parse(row.at) : NaN;
    if (Number.isFinite(sinceMs) && (!Number.isFinite(atMs) || atMs < sinceMs)) {
      skippedBeforeSince += 1;
      continue;
    }

    const text = typeof row.text === 'string' ? row.text.trim() : '';
    if (!text) {
      skippedNoText += 1;
      if (requireText) continue;
    } else {
      withText += 1;
    }

    const hybridTool = parseHybridToolIdFromRaw(String(row.raw || '')) || 'unparsed';
    const regexTool = text ? replayConfideExecutableToolMatch(text) : null;
    const skipClassify = text ? !shouldRunConfideReadHybridClassify(text) : false;

    if (skipClassify) wouldSkipClassify += 1;
    if (regexTool) regexWouldMatch += 1;

    if (hybridTool !== 'none' && hybridTool !== 'unparsed') {
      toolNonNone += 1;
      if (regexTool) {
        falseGapfill += 1;
        if (falseGapfillSamples.length < 12 && text) {
          falseGapfillSamples.push({
            at: row.at,
            text,
            hybridTool,
            regexTool: regexTool.id
          });
        }
      } else {
        trueGapfill += 1;
        if (trueGapfillSamples.length < 12 && text) {
          trueGapfillSamples.push({ at: row.at, text, hybridTool });
        }
      }
    } else if (hybridTool === 'none') {
      toolNone += 1;
    }
  }

  const analyzed =
    hybridRows.length - skippedBeforeSince - (requireText ? skippedNoText : 0);

  return {
    totalRows: rows.length,
    hybridRows: hybridRows.length,
    analyzed,
    withText,
    skippedNoText,
    skippedBeforeSince,
    toolNonNone,
    toolNone,
    regexWouldMatch,
    falseGapfill,
    trueGapfill,
    wouldSkipClassify,
    samples: {
      falseGapfill: falseGapfillSamples,
      trueGapfill: trueGapfillSamples
    }
  };
}
