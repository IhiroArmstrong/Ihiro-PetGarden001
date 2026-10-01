#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Replay asymmetric prior-turn rule on existing turns.jsonl.
 *
 * Usage:
 *   npm run audit:confide-prior-asymmetric
 *   npm run audit:confide-prior-asymmetric -- --file /path/to/turns.jsonl
 */

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { parseTurnsJsonl } from '../src/core/confide/auditConfideSemanticShadow.js';
import {
  formatPriorAsymmetricReport,
  summarizeConfideSemanticPriorAsymmetric
} from '../src/core/confide/auditConfideSemanticPriorAsymmetric.js';

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
  const jsonPath = path.join(LAB_ROOT, `semantic-prior-asymmetric-${Date.now()}.json`);

  let raw = '';
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (err) {
    console.error(`Could not read turns log: ${filePath}`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const parsed = parseTurnsJsonl(raw);
  const summary = summarizeConfideSemanticPriorAsymmetric(parsed.rows);

  await mkdir(path.dirname(jsonPath), { recursive: true });
  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        probe: 'confide-prior-asymmetric',
        file: filePath,
        skippedMalformed: parsed.skippedMalformed,
        eligibleCount: summary.eligibleCount,
        naiveHelp: summary.naiveHelp,
        naiveHarm: summary.naiveHarm,
        naiveOther: summary.naiveOther,
        naiveSame: summary.naiveSame,
        ruleHelp: summary.ruleHelp,
        ruleHarm: summary.ruleHarm,
        skippedNotEligible: summary.skippedNotEligible,
        forks: summary.forks
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  console.log(
    formatPriorAsymmetricReport({
      filePath,
      eligibleCount: summary.eligibleCount,
      naiveHelp: summary.naiveHelp,
      naiveHarm: summary.naiveHarm,
      naiveOther: summary.naiveOther,
      naiveSame: summary.naiveSame,
      ruleHelp: summary.ruleHelp,
      ruleHarm: summary.ruleHarm,
      skippedNotEligible: summary.skippedNotEligible,
      jsonPath
    })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
