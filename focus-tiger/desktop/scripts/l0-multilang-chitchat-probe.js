/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab-only: six-language daily chitchat first-ask probe (108 frozen samples).
 * Empty history per row. Never wired to Confide send. Run from system Terminal (Metal).
 *
 *   cd focus-tiger/desktop && npm run companion:multilang-chitchat
 *   FT_CHITCHAT_GGUF=/path/to/model.gguf npm run companion:multilang-chitchat
 *
 * Results: /tmp/ft-l0-lab/compare-<epoch>.json (probe: multilang-chitchat)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadModelHold } from '../companion/l1Hold.js';
import {
  CONFIDE_MULTILANG_CHITCHAT_FIXTURES,
  CONFIDE_MULTILANG_CHITCHAT_LOCALES,
  fixturesForMultilangChitchatLocale
} from '../../src/core/confide/confideMultilangChitchatFixtures.js';
import { setLocale } from '../../src/locales/i18n.js';
import {
  CHITCHAT_LAB_ROOT,
  buildChitchatProbeRow,
  errorMessage,
  processChitchatSend,
  resolveChitchatModelPath
} from './l0-chitchat-probe-shared.js';

function resolveLocaleFilter() {
  const raw = String(process.env.FT_MULTILANG_LOCALE || '').trim().toLowerCase();
  if (!raw) return null;
  if (!CONFIDE_MULTILANG_CHITCHAT_LOCALES.includes(raw)) {
    throw new Error(
      `FT_MULTILANG_LOCALE must be one of ${CONFIDE_MULTILANG_CHITCHAT_LOCALES.join(', ')}`
    );
  }
  return raw;
}

async function main() {
  const localeFilter = resolveLocaleFilter();
  const fixtures = fixturesForMultilangChitchatLocale(localeFilter);
  const modelPath = resolveChitchatModelPath();
  if (!modelPath) {
    process.stderr.write(
      `[multilang-chitchat] missing GGUF. Set FT_CHITCHAT_GGUF or download production model to companion-l0.\n`
    );
    process.exit(2);
  }

  process.stderr.write(
    `[multilang-chitchat] model ${modelPath} · locales ${localeFilter || 'all'} · samples ${fixtures.length}\n`
  );

  /** @type {object[]} */
  const rows = [];
  let hold = null;

  try {
    hold = await loadModelHold({
      modelPath,
      onProgress: (msg) => process.stderr.write(`[multilang-chitchat] ${msg}\n`)
    });

    for (const fixture of fixtures) {
      setLocale(fixture.locale);
      const outcome = await processChitchatSend(fixture.text, fixture.locale, { hold });
      rows.push(
        buildChitchatProbeRow(
          {
            fixtureId: fixture.id,
            locale: fixture.locale,
            input: fixture.text,
            runIndex: 1
          },
          outcome
        )
      );
      process.stderr.write(
        `[multilang-chitchat] ${fixture.id} route=${outcome.route} source=${outcome.dataSource}\n`
      );
    }
  } finally {
    if (hold && typeof hold.dispose === 'function') {
      await hold.dispose();
    }
  }

  const report = {
    at: new Date().toISOString(),
    probe: 'multilang-chitchat',
    locales: localeFilter ? [localeFilter] : [...CONFIDE_MULTILANG_CHITCHAT_LOCALES],
    modelPath,
    sampleCount: fixtures.length,
    rowCount: rows.length,
    rows
  };

  fs.mkdirSync(CHITCHAT_LAB_ROOT, { recursive: true });
  const outPath = path.join(CHITCHAT_LAB_ROOT, `compare-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify(
      {
        reportPath: outPath,
        rowCount: rows.length,
        sampleCount: fixtures.length,
        probe: 'multilang-chitchat'
      },
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
