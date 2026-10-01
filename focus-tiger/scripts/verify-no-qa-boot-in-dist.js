#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Fail if production dist still contains QA boot URL param literals.
 * Usage: node scripts/verify-no-qa-boot-in-dist.js
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(rootDir, 'dist');

const FORBIDDEN = [
  'qaSeedStreak',
  'qaSeedMinutes',
  'qaLotusBlooms',
  'qaKeepMilestones',
  'qaResetMilestones',
  'qaBootSeed',
  'qaPracticeSeed',
  'qaLotusPondSeed'
];

/** @param {string} dir */
function walkJsFiles(dir) {
  /** @type {string[]} */
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkJsFiles(full));
      continue;
    }
    if (full.endsWith('.js') || full.endsWith('.mjs')) out.push(full);
  }
  return out;
}

if (!statSync(distDir, { throwIfNoEntry: false })?.isDirectory()) {
  console.error('verify-no-qa-boot-in-dist: missing dist/ — run npm run build first');
  process.exit(1);
}

/** @type {{ file: string, token: string }[]} */
const hits = [];
for (const file of walkJsFiles(distDir)) {
  const text = readFileSync(file, 'utf8');
  for (const token of FORBIDDEN) {
    if (text.includes(token)) {
      hits.push({ file: path.relative(rootDir, file), token });
    }
  }
}

if (hits.length > 0) {
  console.error('QA boot literals found in production dist:');
  for (const hit of hits) {
    console.error(`  - ${hit.token} in ${hit.file}`);
  }
  process.exit(1);
}

console.log('verify-no-qa-boot-in-dist: OK (no QA boot literals in dist)');
