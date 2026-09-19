/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Terminal batch runner for frozen Confide acceptance fixtures.
 * No Electron UI — uses the same desktop routing resolvers as production send.
 *
 *   npm run test:confide-acceptance
 *   node scripts/run-confide-acceptance.js --suites=meta,aggression
 */

import {
  runConfideAcceptanceBatch,
  summarizeConfideAcceptanceResults
} from '../src/core/confide/confideAcceptanceEvaluate.js';

/** @type {readonly ('meta' | 'aggression' | 'supplement')[] | null} */
function parseSuitesArg() {
  const raw = process.argv.find((arg) => arg.startsWith('--suites='));
  if (!raw) return null;
  const parts = raw
    .slice('--suites='.length)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  /** @type {('meta' | 'aggression' | 'supplement')[]} */
  const suites = [];
  for (const part of parts) {
    if (part === 'meta' || part === 'aggression' || part === 'supplement') {
      suites.push(part);
    } else {
      throw new Error(`Unknown suite "${part}" (use meta, aggression, supplement)`);
    }
  }
  return suites.length ? suites : null;
}

function formatActual(actual) {
  const keys = ['route', 'bucket', 'source', 'generate', 'hybridClassify', 'replyId'];
  return keys
    .filter((k) => actual[k] !== undefined && actual[k] !== null)
    .map((k) => `${k}=${actual[k]}`)
    .join(' ');
}

function main() {
  const suites = parseSuitesArg();
  const results = runConfideAcceptanceBatch({ suites });
  const summary = summarizeConfideAcceptanceResults(results);

  process.stdout.write(
    `[confide-acceptance] mode=node-pipeline suites=${suites?.join('+') || 'all'} count=${results.length}\n`
  );
  process.stdout.write(
    '[confide-acceptance] feasibility: import core modules in Node (no Electron UI, no GGUF); mirrors desktop regex + corpus + generate gate\n\n'
  );

  for (const row of results) {
    const status = row.pass ? 'PASS' : 'FAIL';
    const detail = row.pass ? formatActual(row.actual) : row.failures.join('; ');
    process.stdout.write(`${status}\t${row.id}\t${row.suite}\t${detail}\n`);
  }

  process.stdout.write('\n--- summary ---\n');
  for (const suite of ['meta', 'aggression', 'supplement']) {
    if (!summary.bySuite[suite]) continue;
    const { pass, total } = summary.bySuite[suite];
    process.stdout.write(`${suite} ${pass}/${total}\n`);
  }
  process.stdout.write(`total ${summary.pass}/${summary.total}\n`);

  if (summary.pass !== summary.total) {
    process.exitCode = 1;
  }
}

main();
