#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Audit Read Hybrid gapfill from Electron turns.jsonl (post-#859 text field).
 *
 * Usage:
 *   npm run audit:read-hybrid-gapfill
 *   npm run audit:read-hybrid-gapfill -- --file /path/to/turns.jsonl
 *   npm run audit:read-hybrid-gapfill -- --since 2026-09-19T00:00:00.000Z
 *   npm run audit:read-hybrid-gapfill -- --all   # include rows without text (legacy)
 */

import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarizeReadHybridGapfill } from '../src/core/confide/auditReadHybridGapfill.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

/**
 * @param {string} raw
 * @returns {object[]}
 */
function parseJsonl(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function pct(n, total) {
  if (!total) return 'n/a';
  return `${((n / total) * 100).toFixed(1)}% (${n}/${total})`;
}

async function resolveLogPath(args) {
  const fileIndex = args.indexOf('--file');
  if (fileIndex >= 0 && args[fileIndex + 1]) {
    return path.resolve(args[fileIndex + 1]);
  }
  for (const candidate of defaultTurnsLogCandidates()) {
    try {
      await readFile(candidate, 'utf8');
      return candidate;
    } catch {
      // try next
    }
  }
  return defaultTurnsLogCandidates()[0];
}

async function main() {
  const args = process.argv.slice(2);
  const requireText = !args.includes('--all');
  const sinceIndex = args.indexOf('--since');
  const sinceIso = sinceIndex >= 0 ? args[sinceIndex + 1] : '2026-09-19T00:00:00.000Z';
  const filePath = await resolveLogPath(args);

  let raw = '';
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (err) {
    console.error(`Could not read turns log: ${filePath}`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const rows = parseJsonl(raw);
  const summary = summarizeReadHybridGapfill(rows, { requireText, sinceIso });

  console.log('Read Hybrid gapfill audit');
  console.log(`file: ${filePath}`);
  console.log(`filter: ${requireText ? 'text required (#859+)' : 'all hybrid rows'}; since ${sinceIso}`);
  console.log('');
  console.log(`total jsonl rows: ${summary.totalRows}`);
  console.log(`read_hybrid_classify rows: ${summary.hybridRows}`);
  console.log(`analyzed: ${summary.analyzed}`);
  console.log(`with text field: ${summary.withText}`);
  if (summary.skippedNoText) console.log(`skipped (no text): ${summary.skippedNoText}`);
  if (summary.skippedBeforeSince) console.log(`skipped (before since): ${summary.skippedBeforeSince}`);
  console.log('');
  console.log(`tool≠none: ${pct(summary.toolNonNone, summary.analyzed)}`);
  console.log(`tool=none: ${pct(summary.toolNone, summary.analyzed)}`);
  console.log(`regex would match (replay): ${pct(summary.regexWouldMatch, summary.analyzed)}`);
  console.log(`false gapfill (hybrid≠none & regex hit): ${summary.falseGapfill}`);
  console.log(`true gapfill (hybrid≠none & regex miss): ${summary.trueGapfill}`);
  console.log(`would skip classify (#861 gate): ${summary.wouldSkipClassify}`);

  if (summary.samples.falseGapfill.length) {
    console.log('\nfalse gapfill samples:');
    for (const row of summary.samples.falseGapfill) {
      console.log(`  [${row.at}] ${row.text} → hybrid=${row.hybridTool}, regex=${row.regexTool}`);
    }
  }
  if (summary.samples.trueGapfill.length) {
    console.log('\ntrue gapfill samples:');
    for (const row of summary.samples.trueGapfill) {
      console.log(`  [${row.at}] ${row.text} → hybrid=${row.hybridTool}`);
    }
  }

  if (requireText && summary.analyzed === 0) {
    console.log('\nNo analyzable rows. Run wide Electron Confide (develop tip) ≥15 fallback turns, then re-run.');
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
