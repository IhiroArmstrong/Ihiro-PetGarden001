#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Assert every product file that mounts a `position: fixed` layer is listed in
 * `docs/Z_INDEX.md`.
 *
 * Z_INDEX.md exists so the next person can see what a new layer will land on
 * top of. It only works if it is complete, and nothing was checking that — the
 * 2026-09-30 audit (Z-3) found registry drift. This is the cheap half of that
 * finding: a missing row is deterministic and belongs in CI. Whether two
 * registered layers actually occlude each other is not, and stays with human
 * eyes.
 *
 *   node scripts/z-index-registry-check.js
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const REGISTRY = join(PKG_ROOT, 'docs/Z_INDEX.md');

const SCAN_ROOTS = ['index.html', 'src'];
const SCAN_EXTS = new Set(['.js', '.css', '.html']);
const POSITION_FIXED = /position\s*:\s*fixed/i;

/**
 * Out of scope per Z_INDEX.md's own 「范围」 line: test fixtures and the
 * ui-kit demo page are not product runtime.
 */
const SKIP_PATH_RES = [/\.test\.js$/, /[\\/]__/, /[\\/]demo\.html$/, /[\\/]e2e[\\/]/];

/**
 * @param {string} absDir
 * @returns {string[]} absolute file paths
 */
function walk(absDir) {
  const out = [];
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    const abs = join(absDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      out.push(...walk(abs));
      continue;
    }
    out.push(abs);
  }
  return out;
}

/** @returns {string[]} repo-relative paths, POSIX separators */
function collectScanTargets() {
  const files = [];
  for (const root of SCAN_ROOTS) {
    const abs = join(PKG_ROOT, root);
    let stat;
    try {
      stat = statSync(abs);
    } catch {
      continue;
    }
    files.push(...(stat.isDirectory() ? walk(abs) : [abs]));
  }
  return files
    .map((abs) => relative(PKG_ROOT, abs).split(sep).join('/'))
    .filter((rel) => SCAN_EXTS.has(rel.slice(rel.lastIndexOf('.'))))
    .filter((rel) => !SKIP_PATH_RES.some((re) => re.test(rel)))
    .sort();
}

/**
 * @param {string} rel
 * @returns {boolean}
 */
function mountsFixedLayer(rel) {
  return POSITION_FIXED.test(readFileSync(join(PKG_ROOT, rel), 'utf8'));
}

/**
 * Z_INDEX.md cites files as bare paths inside table cells, sometimes wrapped in
 * backticks. Substring containment is enough and stays robust to table edits.
 * @returns {string}
 */
function readRegistry() {
  return readFileSync(REGISTRY, 'utf8');
}

/**
 * @returns {boolean} true when the registry covers every fixed-layer file
 */
export function runZIndexRegistryCheck() {
  const registry = readRegistry();
  const scanned = collectScanTargets();
  const fixedFiles = scanned.filter(mountsFixedLayer);
  const missing = fixedFiles.filter((rel) => !registry.includes(rel));

  if (missing.length) {
    console.error('[z-index-registry] FAILED — position:fixed not registered in docs/Z_INDEX.md');
    for (const rel of missing) console.error(`  - ${rel}`);
    console.error(
      '  Add one row per layer (z-index · file · 用途). Do not renumber existing layers.'
    );
    return false;
  }

  console.log(`[z-index-registry] OK — ${fixedFiles.length} fixed-layer files, all registered`);
  return true;
}

function main() {
  if (!runZIndexRegistryCheck()) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
