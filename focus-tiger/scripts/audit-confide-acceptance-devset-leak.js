#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Fail if production Confide code embeds a full frozen acceptance or devset line.
 *
 * Scope: exact full-line copy into mood-veto and safety classifier patch
 * surfaces (not the product-knowledge catalog). This does **not** catch
 * paraphrase / near-copy. Generalization is the sealed holdout's job.
 *
 *   npm run audit:confide-acceptance-leak
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import {
  CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS,
  CONFIDE_ACCEPTANCE_LEAK_SCAN_RELATIVE_PATHS,
  listConfideMoodVetoFrozenAndDevsetFullLines
} from '../src/core/confide/confideAcceptanceFrozenSentenceCorpus.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = join(__dirname, '..');

/**
 * @returns {boolean}
 */
export function runConfideAcceptanceDevsetLeakAudit() {
  const corpus = listConfideMoodVetoFrozenAndDevsetFullLines();
  const files = CONFIDE_ACCEPTANCE_LEAK_SCAN_RELATIVE_PATHS.map((rel) => join(FOCUS_TIGER, rel)).filter(
    (path) => existsSync(path)
  );

  /** @type {{ file: string, line: string }[]} */
  const hits = [];
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const rel = file.slice(FOCUS_TIGER.length + 1);
    for (const line of corpus) {
      if (CONFIDE_MOOD_VETO_LEAK_GRANDFATHERED_LITERALS.includes(line)) continue;
      if (content.includes(line)) {
        hits.push({ file: rel, line });
      }
    }
  }

  if (hits.length === 0) {
    console.log(
      `[audit:confide-acceptance-leak] OK — ${corpus.length} full lines; ${files.length} mood-veto + safety patch surfaces scanned (exact copy only; paraphrase is holdout)`
    );
    return true;
  }

  console.error(
    `[audit:confide-acceptance-leak] FAILED — ${hits.length} embedded frozen/devset line(s) in production code:\n`
  );
  for (const hit of hits.slice(0, 40)) {
    console.error(`  ${hit.file}\n    «${hit.line.slice(0, 80)}${hit.line.length > 80 ? '…' : ''}»`);
  }
  if (hits.length > 40) {
    console.error(`  … and ${hits.length - 40} more`);
  }
  return false;
}

function main() {
  if (!runConfideAcceptanceDevsetLeakAudit()) process.exit(1);
}

const isCli =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  main();
}
