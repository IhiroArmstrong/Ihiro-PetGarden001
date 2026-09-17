/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab-only: run frozen six-language chitchat (108 samples) on jc-builds vs unsloth Gemma4-E4B.
 * System Terminal (Metal) only. reasoning:false via loadModelHold / openFreshChatSession.
 *
 *   cd focus-tiger/desktop && npm run companion:gemma4-multilang-ab
 *
 * Outputs:
 *   /tmp/ft-l0-lab/compare-<epoch>-jc.json
 *   /tmp/ft-l0-lab/compare-<epoch>-un.json
 *   /tmp/ft-l0-lab/gemma4-multilang-ab-summary-<epoch>.json
 *   /tmp/ft-l0-lab/multilang-chitchat-annotate-<epoch>.md
 *   /tmp/ft-l0-lab/multilang-chitchat-annotate-<epoch>.csv
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadModelHold } from '../companion/l1Hold.js';
import {
  CONFIDE_MULTILANG_CHITCHAT_FIXTURES,
  CONFIDE_MULTILANG_CHITCHAT_LOCALES
} from '../../src/core/confide/confideMultilangChitchatFixtures.js';
import { setLocale } from '../../src/locales/i18n.js';
import {
  CHITCHAT_LAB_ROOT,
  buildChitchatProbeRow,
  errorMessage,
  processChitchatSend,
  resolveGemma4QuantModelPath
} from './l0-chitchat-probe-shared.js';

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function summarizeRows(rows) {
  const generateRows = rows.filter((row) => row['data-source'] === 'generate');
  const emptyRaw = rows.filter((row) => row.generateAttempted && !row.rawGenerate);
  const corpusFallback = rows.filter(
    (row) => row.needsGenerate && row['data-source'] === 'corpus'
  );
  return {
    rowCount: rows.length,
    generateRows: generateRows.length,
    emptyRawGenerate: emptyRaw.length,
    corpusFallbackRows: corpusFallback.length,
    generateErrors: rows.filter((row) => row.generateError).length
  };
}

function buildAnnotationArtifacts(jcReport, unReport, stamp) {
  const jcById = new Map(jcReport.rows.map((row) => [row.fixtureId, row]));
  const unById = new Map(unReport.rows.map((row) => [row.fixtureId, row]));

  const mdLines = [
    `# Gemma4-E4B six-language chitchat annotation (${stamp})`,
    '',
    'Locales: ja / en / it / de / es / fr · 18 sentences each · empty history · first ask only.',
    'Fill `onTopic_jc` / `onTopic_un` in CSV (yes/no/maybe) after manual review.',
    '',
    '| locale | id | input | jc reply | un reply | jc source | un source |',
    '| --- | --- | --- | --- | --- | --- | --- |'
  ];

  const csvLines = [
    'locale,fixtureId,input,jc_reply,un_reply,jc_data_source,un_data_source,onTopic_jc,onTopic_un'
  ];

  for (const fixture of CONFIDE_MULTILANG_CHITCHAT_FIXTURES) {
    const jc = jcById.get(fixture.id);
    const un = unById.get(fixture.id);
    const jcReply = jc?.replyText ?? '';
    const unReply = un?.replyText ?? '';
    const jcSource = jc?.['data-source'] ?? '';
    const unSource = un?.['data-source'] ?? '';
    mdLines.push(
      `| ${fixture.locale} | ${fixture.id} | ${fixture.text.replace(/\|/g, '\\|')} | ${jcReply.replace(/\|/g, '\\|')} | ${unReply.replace(/\|/g, '\\|')} | ${jcSource} | ${unSource} |`
    );
    csvLines.push(
      [
        fixture.locale,
        fixture.id,
        csvEscape(fixture.text),
        csvEscape(jcReply),
        csvEscape(unReply),
        jcSource,
        unSource,
        '',
        ''
      ].join(',')
    );
  }

  const mdPath = path.join(CHITCHAT_LAB_ROOT, `multilang-chitchat-annotate-${stamp}.md`);
  const csvPath = path.join(CHITCHAT_LAB_ROOT, `multilang-chitchat-annotate-${stamp}.csv`);
  fs.writeFileSync(mdPath, `${mdLines.join('\n')}\n`);
  fs.writeFileSync(csvPath, `${csvLines.join('\n')}\n`);
  return { mdPath, csvPath };
}

async function runProbeForSource(label, modelPath) {
  process.stderr.write(`[gemma4-multilang-ab] ${label} · ${modelPath}\n`);
  /** @type {object[]} */
  const rows = [];
  let hold = null;
  try {
    hold = await loadModelHold({
      modelPath,
      onProgress: (msg) => process.stderr.write(`[gemma4-multilang-ab:${label}] ${msg}\n`)
    });
    for (const fixture of CONFIDE_MULTILANG_CHITCHAT_FIXTURES) {
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
        `[gemma4-multilang-ab:${label}] ${fixture.id} source=${outcome.dataSource}\n`
      );
    }
  } finally {
    if (hold && typeof hold.dispose === 'function') {
      await hold.dispose();
    }
  }
  return rows;
}

