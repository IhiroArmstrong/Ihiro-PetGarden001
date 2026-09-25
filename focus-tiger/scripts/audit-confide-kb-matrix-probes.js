#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Export novel kb_retrieval_miss utterances for KB matrix round-2 probes.
 *
 * Usage:
 *   npm run audit:confide-kb-matrix-probes
 *   npm run audit:confide-kb-matrix-probes -- --file /path/to/turns.jsonl
 */

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import {
  formatKbMatrixProbeCsv,
  formatKbMatrixProbeReport,
  summarizeKbMatrixProbeCandidates
} from '../src/core/confide/auditConfideKbMatrixProbes.js';
import { parseTurnsJsonl } from '../src/core/confide/auditConfideSemanticShadow.js';

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

async function main() {
  const args = process.argv.slice(2);
  const filePath = await resolveLogPath(args);
  const stamp = Date.now();
  const csvPath = path.join(LAB_ROOT, `kb-matrix-probe-candidates-${stamp}.csv`);
  const jsonPath = path.join(LAB_ROOT, `kb-matrix-probe-candidates-${stamp}.json`);

  let raw = '';
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (err) {
    console.error(`Could not read turns log: ${filePath}`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const parsed = parseTurnsJsonl(raw);
  const summary = summarizeKbMatrixProbeCandidates(parsed.rows);

  await mkdir(LAB_ROOT, { recursive: true });
  await writeFile(csvPath, formatKbMatrixProbeCsv(summary.novel), 'utf8');
  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        probe: 'confide-kb-matrix-probes',
        file: filePath,
        skippedMalformed: parsed.skippedMalformed,
        missRowCount: summary.missRowCount,
        uniqueMissCount: summary.uniqueMissCount,
        novelCount: summary.novelCount,
        readyForRound2: summary.readyForRound2,
        novel: summary.novel
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  console.log(
    formatKbMatrixProbeReport({
      filePath,
      missRowCount: summary.missRowCount,
      uniqueMissCount: summary.uniqueMissCount,
      novelCount: summary.novelCount,
      readyForRound2: summary.readyForRound2,
      csvPath,
      jsonPath
    })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
