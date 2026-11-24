#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Invite DMG (default pack): packed dist must inline the cloud gate OFF.
 * Source default stays ON so D1–D4 remain in git for a later public open.
 * Open-gate pack: set VITE_FT_PRACTICE_BACKUP_CLOUD=1 (dist must not inline OFF).
 *
 * Usage: node scripts/verify-first-pack-cloud-gate.js [--require-dist]
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SOURCE_ON_LINE =
  'export let practiceBackupCloudEnabled = compileTimePracticeBackupCloudEnabled();';

export const GATE_OFF_INLINES = [
  'practiceBackupCloudEnabled=!1',
  'practiceBackupCloudEnabled=false'
];

export const GATE_ON_INLINES = [
  'practiceBackupCloudEnabled=!0',
  'practiceBackupCloudEnabled=true'
];

/** Vite define survives minify; export names do not. */
export const INVITE_DIST_CLOUD_OFF_TOKENS = [
  'VITE_FT_PRACTICE_BACKUP_CLOUD:"0"',
  "VITE_FT_PRACTICE_BACKUP_CLOUD:'0'"
];

export const OPEN_DIST_CLOUD_ON_TOKENS = [
  'VITE_FT_PRACTICE_BACKUP_CLOUD:"1"',
  "VITE_FT_PRACTICE_BACKUP_CLOUD:'1'"
];

/**
 * Invite pack unless the opener explicitly requests a public cloud-on build.
 * @param {NodeJS.ProcessEnv} [env]
 */
export function isInvitePackCloudGateOff(env = process.env) {
  return env.VITE_FT_PRACTICE_BACKUP_CLOUD !== '1';
}

/**
 * @param {string} src
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function evaluateSourceCloudGate(src) {
  if (!src.includes(SOURCE_ON_LINE)) {
    return {
      ok: false,
      error:
        'verify-first-pack-cloud-gate: source must keep compile-time helper default (D1–D4 stay in git)'
    };
  }
  if (!src.includes('return true;')) {
    return {
      ok: false,
      error:
        'verify-first-pack-cloud-gate: source compile-time fallback must remain true'
    };
  }
  return { ok: true };
}

/**
 * @param {{ file: string, text: string }[]} files
 * @param {readonly string[]} tokens
 * @returns {{ file: string, token: string }[]}
 */
export function findCloudGateInlines(files, tokens) {
  /** @type {{ file: string, token: string }[]} */
  const hits = [];
  for (const { file, text } of files) {
    for (const token of tokens) {
      if (text.includes(token)) hits.push({ file, token });
    }
  }
  return hits;
}

/** @deprecated use findCloudGateInlines(files, GATE_OFF_INLINES) */
export function findForbiddenCloudGateInlines(files) {
  return findCloudGateInlines(files, GATE_OFF_INLINES);
}

const isCli =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const enabledSrc = path.join(
    rootDir,
    'src/core/practiceBackup/practiceBackupCloudEnabled.js'
  );
  const distDir = path.join(rootDir, 'dist');
  const requireDist = process.argv.includes('--require-dist');
  const inviteOff = isInvitePackCloudGateOff(process.env);

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
      inviteOff
        ? 'verify-first-pack-cloud-gate: OK (source fallback true; invite pack; dist not present)'
        : 'verify-first-pack-cloud-gate: OK (source fallback true; open-gate pack; dist not present)'
    );
    process.exit(0);
  }

  const files = walkJsFiles(distDir).map((file) => ({
    file: path.relative(rootDir, file),
    text: readFileSync(file, 'utf8')
  }));
  const offHits = findCloudGateInlines(files, GATE_OFF_INLINES);
  const onHits = findCloudGateInlines(files, GATE_ON_INLINES);

  const inviteEnvHits = findCloudGateInlines(files, INVITE_DIST_CLOUD_OFF_TOKENS);
  const openEnvHits = findCloudGateInlines(files, OPEN_DIST_CLOUD_ON_TOKENS);

  if (inviteOff) {
    if (inviteEnvHits.length === 0 && offHits.length === 0) {
      console.error(
        'verify-first-pack-cloud-gate: invite pack dist must inline VITE_FT_PRACTICE_BACKUP_CLOUD:"0"'
      );
      process.exit(1);
    }
    if (openEnvHits.length > 0) {
      console.error(
        'verify-first-pack-cloud-gate: invite pack dist must not inline VITE_FT_PRACTICE_BACKUP_CLOUD:"1"'
      );
      process.exit(1);
    }
    console.log(
      'verify-first-pack-cloud-gate: OK (invite pack; cloud env inlined 0)'
    );
    process.exit(0);
  }

  if (inviteEnvHits.length > 0 || offHits.length > 0) {
    console.error('Cloud backup gate inlined OFF in open-gate production dist');
    process.exit(1);
  }
  if (openEnvHits.length === 0 && onHits.length === 0) {
    console.error(
      'verify-first-pack-cloud-gate: open-gate dist must inline VITE_FT_PRACTICE_BACKUP_CLOUD:\"1\"'
    );
    process.exit(1);
  }
  console.log(
    'verify-first-pack-cloud-gate: OK (open-gate pack; cloud env inlined 1)'
  );
}
