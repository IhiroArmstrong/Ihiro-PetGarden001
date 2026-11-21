#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * CSS --z-* in src/ui/z-index-tokens.css must match Z in zIndexLayers.js.
 *
 *   node scripts/check-z-index-tokens.js
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Z } from '../src/ui/zIndexLayers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const TOKENS = join(PKG_ROOT, 'src/ui/z-index-tokens.css');

export function zTokenName(key) {
  return `--z-${key.toLowerCase().replace(/_/g, '-')}`;
}

/**
 * @param {string} css
 * @returns {Map<string, number>}
 */
export function parseZIndexTokenVars(css) {
  const map = new Map();
  const re = /--z-([a-z0-9-]+)\s*:\s*(-?\d+)\s*;/g;
  let match;
  while ((match = re.exec(css))) {
    map.set(`--z-${match[1]}`, Number(match[2]));
  }
  return map;
}

/**
 * @param {object} [opts]
 * @param {string} [opts.css]
 * @param {Record<string, number>} [opts.layers]
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function evaluateZIndexTokens({
  css = readFileSync(TOKENS, 'utf8'),
  layers = Z
} = {}) {
  const errors = [];
  const parsed = parseZIndexTokenVars(css);
  for (const [key, value] of Object.entries(layers)) {
    const name = zTokenName(key);
    if (!parsed.has(name)) {
      errors.push(`${name} missing (Z.${key} = ${value})`);
      continue;
    }
    if (parsed.get(name) !== value) {
      errors.push(`${name} is ${parsed.get(name)}; Z.${key} is ${value}`);
    }
  }
  const expected = new Set(Object.keys(layers).map(zTokenName));
  for (const name of parsed.keys()) {
    if (!expected.has(name)) {
      errors.push(`${name} is not a Z key (do not grow a second table)`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function runZIndexTokensCheck() {
  const result = evaluateZIndexTokens();
  if (!result.ok) {
    console.error('[z-index-tokens] FAILED');
    for (const err of result.errors) console.error(`  - ${err}`);
    return false;
  }
  console.log(`[z-index-tokens] OK — ${Object.keys(Z).length} vars match Z`);
  return true;
}

function main() {
  if (!runZIndexTokensCheck()) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
