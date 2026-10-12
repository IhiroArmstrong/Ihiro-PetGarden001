#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Stage 2b lab_seeded gate counters (unique sentences / families / false pulls).
 * Legacy `po_seeded` log rows still count.
 *
 * Usage:
 *   npm run audit:stage2b-lab-seeded-gate
 *   npm run audit:stage2b-lab-seeded-gate -- --file /path/to/turns.jsonl
 *   npm run audit:stage2b-lab-seeded-gate -- --families docs/lab-inputs/stage2b-po-seeded-families.tsv
 *   npm run audit:stage2b-lab-seeded-gate -- --negatives docs/lab-inputs/stage2b-negative-control.txt
 *   npm run audit:stage2b-lab-seeded-gate -- --preview-literal docs/lab-inputs/stage2b-po-seeded-confirm-candidates.txt
 *
 * Does not write "can cut Stage 2b". Does not change replies.
 */

import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTurnsJsonl } from '../src/core/confide/auditConfideSemanticShadow.js';
import {
  formatStage2bPoSeededGateReport,
  parseStage2bFamilyTsv,
  parseStage2bSentenceList,
  previewStage2bConfirmCandidates,
  summarizeConfideStage2bPoSeededGate
} from '../src/core/confide/auditConfideStage2bPoSeeded.js';

const LAB_ROOT = '/tmp/ft-l0-lab';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER_ROOT = path.join(SCRIPT_DIR, '..');

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

function argValue(args, flag) {
  const index = args.indexOf(flag);
  if (index >= 0 && args[index + 1]) return path.resolve(args[index + 1]);
  return null;
}

async function resolveExisting(candidates) {
  for (const candidate of candidates) {
    try {
      await access(candidate, fsConstants.R_OK);
      return candidate;
    } catch {
      // try next
    }
  }
  return null;
}

async function resolveLogPath(args) {
  const explicit = argValue(args, '--file');
  if (explicit) return explicit;
  const found = await resolveExisting(defaultTurnsLogCandidates());
  return found || defaultTurnsLogCandidates()[0];
}

async function main() {
  const args = process.argv.slice(2);
  const previewPath = argValue(args, '--preview-literal');
  if (previewPath) {
    const raw = await readFile(previewPath, 'utf8');
    const texts = parseStage2bSentenceList(raw);
    const rows = previewStage2bConfirmCandidates(texts);
    const jsonPath = path.join(LAB_ROOT, `stage2b-po-seeded-literal-${Date.now()}.json`);
    await mkdir(LAB_ROOT, { recursive: true });
    await writeFile(
      jsonPath,
      `${JSON.stringify({ probe: 'stage2b-po-seeded-literal', file: previewPath, rows }, null, 2)}\n`,
      'utf8'
    );
    console.log('stage2b confirm-candidate literal preview');
    console.log(`file: ${previewPath}`);
    for (const row of rows) {
      console.log(`${row.literalCoarse || 'null'}\t${row.text}`);
    }
    console.log(`json: ${jsonPath}`);
    console.log('literal only — not semantic M, not a live cutover verdict');
    return;
  }

  const filePath = await resolveLogPath(args);
  const familiesPath =
    argValue(args, '--families') ||
    path.join(FOCUS_TIGER_ROOT, 'docs/lab-inputs/stage2b-po-seeded-families.tsv');
  const negativesPath =
    argValue(args, '--negatives') ||
    path.join(FOCUS_TIGER_ROOT, 'docs/lab-inputs/stage2b-negative-control.txt');
  const jsonPath = path.join(LAB_ROOT, `stage2b-po-seeded-gate-${Date.now()}.json`);

  let raw = '';
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (err) {
    console.error(`Could not read turns log: ${filePath}`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  let familyByText = new Map();
  try {
    familyByText = parseStage2bFamilyTsv(await readFile(familiesPath, 'utf8'));
  } catch {
    familyByText = new Map();
  }

  let negativeTexts = [];
  try {
    negativeTexts = parseStage2bSentenceList(await readFile(negativesPath, 'utf8'));
  } catch {
    negativeTexts = [];
  }

  const parsed = parseTurnsJsonl(raw);
  const summary = summarizeConfideStage2bPoSeededGate(parsed.rows, {
    familyByText,
    negativeTexts
  });

  await mkdir(LAB_ROOT, { recursive: true });
  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        probe: 'stage2b-po-seeded-gate',
        file: filePath,
        families: familiesPath,
        negatives: negativesPath,
        uniquePoSeeded: summary.uniqueTextCount,
        uniqueWouldPromote: summary.uniqueWouldPromoteCount,
        uniqueFamilies: summary.uniqueFamilyCount,
        unlabeled: summary.unlabeledCount,
        falsePulls: summary.falsePullCount,
        meetsUniqueTexts: summary.meetsUniqueTexts,
        meetsFamilies: summary.meetsFamilies,
        meetsFalsePulls: summary.meetsFalsePulls,
        uniqueTexts: summary.uniqueTexts,
        uniqueWouldPromoteTexts: summary.uniqueWouldPromote,
        familyIds: summary.uniqueFamilies,
        unlabeledTexts: summary.unlabeledTexts,
        falsePullTexts: summary.falsePulls,
        skippedNotOkPoSeeded: summary.skippedNotOkPoSeeded,
        skippedMalformed: parsed.skippedMalformed
      },
      null,
      2
    )}\n`,
    'utf8'
  );

  console.log(
    formatStage2bPoSeededGateReport({
      filePath,
      uniqueTextCount: summary.uniqueTextCount,
      uniqueWouldPromoteCount: summary.uniqueWouldPromoteCount,
      uniqueFamilyCount: summary.uniqueFamilyCount,
      unlabeledCount: summary.unlabeledCount,
      falsePullCount: summary.falsePullCount,
      skippedNotOkPoSeeded: summary.skippedNotOkPoSeeded,
      skippedMalformed: parsed.skippedMalformed,
      meetsUniqueTexts: summary.meetsUniqueTexts,
      meetsFamilies: summary.meetsFamilies,
      meetsFalsePulls: summary.meetsFalsePulls,
      jsonPath
    })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
