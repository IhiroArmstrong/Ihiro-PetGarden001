/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Prompt 8 lab probe: semantic live classify cold-start vs ready paths.
 * Mirrors l1Runtime.semanticLiveClassify fail-open when embedding is not ready.
 */

import { buildConfideSemanticLiveLogRecord } from './confideSemanticCoarseMap.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';

/** @type {readonly { text: string, route: string, source: string, literalCoarse: string }[]} */
export const SEMANTIC_LIVE_COLDSTART_PROBE_FIXTURES = Object.freeze([
  {
    text: '累积了多久',
    route: CONFIDE_ROUTE.TIRED,
    source: '',
    literalCoarse: CONFIDE_SEMANTIC_BUCKET.EMOTIONAL
  }
]);

/**
 * @param {{ isReady: () => boolean, shouldRequestEnsure?: () => boolean, markLoading?: () => void }} gate
 * @param {{ text: string, route: string, source: string, literalCoarse: string }} fixture
 * @returns {{ ok: false, reason: 'embed_not_ready', bucket: null, timing: { wallMs: number } } | null}
 */
export function resolveSemanticLiveWhenGateNotReady(gate, fixture) {
  if (!gate || typeof gate.isReady !== 'function' || gate.isReady()) return null;
  if (gate.shouldRequestEnsure?.()) {
    gate.markLoading?.();
  }
  return {
    ok: false,
    reason: 'embed_not_ready',
    bucket: null,
    timing: { wallMs: 0 }
  };
}

/**
 * @param {{
 *   gate: { isReady: () => boolean, shouldRequestEnsure?: () => boolean, markLoading?: () => void, applyEvent?: (ev: object) => void },
 *   classifyUserText: (text: string) => Promise<{ bucket: string, scoreA: number, scoreB: number, grayMargin: number, embedMs?: number }>,
 *   fixtures?: Array<{ text: string, route: string, source: string, literalCoarse: string }>
 * }} opts
 * @returns {Promise<{ rows: object[], coldRows: object[], readyRows: object[] }>}
 */
export async function runSemanticLiveColdstartProbe(opts) {
  const fixtures = Array.isArray(opts.fixtures) && opts.fixtures.length
    ? opts.fixtures
    : SEMANTIC_LIVE_COLDSTART_PROBE_FIXTURES;
  const gate = opts.gate;
  const classifyUserText = opts.classifyUserText;
  /** @type {object[]} */
  const rows = [];
  /** @type {object[]} */
  const coldRows = [];
  /** @type {object[]} */
  const readyRows = [];

  for (const fixture of fixtures) {
    const cold = resolveSemanticLiveWhenGateNotReady(gate, fixture);
    if (!cold) {
      throw new Error('semantic_live_coldstart_probe_expected_gate_not_ready');
    }
    const coldRecord = buildConfideSemanticLiveLogRecord({
      text: fixture.text,
      route: fixture.route,
      source: fixture.source,
      literalCoarse: fixture.literalCoarse,
      semanticResult: null,
      ok: cold.ok,
      reason: cold.reason,
      timing: cold.timing
    });
    rows.push(coldRecord);
    coldRows.push(coldRecord);
  }

  gate.applyEvent?.({ event: 'embedding_ready' });

  for (const fixture of fixtures) {
    const classified = await classifyUserText(fixture.text);
    const readyRecord = buildConfideSemanticLiveLogRecord({
      text: fixture.text,
      route: fixture.route,
      source: fixture.source,
      literalCoarse: fixture.literalCoarse,
      semanticResult: {
        bucket: classified.bucket,
        scoreA: classified.scoreA,
        scoreB: classified.scoreB,
        grayMargin: classified.grayMargin
      },
      ok: true,
      reason: 'ok',
      timing: {
        wallMs: classified.embedMs ?? 0,
        embedMs: classified.embedMs ?? 0
      }
    });
    rows.push(readyRecord);
    readyRows.push(readyRecord);
  }

  return { rows, coldRows, readyRows };
}

/**
 * @param {{
 *   liveCount: number,
 *   failOpenCount: number,
 *   semanticOkCount: number,
 *   coldRows: number,
 *   readyRows: number
 * }} summary
 * @returns {boolean}
 */
export function isSemanticLiveColdstartProbePass(summary) {
  return (
    summary.liveCount === summary.coldRows + summary.readyRows &&
    summary.coldRows >= 1 &&
    summary.readyRows >= 1 &&
    summary.failOpenCount === summary.coldRows &&
    summary.semanticOkCount === summary.readyRows
  );
}
