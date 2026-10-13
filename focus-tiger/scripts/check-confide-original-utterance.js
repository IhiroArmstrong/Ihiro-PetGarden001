#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * R-0 CI scan: Confide user originals must not land in git.
 *
 *   node scripts/check-confide-original-utterance.js
 *
 * Fails on:
 * - tracked-style files named turns.jsonl
 * - JSONL dumps that carry queryHash and a text field on the same line
 * - sealed blind-holdout JSON that still contains utterance arrays
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const FOCUS_TIGER = join(fileURLToPath(new URL('.', import.meta.url)), '..');

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
  '.git',
  '.tmp',
  'art-reference',
  'archive'
]);

const TEXT_EXTS = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.jsonl',
  '.md',
  '.txt',
  '.csv',
  '.yml',
  '.yaml'
]);

/** Fixtures that must contain the leak pattern in order to lock the scanner. */
const REL_ALLOWLIST = new Set([
  'scripts/check-confide-original-utterance.test.js'
]);

/** Same-line telemetry leak: hash plus original text. */
export const QUERY_HASH_WITH_TEXT =
  /"queryHash"\s*:\s*"[^"]+"[^}\n]{0,400}"text"\s*:\s*"/;

export const BLIND_UTTERANCE_ARRAY =
  /"(utterances|texts|sentences|lines)"\s*:\s*\[\s*"/;

/**
 * @param {string} relPosix
 * @param {string} basename
 * @param {string} source
 * @returns {string[]}
 */
export function scanConfideOriginalUtteranceSource(relPosix, basename, source) {
  const hits = [];
  if (basename === 'turns.jsonl') {
    hits.push(`${relPosix}: committed turns.jsonl (R-0)`);
  }
  if (
    relPosix.includes('.secrets/confide-blind-holdout/') &&
    basename.endsWith('.json') &&
    BLIND_UTTERANCE_ARRAY.test(source)
  ) {
    hits.push(`${relPosix}: sealed blind holdout still contains originals (R-0)`);
  }
  if (QUERY_HASH_WITH_TEXT.test(source)) {
    hits.push(`${relPosix}: queryHash + text on one line (R-0)`);
  }
  return hits;
}

/**
 * @param {string} dir
 * @param {string[]} out
 */
function walkFiles(dir, out) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.') && ent.name !== '.secrets') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue;
      walkFiles(p, out);
    } else if (ent.isFile()) {
      out.push(p);
    }
  }
}

/**
 * @param {string} [root]
 * @returns {{ ok: boolean, hits: string[] }}
 */
export function runConfideOriginalUtteranceCheck(root = FOCUS_TIGER) {
  const files = [];
  walkFiles(root, files);
  const hits = [];
  for (const p of files) {
    const rel = relative(root, p).split(sep).join('/');
    const basename = p.split(sep).pop() || '';
    const ext = basename.includes('.') ? `.${basename.split('.').pop()}` : '';
    if (REL_ALLOWLIST.has(rel)) continue;
    if (basename !== 'turns.jsonl' && !TEXT_EXTS.has(ext)) continue;
    let source = '';
    try {
      if (statSync(p).size > 2_000_000) continue;
      source = readFileSync(p, 'utf8');
    } catch {
      continue;
    }
    hits.push(...scanConfideOriginalUtteranceSource(rel, basename, source));
  }
  return { ok: hits.length === 0, hits };
}

function main() {
  const result = runConfideOriginalUtteranceCheck();
  if (!result.ok) {
    console.error('[confide-original-utterance] FAILED');
    for (const hit of result.hits) console.error(`  ${hit}`);
    process.exit(1);
  }
  console.log('[confide-original-utterance] OK');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
