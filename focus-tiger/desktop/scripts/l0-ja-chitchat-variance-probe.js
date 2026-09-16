/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab-only #774: batch variance probe for ja Confide chitchat diff samples.
 * Each run uses empty history (first-ask variance, not same-session repeats).
 * Never wired to Confide send. Run from system Terminal (Metal).
 *
 *   cd focus-tiger/desktop && npm run companion:ja-chitchat-variance
 *   FT_CHITCHAT_RUNS=15 npm run companion:ja-chitchat-variance
 *
 * Results: /tmp/ft-l0-lab/compare-<epoch>.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadModelHold } from '../companion/l1Hold.js';
import { CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES } from '../../src/core/confide/confideJaChitchatVarianceFixtures.js';
import { setLocale } from '../../src/locales/i18n.js';
import {
  JA_CHITCHAT_LAB_ROOT,
  JA_CHITCHAT_LOCALE,
  buildJaChitchatProbeRow,
  errorMessage,
  processJaChitchatSend,
  resolveJaChitchatModelPath,
  resolveJaChitchatRunCount
} from './l0-ja-chitchat-probe-shared.js';

async function main() {
  setLocale(JA_CHITCHAT_LOCALE);
  const runs = resolveJaChitchatRunCount();
  const modelPath = resolveJaChitchatModelPath();
  if (!modelPath) {
    process.stderr.write(
      `[ja-chitchat] missing GGUF. Set FT_CHITCHAT_GGUF or download production model to companion-l0.\n`
    );
    process.exit(2);
  }

  process.stderr.write(
    `[ja-chitchat] model ${modelPath} · locale ${JA_CHITCHAT_LOCALE} · runs ${runs} · samples ${CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES.length}\n`
  );

  /** @type {object[]} */
  const rows = [];
  let hold = null;

  try {
    hold = await loadModelHold({
      modelPath,
      onProgress: (msg) => process.stderr.write(`[ja-chitchat] ${msg}\n`)
    });

    for (const fixture of CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES) {
      const text = fixture.text;

      for (let runIndex = 1; runIndex <= runs; runIndex += 1) {
        const outcome = await processJaChitchatSend(text, { hold });
        rows.push(
          buildJaChitchatProbeRow(
            {
              fixtureId: fixture.id,
              input: text,
              runIndex
            },
            outcome
          )
        );
        process.stderr.write(
          `[ja-chitchat] ${fixture.id} run ${runIndex}/${runs} route=${outcome.route} source=${outcome.dataSource}\n`
        );
      }
    }
  } finally {
    if (hold && typeof hold.dispose === 'function') {
      await hold.dispose();
    }
  }

  const report = {
    at: new Date().toISOString(),
    issue: '774',
    probe: 'variance',
    locale: JA_CHITCHAT_LOCALE,
    modelPath,
    runsPerSample: runs,
    sampleCount: CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES.length,
    rowCount: rows.length,
    rows
  };

  fs.mkdirSync(JA_CHITCHAT_LAB_ROOT, { recursive: true });
  const outPath = path.join(JA_CHITCHAT_LAB_ROOT, `compare-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify(
      { reportPath: outPath, rowCount: rows.length, runsPerSample: runs, probe: 'variance' },
      null,
      2
    )}\n`
  );
}

const isMain =
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '');
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`${errorMessage(err)}\n`);
    process.exit(1);
  });
}
