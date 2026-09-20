#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Prompt 8: export semantic shadow disagreements from Electron turns.jsonl.
 *
 * Usage:
 *   npm run audit:confide-semantic-shadow
 *   npm run audit:confide-semantic-shadow -- --file /path/to/turns.jsonl
 *   npm run audit:confide-semantic-shadow -- --out /tmp/disagreement.csv
 *
 * Prints N, D, D÷N. Writes disagreement CSV. Does not set a sample floor.
 */

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import {
  formatSemanticShadowDisagreementCsv,
  formatSemanticShadowReport,
  parseTurnsJsonl,
  summarizeConfideSemanticShadow
} from '../src/core/confide/auditConfideSemanticShadow.js';

const LAB_ROOT = '/tmp/ft-l0-lab';

/** @returns {string[]} */
function defaultTurnsLogCandidates() {
  const home = homedir();
  if (process.platform === 'darwin') {
    return [
      path.join(home, 'Library/Application Support/focus-tiger-desktop/companion-l2/turns.jsonl'),
      path.join(home, 'Library/Application Support/Focus Tiger/companion-l2/turns.jsonl')
    ];
  }
  if (process.platform === 'win32') {
    return [
      path.join(home, 'AppData/Roaming/focus-tiger-desktop/companion-l2/turns.jsonl'),
      path.join(home, 'AppData/Roaming/Focus Tiger/companion-l2/turns.jsonl')
    ];
  }
  return [
    path.join(home, '.config/focus-tiger-desktop/companion-l2/turns.jsonl'),
    path.join(home, '.config/Focus Tiger/companion-l2/turns.jsonl')
  ];
}

async function resolveLogPath(args) {
  const fileIndex = args.indexOf('--file');
  if (fileIndex >= 0 && args[fileIndex + 1]) {
    return path.resolve(args[fileIndex + 1]);
  }
  for (const candidate of defaultTurnsLogCandidates()) {
    try {
      await access(candidate, fsConstants.R_OK);
      return candidate;
    } catch {
      // try next
    }
  }
  return defaultTurnsLogCandidates()[0];
}

function resolveCsvPath(args) {
  const outIndex = args.indexOf('--out');
  if (outIndex >= 0 && args[outIndex + 1]) {
    return path.resolve(args[outIndex + 1]);
  }
  return path.join(LAB_ROOT, `semantic-shadow-disagreement-${Date.now()}.csv`);
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = await resolveLogPath(args);
  const csvPath = resolveCsvPath(args);

  let raw = '';
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (err) {
    console.error(`Could not read turns log: ${filePath}`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const parsed = parseTurnsJsonl(raw);
  const summary = summarizeConfideSemanticShadow(parsed.rows);
  const csv = formatSemanticShadowDisagreementCsv(summary.disagreements);

  await mkdir(path.dirname(csvPath), { recursive: true });
  await writeFile(csvPath, csv, 'utf8');

  const jsonPath = csvPath.replace(/\.csv$/i, '.json');
  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        probe: 'confide-semantic-shadow',
        file: filePath,
        N: summary.sampleCount,
        D: summary.disagreementCount,
        ratio: summary.sampleCount ? summary.disagreementCount / summary.sampleCount : null,
        skippedNotOk: summary.skippedNotOk,
        skippedMalformed: parsed.skippedMalformed,
        csv: csvPath
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  console.log(
    formatSemanticShadowReport({
      filePath,
      sampleCount: summary.sampleCount,
      disagreementCount: summary.disagreementCount,
      skippedNotOk: summary.skippedNotOk,
      skippedMalformed: parsed.skippedMalformed,
      csvPath
    })
  );
  console.log(`json: ${jsonPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
