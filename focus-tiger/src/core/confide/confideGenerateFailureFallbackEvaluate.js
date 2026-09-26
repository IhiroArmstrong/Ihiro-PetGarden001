/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Batch evaluator for Confide generate-failure corpus fallback (#930).
 * Node-only — mirrors resolveCorpusFallbackAfterGenerateFailure in production UI.
 */

import { isConfideGenerateEligible } from './confideAcceptanceResolve.js';
import { CONFIDE_GENERATE_FAILURE_CORPUS_EXCLUDE_IDS } from './confideCorpus.js';
import {
  CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS,
  CONFIDE_GENERATE_FAILURE_FALLBACK_FIXTURES,
  CONFIDE_GENERATE_FAILURE_FALLBACK_GENERATE_FIXTURES
} from './confideGenerateFailureFallbackFixtures.js';
import {
  resolveConfideReply,
  resolveCorpusFallbackAfterGenerateFailure
} from './confideReplyFlow.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

const LOCAL_DATE = '2026-09-22';
const PRIVACY_RE = /留在这里|stays here|ここに置く/i;

/**
 * @param {import('./confideGenerateFailureFallbackFixtures.js').ConfideGenerateFailureFallbackFixture} row
 * @param {number} salt
 * @param {ReadonlySet<string>} excludeIds
 * @param {unknown[]} history
 * @returns {{ lineId: string, text: string } | null}
 */
function pickGenerateFailureFallback(row, salt, excludeIds, history) {
  const hit = resolveCorpusFallbackAfterGenerateFailure({
    locale: row.locale || 'en',
    localDate: LOCAL_DATE,
    salt,
    excludeIds,
    history
  });
  if (!hit) return null;
  return { lineId: hit.line.id, text: hit.text };
}

/**
 * @param {import('./confideGenerateFailureFallbackFixtures.js').ConfideGenerateFailureFallbackFixture} row
 * @returns {{
 *   id: string,
 *   text: string,
 *   kind: string,
 *   checks: number,
 *   pass: boolean,
 *   failures: string[],
 *   actual: Record<string, unknown>
 * }}
 */
export function evaluateGenerateFailureFallbackRow(row) {
  /** @type {string[]} */
  const failures = [];
  /** @type {Record<string, unknown>} */
  const actual = {};
  let checks = 0;

  if (row.kind === 'generate_fail') {
    actual.generateEligible = isConfideGenerateEligible(row.text);
    if (!actual.generateEligible) {
      failures.push('text must enter desktop generate path');
    }

    /** @type {string[]} */
    const badIds = [];
    for (let salt = 0; salt < CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS.saltSweep; salt += 1) {
      checks += 1;
      const hit = pickGenerateFailureFallback(row, salt, new Set(), []);
      if (!hit) {
        failures.push(`salt ${salt}: no fallback line`);
        continue;
      }
      if (hit.lineId === 'fallback-02') badIds.push(`salt ${salt}`);
      if (PRIVACY_RE.test(hit.text)) badIds.push(`salt ${salt}: privacy copy`);
    }
    if (badIds.length) {
      failures.push(`privacy fallback in salt sweep: ${badIds.slice(0, 4).join(', ')}`);
    }

    /** @type {Array<{ repeat: number, lineId: string, text: string }>} */
    const sessionHits = [];
    /** @type {Array<{ role?: string, text?: string, source?: string }>} */
    const history = [];
    const sessionExclude = new Set();
    for (
      let repeat = 1;
      repeat <= CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS.sessionRepeats;
      repeat += 1
    ) {
      checks += 1;
      const hit = pickGenerateFailureFallback(
        row,
        sessionExclude.size,
        sessionExclude,
        history
      );
      if (!hit) {
        failures.push(`session repeat ${repeat}: no fallback line`);
        continue;
      }
      sessionHits.push({ repeat, lineId: hit.lineId, text: hit.text });
      if (hit.lineId === 'fallback-02') {
        failures.push(`session repeat ${repeat}: fallback-02`);
      }
      if (PRIVACY_RE.test(hit.text)) {
        failures.push(`session repeat ${repeat}: privacy copy`);
      }
      sessionExclude.add(hit.lineId);
      history.push({ role: 'user', text: row.text });
      history.push({ role: 'yin', text: hit.text, source: 'corpus' });
    }
    actual.sessionLineIds = sessionHits.map((h) => h.lineId);
    actual.hardExcludeIds = [...CONFIDE_GENERATE_FAILURE_CORPUS_EXCLUDE_IDS];
  } else if (row.kind === 'corpus_control') {
    /** @type {string[]} */
    const ids = new Set();
    for (let salt = 0; salt < CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS.saltSweep; salt += 1) {
      checks += 1;
      const hit = resolveConfideReply({
        text: row.text,
        locale: row.locale || 'en',
        localDate: LOCAL_DATE,
        salt
      });
      if (!hit) {
        failures.push(`salt ${salt}: resolveConfideReply returned null`);
        continue;
      }
      ids.add(hit.line.id);
      if (hit.route !== CONFIDE_ROUTE.FALLBACK) {
        failures.push(`salt ${salt}: route ${hit.route} !== fallback`);
      }
    }
    actual.fallbackIdsSeen = [...ids].sort();
    if (!ids.has('fallback-02')) {
      failures.push('normal corpus path must still be able to pick fallback-02');
    }
  } else {
    failures.push(`unknown kind ${row.kind}`);
  }

  return {
    id: row.id,
    text: row.text,
    kind: row.kind,
    checks,
    pass: failures.length === 0,
    failures,
    actual
  };
}

/**
 * @param {object} [opts]
 * @param {readonly import('./confideGenerateFailureFallbackFixtures.js').ConfideGenerateFailureFallbackFixture[]} [opts.fixtures]
 * @returns {ReturnType<typeof evaluateGenerateFailureFallbackRow>[]}
 */
export function runGenerateFailureFallbackBatch(opts = {}) {
  const fixtures = opts.fixtures || CONFIDE_GENERATE_FAILURE_FALLBACK_FIXTURES;
  return fixtures.map((row) => evaluateGenerateFailureFallbackRow(row));
}

/**
 * @param {ReturnType<typeof evaluateGenerateFailureFallbackRow>[]} results
 */
export function summarizeGenerateFailureFallbackResults(results) {
  const byKind = Object.freeze({
    generate_fail: { pass: 0, total: 0, checks: 0 },
    corpus_control: { pass: 0, total: 0, checks: 0 }
  });
  let pass = 0;
  let checks = 0;
  for (const row of results) {
    const bucket = byKind[row.kind] || { pass: 0, total: 0, checks: 0 };
    bucket.total += 1;
    bucket.checks += row.checks;
    if (row.pass) {
      bucket.pass += 1;
      pass += 1;
    }
    checks += row.checks;
  }
  return Object.freeze({
    pass,
    total: results.length,
    checks,
    byKind,
    generateFailFixtures: CONFIDE_GENERATE_FAILURE_FALLBACK_GENERATE_FIXTURES.length
  });
}