async function main() {
  const jcPath = resolveGemma4QuantModelPath('jc');
  const unPath = resolveGemma4QuantModelPath('un');
  if (!jcPath) {
    process.stderr.write('[gemma4-multilang-ab] missing jc-builds GGUF in companion-l0\n');
    process.exit(2);
  }
  if (!unPath) {
    process.stderr.write(
      '[gemma4-multilang-ab] missing unsloth GGUF at /tmp/ft-l0-lab/Gemma-4-E4B-it-UD-Q4_K_XL-unsloth.gguf\n'
    );
    process.exit(2);
  }

  fs.mkdirSync(CHITCHAT_LAB_ROOT, { recursive: true });
  const stamp = String(Date.now());

  const jcRows = await runProbeForSource('jc', jcPath);
  const unRows = await runProbeForSource('un', unPath);

  const jcReport = {
    at: new Date().toISOString(),
    probe: 'multilang-chitchat',
    source: 'jc-builds Q4_K_M',
    modelPath: jcPath,
    locales: [...CONFIDE_MULTILANG_CHITCHAT_LOCALES],
    sampleCount: CONFIDE_MULTILANG_CHITCHAT_FIXTURES.length,
    rowCount: jcRows.length,
    rows: jcRows
  };
  const unReport = {
    at: new Date().toISOString(),
    probe: 'multilang-chitchat',
    source: 'unsloth UD-Q4_K_XL',
    modelPath: unPath,
    locales: [...CONFIDE_MULTILANG_CHITCHAT_LOCALES],
    sampleCount: CONFIDE_MULTILANG_CHITCHAT_FIXTURES.length,
    rowCount: unRows.length,
    rows: unRows
  };

  const jcOut = path.join(CHITCHAT_LAB_ROOT, `compare-${stamp}-jc.json`);
  const unOut = path.join(CHITCHAT_LAB_ROOT, `compare-${stamp}-un.json`);
  fs.writeFileSync(jcOut, `${JSON.stringify(jcReport, null, 2)}\n`);
  fs.writeFileSync(unOut, `${JSON.stringify(unReport, null, 2)}\n`);

  const { mdPath, csvPath } = buildAnnotationArtifacts(jcReport, unReport, stamp);

  const summary = {
    at: new Date().toISOString(),
    config: 'openFreshChatSession promptFamily=gemma -> Gemma4ChatWrapper({ reasoning:false })',
    locales: [...CONFIDE_MULTILANG_CHITCHAT_LOCALES],
    samplesPerLocale: 18,
    jc: {
      label: 'jc-builds Q4_K_M',
      modelPath: jcPath,
      reportPath: jcOut,
      ...summarizeRows(jcRows)
    },
    un: {
      label: 'unsloth UD-Q4_K_XL (QAT)',
      modelPath: unPath,
      reportPath: unOut,
      ...summarizeRows(unRows)
    },
    annotation: { mdPath, csvPath }
  };

  const summaryPath = path.join(CHITCHAT_LAB_ROOT, `gemma4-multilang-ab-summary-${stamp}.json`);
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);

  const tableAppendix = [
    '',
    `## Gemma4 six-language chitchat A/B (${new Date().toISOString().slice(0, 10)})`,
    '',
    '| source | samples | generate rows | empty raw | corpus fallback |',
    '| --- | --- | --- | --- | --- |',
    `| jc-builds | ${summary.jc.rowCount} | ${summary.jc.generateRows} | ${summary.jc.emptyRawGenerate} | ${summary.jc.corpusFallbackRows} |`,
    `| unsloth | ${summary.un.rowCount} | ${summary.un.generateRows} | ${summary.un.emptyRawGenerate} | ${summary.un.corpusFallbackRows} |`,
    '',
    `Annotation: \`${path.basename(mdPath)}\` · \`${path.basename(csvPath)}\``,
    `JSON: \`${path.basename(jcOut)}\` · \`${path.basename(unOut)}\` · \`${path.basename(summaryPath)}\``,
    ''
  ].join('\n');

  const tablesPath = path.join(CHITCHAT_LAB_ROOT, 'compare-tables.md');
  fs.appendFileSync(tablesPath, tableAppendix);

  process.stdout.write(`${JSON.stringify({ summaryPath, jcOut, unOut, mdPath, csvPath }, null, 2)}\n`);
}

const isMain =
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '');
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`${errorMessage(err)}\n`);
    process.exit(1);
  });
}
