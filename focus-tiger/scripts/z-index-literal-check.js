#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A12 / Z-dim (a): product z-index digits must be registered and, outside the
 * shrinking exemption list, must come from `src/ui/zIndexLayers.js`.
 *
 *   node scripts/z-index-literal-check.js
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REGISTERED_Z_VALUES, Z, zIndexByName } from '../src/ui/zIndexLayers.js';
import { Z_INDEX_LITERAL_EXEMPTIONS } from './z-index-literal-exemptions.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const REGISTRY = join(PKG_ROOT, 'docs/Z_INDEX.md');

const SCAN_ROOTS = ['index.html', 'src'];
const SCAN_EXTS = new Set(['.js', '.css', '.html']);
const SKIP_PATH_RES = [
  /\.test\.js$/,
  /[\\/]__/,
  /[\\/]demo\.html$/,
  /[\\/]e2e[\\/]/,
  /zIndexLayers\.js$/
];

const LITERAL_RES = [
  /z-index\s*:\s*(-?\d+)/g,
  /zIndex\s*:\s*(-?\d+)/g,
  /\.zIndex\s*=\s*['"](-?\d+)['"]/g,
  /\.zIndex\s*=\s*(-?\d+)/g,
  /zIndex\s*\?\?\s*(-?\d+)/g,
  /['"]z-index:(-?\d+)['"]/g
];

/**
 * @param {string} absDir
 * @returns {string[]}
 */
function walk(absDir) {
  const out = [];
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    const abs = join(absDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      out.push(...walk(abs));
      continue;
    }
    out.push(abs);
  }
  return out;
}

/** @returns {string[]} */
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
 * @param {string} line
 * @returns {boolean}
 */
function isCommentLine(line) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('<!--')
  );
}

/**
 * @param {string} src
 * @returns {{ line: number, value: number, snippet: string }[]}
 */
export function collectZIndexLiterals(src) {
  const hits = [];
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    if (isCommentLine(line)) return;
    for (const re of LITERAL_RES) {
      re.lastIndex = 0;
      let match;
      while ((match = re.exec(line))) {
        hits.push({
          line: i + 1,
          value: Number(match[1]),
          snippet: line.trim().slice(0, 120)
        });
      }
    }
  });
  return hits;
}

/**
 * @param {string} src
 * @returns {number}
 */
export function maxDeclaredZIndex(src) {
  let max = 0;
  for (const hit of collectZIndexLiterals(src)) {
    max = Math.max(max, hit.value);
  }
  const interp = src.matchAll(/z-index\s*:\s*\$\{Z\.([A-Z0-9_]+)\}/g);
  for (const match of interp) {
    const value = zIndexByName(match[1]);
    if (Number.isFinite(value)) max = Math.max(max, value);
  }
  const bare = src.matchAll(/z-index:\$\{Z\.([A-Z0-9_]+)\}/g);
  for (const match of bare) {
    const value = zIndexByName(match[1]);
    if (Number.isFinite(value)) max = Math.max(max, value);
  }
  return max;
}

/**
 * Product table cells in Z_INDEX.md (`**12**` or `**18 / 19**`).
 * @param {string} markdown
 * @returns {Set<number>}
 */
export function parseRegistryZValues(markdown) {
  const product = markdown.split('## 附录')[0];
  const values = new Set();
  const rowRe = /^\|\s*\*\*(-?[\d]+(?:\s*\/\s*-?[\d]+)*)\*\*/gm;
  let match;
  while ((match = rowRe.exec(product))) {
    for (const part of match[1].split('/')) {
      const n = Number(part.trim());
      if (Number.isFinite(n)) values.add(n);
    }
  }
  return values;
}

/**
 * @returns {{ ok: boolean, errors: string[], hitsByFile: Record<string, number> }}
 */
export function evaluateZIndexLiterals({
  registryMarkdown = readFileSync(REGISTRY, 'utf8'),
  exemptions = Z_INDEX_LITERAL_EXEMPTIONS,
  readFile = (rel) => readFileSync(join(PKG_ROOT, rel), 'utf8'),
  checkModuleRegistry = true,
  scanTargets = null
} = {}) {
  const errors = [];
  const registryValues = parseRegistryZValues(registryMarkdown);
  if (checkModuleRegistry) {
    for (const value of REGISTERED_Z_VALUES) {
      if (!registryValues.has(value)) {
        errors.push(`Z.${findZName(value)} = ${value} is missing from Z_INDEX.md`);
      }
    }
    for (const value of registryValues) {
      if (!REGISTERED_Z_VALUES.has(value)) {
        errors.push(`Z_INDEX.md lists ${value} with no Z constant`);
      }
    }
  }

  const exemptByFile = new Map(exemptions.map((row) => [row.file, row]));
  const hitsByFile = {};
  const targets = scanTargets || collectScanTargets();
  for (const rel of targets) {
    const hits = collectZIndexLiterals(readFile(rel));
    if (!hits.length) continue;
    hitsByFile[rel] = hits.length;
    const unknown = hits.filter((hit) => !registryValues.has(hit.value));
    for (const hit of unknown) {
      errors.push(`${rel}:${hit.line} z-index ${hit.value} is not in Z_INDEX.md`);
    }
    const row = exemptByFile.get(rel);
    if (!row) {
      for (const hit of hits) {
        errors.push(`${rel}:${hit.line} raw z-index ${hit.value} must use Z.*`);
      }
      continue;
    }
    if (hits.length > row.maxHits) {
      errors.push(
        `${rel} has ${hits.length} raw z-index hits; exemption cap is ${row.maxHits}`
      );
    }
  }

  for (const row of exemptions) {
    const n = hitsByFile[row.file] || 0;
    if (n === 0) {
      errors.push(`stale exemption ${row.file} (0 hits; delete the row)`);
    }
  }

  return { ok: errors.length === 0, errors, hitsByFile };
}

/**
 * @param {number} value
 * @returns {string}
 */
function findZName(value) {
  return Object.keys(Z).find((key) => Z[key] === value) || '?';
}

/**
 * @returns {boolean}
 */
export function runZIndexLiteralCheck() {
  const result = evaluateZIndexLiterals();
  if (!result.ok) {
    console.error('[z-index-literals] FAILED');
    for (const err of result.errors) console.error(`  - ${err}`);
    return false;
  }
  const remaining = Object.values(result.hitsByFile).reduce((a, b) => a + b, 0);
  console.log(
    `[z-index-literals] OK — remaining raw hits ${remaining} (exemption caps only shrink)`
  );
  return true;
}

function main() {
  if (!runZIndexLiteralCheck()) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
