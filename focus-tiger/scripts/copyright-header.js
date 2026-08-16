#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * First-party source copyright headers.
 *
 *   node scripts/copyright-header.js           # check (exit 1 if missing)
 *   node scripts/copyright-header.js --write   # prepend missing headers
 *
 * Scope: first-party JS/CSS/HTML we maintain. Skips vendor (draco/basis),
 * JSON (no comments), node_modules, dist.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FILE_HEADER_COPYRIGHT_LINE,
  FILE_HEADER_PRODUCT_LINE
} from '../src/core/copyrightNotice.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = join(__dirname, '..');

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
  'art-reference',
  'archive',
  'draco',
  'basis'
]);

const HEADER_EXTS = new Set(['.js', '.mjs', '.cjs', '.css', '.html']);

export const JS_CSS_HEADER = `/**
 * ${FILE_HEADER_PRODUCT_LINE}
 * ${FILE_HEADER_COPYRIGHT_LINE}
 */

`;

export const HTML_HEADER = `<!--
  ${FILE_HEADER_PRODUCT_LINE}
  ${FILE_HEADER_COPYRIGHT_LINE}
-->

`;

const MARKER = 'Focus Tiger™ is a product of Twinsology';

/**
 * @param {string} dir
 * @param {string[]} out
 */
function walk(dir, out) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.') && ent.name !== '.') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue;
      walk(p, out);
      continue;
    }
    if (!HEADER_EXTS.has(extname(ent.name))) continue;
    out.push(p);
  }
}

/**
 * @returns {string[]}
 */
export function listCopyrightHeaderFiles() {
  const out = [];
  walk(FOCUS_TIGER, out);
  return out.sort();
}

/**
 * @param {string} absPath
 * @returns {string}
 */
function relFromFocusTiger(absPath) {
  return relative(FOCUS_TIGER, absPath).split(sep).join('/');
}

/**
 * @param {string} absPath
 * @returns {boolean}
 */
export function fileHasCopyrightHeader(absPath) {
  const text = readFileSync(absPath, 'utf8');
  const head = text.slice(0, 800);
  return head.includes(MARKER);
}

/**
 * @param {string} absPath
 * @returns {boolean} true if written
 */
export function applyCopyrightHeader(absPath) {
  if (fileHasCopyrightHeader(absPath)) return false;
  const ext = extname(absPath);
  const banner = ext === '.html' ? HTML_HEADER : JS_CSS_HEADER;
  const text = readFileSync(absPath, 'utf8');
  let next;
  if (text.startsWith('#!')) {
    const nl = text.indexOf('\n');
    if (nl === -1) {
      next = `${text}\n${banner}`;
    } else {
      next = `${text.slice(0, nl + 1)}${banner}${text.slice(nl + 1)}`;
    }
  } else if (ext === '.html' && /^<!DOCTYPE html>/i.test(text)) {
    const nl = text.indexOf('\n');
    if (nl === -1) {
      next = `${text}\n${banner}`;
    } else {
      next = `${text.slice(0, nl + 1)}${banner}${text.slice(nl + 1)}`;
    }
  } else {
    next = `${banner}${text}`;
  }
  writeFileSync(absPath, next, 'utf8');
  return true;
}

/**
 * @returns {boolean}
 */
export function runCopyrightHeaderCheck() {
  const files = listCopyrightHeaderFiles();
  const missing = files.filter((p) => !fileHasCopyrightHeader(p));
  if (missing.length) {
    console.error(
      `[copyright-header] missing header in ${missing.length} file(s):`
    );
    for (const p of missing.slice(0, 40)) {
      console.error(`  - ${relFromFocusTiger(p)}`);
    }
    if (missing.length > 40) {
      console.error(`  … and ${missing.length - 40} more`);
    }
    return false;
  }
  console.log(
    `[copyright-header] OK — ${files.length} first-party JS/CSS/HTML files`
  );
  return true;
}

function main() {
  const write = process.argv.includes('--write');
  if (write) {
    const files = listCopyrightHeaderFiles();
    const missing = files.filter((p) => !fileHasCopyrightHeader(p));
    let n = 0;
    for (const p of missing) {
      if (applyCopyrightHeader(p)) n += 1;
    }
    console.log(
      `[copyright-header] wrote ${n} headers (${files.length} first-party files)`
    );
    return;
  }
  if (!runCopyrightHeaderCheck()) process.exit(1);
}

const isDirect =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isDirect) {
  main();
}
