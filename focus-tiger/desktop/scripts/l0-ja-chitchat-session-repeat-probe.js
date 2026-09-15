/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab-only #774: same-session repeat probe for ja Confide chitchat.
 * Each fixture is sent 2–3 times in one virtual session (history accumulates).
 * Never wired to Confide send. Run from system Terminal (Metal).
 *
 *   cd focus-tiger/desktop && npm run companion:ja-chitchat-session-repeat
 *   FT_CHITCHAT_REPEATS=3 npm run companion:ja-chitchat-session-repeat
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
  appendJaChitchatTurn,
  errorMessage,
  processJaChitchatSend,
  resolveJaChitchatModelPath,
  resolveJaChitchatRepeatCount
} from './l0-ja-chitchat-probe-shared.js';

async function main() {
  setLocale(JA_CHITCHAT_LOCALE);
  const repeats = resolveJaChitchatRepeatCount();
  const modelPath = resolveJaChitchatModelPath();
  if (!modelPath) {
    process.stderr.write(
      `[ja-chitchat-session] missing GGUF. Set FT_CHITCHAT_GGUF or download production model to:\n  ${defaultGgufHint()}\n`
    );
    process.exit(2);
  }

  process.stderr.write(
    `[ja-chitchat-session] model ${modelPath} · locale ${JA_CHITCHAT_LOCALE} · repeats ${repeats} · samples ${CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES.length}\n`
  );

  /** @type {object[]} */
  const rows = [];
  let hold = null;

  try {
    hold = await loadModelHold({
      modelPath,
      onProgress: (msg) => process.stderr.write(`[ja-chitchat-session] ${msg}\n`)
    });

    for (const fixture of CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES) {
      /** @type {Array<{ role?: string, text?: string, source?: string }>} */
      const history = [];
      const sessionExclude = new Set();

      for (let repeatIndex = 1; repeatIndex <= repeats; repeatIndex += 1) {
        const text = fixture.text;
        const outcome = await processJaChitchatSend(text, {
          history,
          sessionExclude,
          hold
        });
        rows.push({
          fixtureId: fixture.id,
          input: text,
          repeatIndex,
          historyRowsBefore: history.length,
          route: outcome.route,
          'data-source': outcome.dataSource,
          corpusId: outcome.corpusId,
          replyText: outcome.replyText,
          onTopic: null
        });
        process.stderr.write(
          `[ja-chitchat-session] ${fixture.id} repeat ${repeatIndex}/${repeats} route=${outcome.route} source=${outcome.dataSource}\n`
        );
        if (outcome.corpusId) sessionExclude.add(outcome.corpusId);
        appendJaChitchatTurn(history, text, outcome);
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
    probe: 'session-repeat',
    locale: JA_CHITCHAT_LOCALE,
    modelPath,
    repeatsPerSample: repeats,
    sampleCount: CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES.length,
    rowCount: rows.length,
    rows
  };

  fs.mkdirSync(JA_CHITCHAT_LAB_ROOT, { recursive: true });
  const outPath = path.join(JA_CHITCHAT_LAB_ROOT, `compare-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify(
      {
        reportPath: outPath,
        rowCount: rows.length,
        repeatsPerSample: repeats,
        probe: 'session-repeat'
      },
      null,
      2
    )}\n`
  );
}

function defaultGgufHint() {
  return path.join(
    process.env.HOME || '~',
    'Library/Application Support/Focus Tiger/companion-l0'
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
