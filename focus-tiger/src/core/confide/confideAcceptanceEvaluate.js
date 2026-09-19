/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Batch evaluator for frozen Confide acceptance fixtures.
 * Mirrors Electron desktop routing (regex + corpus retrieve + generate gate)
 * without UI — same modules as unit tests / future CI gate.
 */

import {
  isConfideGenerateEligible,
  resolveConfideDesktopSource,
  resolveConfideMetaQueryBucket
} from './confideAcceptanceResolve.js';
import { CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES } from './confideAggressionAcceptanceFixtures.js';
import { confideClassify } from './confideClassify.js';
import { confideLineText } from './confideCorpus.js';
import { resolveConfideReply } from './confideReplyFlow.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { CONFIDE_ROUND_ACCEPTANCE_FIXTURES } from './confideRoundAcceptanceFixtures.js';

/** @type {Readonly<Record<string, 'en' | 'zh' | 'ja'>>} */
const AGGRESSION_LOCALE_BY_ID = Object.freeze(
  Object.fromEntries(
    CONFIDE_AGGRESSION_ACCEPTANCE_FIXTURES.map((row) => [
      row.id,
      row.locale === 'zh' || row.locale === 'ja' ? row.locale : 'en'
    ])
  )
);

/**
 * @param {import('./confideCorpus.js').ConfideLine | null | undefined} line
 * @returns {string[]}
 */
function replyRedlineViolations(line) {
  if (!line) return ['missing reply line'];
  const fails = [];
  if (/heard/i.test(line.en)) fails.push('en:Heard');
  if (/nod/i.test(line.en)) fails.push('en:nod');
  if (/听见了/.test(line.zh)) fails.push('zh:听见了');
  if (/点头/.test(line.zh)) fails.push('zh:点头');
  if (/聴いた/.test(line.ja)) fails.push('ja:聴いた');
  if (/うなず/.test(line.ja)) fails.push('ja:うなず');
  return fails;
}

/**
 * @param {import('./confideRoundAcceptanceFixtures.js').ConfideRoundAcceptanceFixture} row
 * @returns {{
 *   id: string,
 *   text: string,
 *   suite: string,
 *   kind: string,
 *   expect: string,
 *   actual: Record<string, unknown>,
 *   pass: boolean,
 *   failures: string[]
 * }}
 */
