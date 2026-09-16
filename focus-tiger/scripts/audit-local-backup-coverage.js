#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Local backup storage registry audit.
 *
 *   npm run audit:local-backup-coverage
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from '../src/core/localStateKeys.js';
import {
  PRACTICE_BACKUP_EXPORT_KEYS,
  LOCAL_BACKUP_EXCLUDE_ROWS
} from '../src/core/practiceBackup/localBackupStorageRegistry.js';
import { PRACTICE_BACKUP_STORE_KEYS } from '../src/core/practiceBackup/practiceBackupSnapshot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

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
      `[audit:local-backup-coverage] OK — ${exportCount} export keys; ${FOCUS_TIGER_LOCAL_STORAGE_KEYS.length} reset keys`
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
