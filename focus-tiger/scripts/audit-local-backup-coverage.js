#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Local backup storage registry audit.
 *
 *   npm run audit:local-backup-coverage
 *
 * Classification gate: every FOCUS_TIGER_LOCAL_STORAGE_KEYS entry must be
 * PRACTICE_BACKUP_EXPORT_KEYS or LOCAL_BACKUP_EXCLUDE_ROWS. New keys vs
 * origin/develop must be classified in the same PR (B1 1-05 follow-up).
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from '../src/core/localStateKeys.js';
import {
  PRACTICE_BACKUP_EXPORT_KEYS,
  LOCAL_BACKUP_EXCLUDE_ROWS,
  listUnclassifiedResetKeys,
  listUnclassifiedNewResetKeys
} from '../src/core/practiceBackup/localBackupStorageRegistry.js';
import { PRACTICE_BACKUP_STORE_KEYS } from '../src/core/practiceBackup/practiceBackupSnapshot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REPO_ROOT = join(ROOT, '..');

/**
 * @param {string} src
 * @param {string} exportName
 * @returns {string[] | null}
 */
export function extractFrozenStringKeys(src, exportName) {
  const re = new RegExp(
    `export const ${exportName} = Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\)`
  );
  const match = src.match(re);
  if (!match) return null;
  return [...match[1].matchAll(/'(focus-tiger\.[^']+)'/g)].map((m) => m[1]);
}

/**
 * @param {string} [repoRoot]
 * @returns {string[] | null}
 */
export function readDevelopResetKeys(repoRoot = REPO_ROOT) {
  try {
    const src = execFileSync(
      'git',
      ['show', 'origin/develop:focus-tiger/src/core/localStateKeys.js'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );
    return extractFrozenStringKeys(src, 'FOCUS_TIGER_LOCAL_STORAGE_KEYS');
  } catch {
    return null;
  }
}

/**
 * @returns {boolean}
 */
export function runLocalBackupCoverageAudit() {
  let ok = true;

  const exportSorted = [...PRACTICE_BACKUP_EXPORT_KEYS].sort();
  const storeSorted = [...PRACTICE_BACKUP_STORE_KEYS].sort();
  if (exportSorted.join('\0') !== storeSorted.join('\0')) {
    console.error(
      '[audit:local-backup-coverage] PRACTICE_BACKUP_EXPORT_KEYS drift from practiceBackupSnapshot PRACTICE_BACKUP_STORE_KEYS'
    );
    ok = false;
  }

  const localKeys = new Set(FOCUS_TIGER_LOCAL_STORAGE_KEYS);
  const excludeKeys = new Set(LOCAL_BACKUP_EXCLUDE_ROWS.map((row) => row.key));

  for (const key of PRACTICE_BACKUP_EXPORT_KEYS) {
    if (!localKeys.has(key)) {
      console.error(
        `[audit:local-backup-coverage] export key missing from FOCUS_TIGER_LOCAL_STORAGE_KEYS: ${key}`
      );
      ok = false;
    }
    if (excludeKeys.has(key)) {
      console.error(
        `[audit:local-backup-coverage] export key also marked exclude: ${key}`
      );
      ok = false;
    }
  }

  if (excludeKeys.has('focus-tiger.entitlement-cache.v1')) {
    if (PRACTICE_BACKUP_EXPORT_KEYS.includes('focus-tiger.entitlement-cache.v1')) {
      console.error(
        '[audit:local-backup-coverage] entitlement-cache must stay derived-only (not exported)'
      );
      ok = false;
    }
  }

  const unclassified = listUnclassifiedResetKeys(FOCUS_TIGER_LOCAL_STORAGE_KEYS);
  if (unclassified.length > 0) {
    console.error(
      `[audit:local-backup-coverage] unclassified reset keys (must be export or exclude in the same PR): ${unclassified.join(', ')}`
    );
    ok = false;
  }

  const developResetKeys = readDevelopResetKeys();
  if (developResetKeys) {
    const newUnclassified = listUnclassifiedNewResetKeys(
      FOCUS_TIGER_LOCAL_STORAGE_KEYS,
      developResetKeys
    );
    if (newUnclassified.length > 0) {
      console.error(
        `[audit:local-backup-coverage] new vs origin/develop reset keys must declare export or exclude in this PR: ${newUnclassified.join(', ')}`
      );
      ok = false;
    }
  } else {
    console.warn(
      '[audit:local-backup-coverage] origin/develop localStateKeys unavailable; skipped new-key vs develop check'
    );
  }

  const registryPath = join(ROOT, 'docs/local-backup-storage-registry.md');
  const registryMd = readFileSync(registryPath, 'utf8');
  const exportCount = PRACTICE_BACKUP_EXPORT_KEYS.length;
  const marker = `**${exportCount}** localStorage keys`;
  if (!registryMd.includes(marker)) {
    console.error(
      `[audit:local-backup-coverage] docs/local-backup-storage-registry.md missing export count marker: ${marker}`
    );
    ok = false;
  }

  if (ok) {
    console.log(
      `[audit:local-backup-coverage] OK — ${exportCount} export keys; ${FOCUS_TIGER_LOCAL_STORAGE_KEYS.length} reset keys; ${LOCAL_BACKUP_EXCLUDE_ROWS.length} exclude rows`
    );
  }

  return ok;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const ok = runLocalBackupCoverageAudit();
  if (!ok) process.exitCode = 1;
}