export function evaluateConfideAcceptanceRow(row) {
  /** @type {Record<string, unknown>} */
  const actual = {};
  /** @type {string[]} */
  const failures = [];

  if (row.kind === 'meta_query') {
    actual.route = confideClassify(row.text);
    actual.bucket = resolveConfideMetaQueryBucket(row.text);
    actual.source = resolveConfideDesktopSource(row.text);
    actual.generate = isConfideGenerateEligible(row.text);
    if (actual.bucket !== row.expect) {
      failures.push(`bucket ${actual.bucket} !== ${row.expect}`);
    }
    if (actual.route === CONFIDE_ROUTE.FALLBACK) {
      if (row.expect === 'generate_skip_classify') {
        if (actual.source !== 'generate') {
          failures.push(`source ${actual.source} !== generate`);
        }
      } else if (actual.source !== row.expect) {
        failures.push(`source ${actual.source} !== ${row.expect}`);
      }
    } else if (row.expect === 'generate_skip_classify') {
      if (actual.source !== 'corpus' && actual.source !== 'generate') {
        failures.push(`source ${actual.source} not corpus/generate when emotion preempt`);
      }
    } else if (actual.source !== 'corpus') {
      failures.push(`source ${actual.source} !== corpus (classify=${actual.route})`);
    }
  } else if (row.kind === 'aggression_route') {
    actual.route = confideClassify(row.text);
    actual.source = resolveConfideDesktopSource(row.text);
    actual.generate = isConfideGenerateEligible(row.text);
    if (actual.route !== row.expect) {
      failures.push(`route ${actual.route} !== ${row.expect}`);
    }
    if (row.expect === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS) {
      if (actual.source !== 'corpus') {
        failures.push(`source ${actual.source} !== corpus`);
      }
      if (actual.generate) {
        failures.push('generate must not run');
      }
      const locale = AGGRESSION_LOCALE_BY_ID[row.id] || 'en';
      const hit = resolveConfideReply({
        text: row.text,
        locale,
        localDate: '2026-09-19'
      });
      actual.replyId = hit?.line?.id ?? null;
      actual.replyText = confideLineText(hit?.line, locale);
      failures.push(...replyRedlineViolations(hit?.line).map((v) => `reply ${v}`));
    } else if (row.expect === CONFIDE_ROUTE.SAFETY_REDIRECT) {
      if (actual.source !== 'corpus') {
        failures.push(`source ${actual.source} !== corpus`);
      }
      if (actual.generate) {
        failures.push('generate must not run');
      }
      const hit = resolveConfideReply({ text: row.text, localDate: '2026-09-19' });
      if (hit?.line?.id !== 'safety-01') {
        failures.push(`replyId ${hit?.line?.id ?? 'null'} !== safety-01`);
      }
    } else if (row.expect === CONFIDE_ROUTE.FALLBACK) {
      if (actual.route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS) {
        failures.push('must not route to aggression_toward_others');
      }
    }
  } else if (row.kind === 'classify_route') {
    actual.route = confideClassify(row.text);
    actual.source = resolveConfideDesktopSource(row.text);
    if (actual.route !== row.expect) {
      failures.push(`route ${actual.route} !== ${row.expect}`);
    }
    if (actual.source !== 'corpus') {
      failures.push(`source ${actual.source} !== corpus`);
    }
    if (row.id === 'round-negative-tired-not-boundary') {
      if (resolveConfideMetaQueryBucket(row.text) === 'boundary') {
        failures.push('must not route to boundary');
      }
    }
  } else if (row.kind === 'desktop_source') {
    actual.source = resolveConfideDesktopSource(row.text);
    if (actual.source !== row.expect) {
      failures.push(`source ${actual.source} !== ${row.expect}`);
    }
  } else if (row.kind === 'generate_eligible') {
    actual.generate = isConfideGenerateEligible(row.text);
    actual.source = resolveConfideDesktopSource(row.text);
    const want = row.expect === 'true';
    if (actual.generate !== want) {
      failures.push(`generate ${actual.generate} !== ${want}`);
    }
    if (want && actual.source !== 'generate') {
      failures.push(`source ${actual.source} !== generate`);
    }
  } else {
    failures.push(`unknown kind ${row.kind}`);
  }

  return {
    id: row.id,
    text: row.text,
    suite: row.suite,
    kind: row.kind,
    expect: row.expect,
    actual,
    pass: failures.length === 0,
    failures
  };
}

/**
 * @param {object} [opts]
 * @param {readonly ('meta' | 'aggression' | 'supplement')[]} [opts.suites]
 * @param {readonly import('./confideRoundAcceptanceFixtures.js').ConfideRoundAcceptanceFixture[]} [opts.fixtures]
 * @returns {readonly ReturnType<typeof evaluateConfideAcceptanceRow>[]}
 */
export function runConfideAcceptanceBatch({
  suites = null,
  fixtures = CONFIDE_ROUND_ACCEPTANCE_FIXTURES
} = {}) {
  const filtered = suites?.length
    ? fixtures.filter((row) => suites.includes(row.suite))
    : fixtures;
  return filtered.map((row) => evaluateConfideAcceptanceRow(row));
}

/**
 * @param {readonly import('./confideRoundAcceptanceFixtures.js').ConfideRoundAcceptanceFixture[]} fixtures
 * @param {readonly ('meta' | 'aggression' | 'supplement')[] | null} [suites]
 */
export function runConfideAcceptanceBatchSync(fixtures, suites = null) {
  return runConfideAcceptanceBatch({ suites, fixtures });
}

/**
 * @param {readonly ReturnType<typeof evaluateConfideAcceptanceRow>[]} results
 * @returns {{ total: number, pass: number, bySuite: Record<string, { pass: number, total: number }> }}
 */
export function summarizeConfideAcceptanceResults(results) {
  /** @type {Record<string, { pass: number, total: number }>} */
  const bySuite = {};
  let pass = 0;
  for (const row of results) {
    if (!bySuite[row.suite]) bySuite[row.suite] = { pass: 0, total: 0 };
    bySuite[row.suite].total += 1;
    if (row.pass) {
      pass += 1;
      bySuite[row.suite].pass += 1;
    }
  }
  return { total: results.length, pass, bySuite };
}
