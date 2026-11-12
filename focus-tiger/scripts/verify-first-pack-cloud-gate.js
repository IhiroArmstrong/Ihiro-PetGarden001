#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * First-invite ship: client cloud backup gate must stay off in source
 * and must not be inlined on in packed dist.
 *
 * Usage: node scripts/verify-first-pack-cloud-gate.js [--require-dist]
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const enabledSrc = path.join(
  rootDir,
  'src/core/practiceBackup/practiceBackupCloudEnabled.js'
);
const distDir = path.join(rootDir, 'dist');
const requireDist = process.argv.includes('--require-dist');

const src = readFileSync(enabledSrc, 'utf8');
if (!/export let practiceBackupCloudEnabled = false;/.test(src)) {
  console.error(
    'verify-first-pack-cloud-gate: source default must be `export let practiceBackupCloudEnabled = false;`'
  );
  process.exit(1);
}

const FORBIDDEN_INLINED = [
  'practiceBackupCloudEnabled=!0',
  'practiceBackupCloudEnabled=true',
  'practiceBackupCloudEnabled===!0'
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

const distStat = statSync(distDir, { throwIfNoEntry: false });
if (!distStat?.isDirectory()) {
  if (requireDist) {
    console.error(
      'verify-first-pack-cloud-gate: missing dist/ — run npm run build first'
    );
    process.exit(1);
  }
  console.log(
    'verify-first-pack-cloud-gate: OK (source default false; dist not present)'
  );
  process.exit(0);
}

/** @type {{ file: string, token: string }[]} */
const hits = [];
for (const file of walkJsFiles(distDir)) {
  const text = readFileSync(file, 'utf8');
  for (const token of FORBIDDEN_INLINED) {
    if (text.includes(token)) {
      hits.push({ file: path.relative(rootDir, file), token });
    }
  }
}

if (hits.length > 0) {
  console.error('Cloud backup gate inlined ON in production dist:');
  for (const hit of hits) {
    console.error(`  - ${hit.token} in ${hit.file}`);
  }
  process.exit(1);
}

console.log(
  'verify-first-pack-cloud-gate: OK (source default false; dist has no ON inline)'
);
