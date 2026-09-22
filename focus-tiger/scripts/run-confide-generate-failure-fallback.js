/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Terminal batch runner for Confide generate-failure corpus fallback (#930).
 *
 *   npm run test:confide-generate-failure-fallback
 *   node scripts/run-confide-generate-failure-fallback.js
 */

import {
  CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS
} from '../src/core/confide/confideGenerateFailureFallbackFixtures.js';
import {
  runGenerateFailureFallbackBatch,
  summarizeGenerateFailureFallbackResults
} from '../src/core/confide/confideGenerateFailureFallbackEvaluate.js';

function formatActual(actual) {
  const keys = [
    'generateEligible',
    'sessionLineIds',
    'fallbackIdsSeen',
    'hardExcludeIds'
  ];
  return keys
    .filter((k) => actual[k] !== undefined && actual[k] !== null)
    .map((k) => `${k}=${JSON.stringify(actual[k])}`)
    .join(' ');
}

function main() {
  const results = runGenerateFailureFallbackBatch();
  const summary = summarizeGenerateFailureFallbackResults(results);

  process.stdout.write(
    `[confide-generate-failure-fallback] mode=node-pipeline fixtures=${summary.total} generate_fail=${summary.generateFailFixtures} corpus_control=${CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS.corpusControl}\n`
  );
  process.stdout.write(
    `[confide-generate-failure-fallback] per generate_fail row: saltSweep=${CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS.saltSweep} sessionRepeats=${CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS.sessionRepeats} totalChecks=${summary.checks}\n`
  );
  process.stdout.write(
    '[confide-generate-failure-fallback] feasibility: import core modules in Node (no Electron UI, no GGUF); mirrors resolveCorpusFallbackAfterGenerateFailure\n\n'
  );

  for (const row of results) {
    const status = row.pass ? 'PASS' : 'FAIL';
    const detail = row.pass ? formatActual(row.actual) : row.failures.join('; ');
    process.stdout.write(
      `${status}\t${row.id}\t${row.kind}\tchecks=${row.checks}\t${detail}\n`
    );
  }

  process.stdout.write('\n--- summary ---\n');
  process.stdout.write(
    `generate_fail ${summary.byKind.generate_fail.pass}/${summary.byKind.generate_fail.total} (${summary.byKind.generate_fail.checks} checks)\n`
  );
  process.stdout.write(
    `corpus_control ${summary.byKind.corpus_control.pass}/${summary.byKind.corpus_control.total} (${summary.byKind.corpus_control.checks} checks)\n`
  );
  process.stdout.write(`total ${summary.pass}/${summary.total}\n`);
  process.stdout.write(`checks ${summary.checks}\n`);

  if (summary.pass !== summary.total) {
    process.exitCode = 1;
  }
}

main();
