#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Direct-channel ship: client cloud backup gate must stay on in source
 * (Setapp / MAS still hide the Preferences row at runtime).
 *
 * Usage: node scripts/verify-first-pack-cloud-gate.js [--require-dist]
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SOURCE_ON_LINE =
  'export let practiceBackupCloudEnabled = true;';

/** Packed dist accidentally inlined the old invite-off default. */
export const FORBIDDEN_INLINED = [
  'practiceBackupCloudEnabled=!1',
  'practiceBackupCloudEnabled=false'
];

/**
 * @param {string} src
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function evaluateSourceCloudGate(src) {
  if (!src.includes(SOURCE_ON_LINE)) {
    return {
      ok: false,
      error:
        'verify-first-pack-cloud-gate: source default must be `export let practiceBackupCloudEnabled = true;`'
    };
  }
  return { ok: true };
}

/**
 * @param {{ file: string, text: string }[]} files
 * @returns {{ file: string, token: string }[]}
 */
export function findForbiddenCloudGateInlines(files) {
  /** @type {{ file: string, token: string }[]} */
  const hits = [];
  for (const { file, text } of files) {
    for (const token of FORBIDDEN_INLINED) {
      if (text.includes(token)) hits.push({ file, token });
    }
  }
  return hits;
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (!isCli) {
  // imported by unit tests
} else {
  const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const enabledSrc = path.join(
    rootDir,
    'src/core/practiceBackup/practiceBackupCloudEnabled.js'
  );
  const distDir = path.join(rootDir, 'dist');
  const requireDist = process.argv.includes('--require-dist');

  const srcResult = evaluateSourceCloudGate(readFileSync(enabledSrc, 'utf8'));
  if (!srcResult.ok) {
    console.error(srcResult.error);
    process.exit(1);
  }

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
      'verify-first-pack-cloud-gate: OK (source default true; dist not present)'
    );
    process.exit(0);
  }

  const hits = findForbiddenCloudGateInlines(
    walkJsFiles(distDir).map((file) => ({
      file: path.relative(rootDir, file),
      text: readFileSync(file, 'utf8')
    }))
  );

  if (hits.length > 0) {
    console.error('Cloud backup gate inlined OFF in production dist:');
    for (const hit of hits) {
      console.error(`  - ${hit.token} in ${hit.file}`);
    }
    process.exit(1);
  }

  console.log(
    'verify-first-pack-cloud-gate: OK (source default true; dist has no OFF inline)'
  );
}
