#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Every `focus-tiger.*.v1` key documented in SHARED_RESOURCES §1 must either:
 * - appear on the DEV/Privacy reset whitelist (`FOCUS_TIGER_LOCAL_STORAGE_KEYS`), or
 * - appear on the shrink-only literal exception list (sessionStorage / IndexedDB / pending whitelist).
 *
 *   npm run audit:shared-resources-reset
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from '../src/core/localStateKeys.js';
import { FOCUS_TIGER_LOCAL_STORAGE_KEY_LITERAL_EXCEPTIONS } from '../src/core/localStateKeyLiteralScan.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/** Keys documented in SHARED_RESOURCES but intentionally not cleared via localStorage whitelist. */
export const SHARED_RESOURCES_RESET_DOC_EXEMPT = Object.freeze([
  // IndexedDB store name (cleared via `clearAllUserAmbientTracks`, not localStorage whitelist).
  'focus-tiger.user-ambient.v1'
]);

const KEY_IN_BACKTICKS = /`(focus-tiger\.[a-z0-9.-]+\.v1)`/g;

/**
 * @param {string} sharedResourcesMd
 * @returns {string[]}
 */
export function extractSharedResourcesLocalStorageKeys(sharedResourcesMd) {
  const keys = new Set();
  let match;
  KEY_IN_BACKTICKS.lastIndex = 0;
  while ((match = KEY_IN_BACKTICKS.exec(sharedResourcesMd)) !== null) {
    keys.add(match[1]);
  }
  return [...keys].sort();
}

/**
 * @param {object} [opts]
 * @param {string} [opts.sharedResourcesPath]
 * @returns {{ ok: boolean, undocumentedOnWhitelist: string[], missingCoverage: string[] }}
 */
export function runSharedResourcesResetCoverageAudit(opts = {}) {
  const sharedPath =
    opts.sharedResourcesPath ?? join(ROOT, 'docs/SHARED_RESOURCES.md');
  const md = readFileSync(sharedPath, 'utf8');
  const documented = extractSharedResourcesLocalStorageKeys(md);
  const whitelist = new Set(FOCUS_TIGER_LOCAL_STORAGE_KEYS);
  const exceptions = new Set([
    ...FOCUS_TIGER_LOCAL_STORAGE_KEY_LITERAL_EXCEPTIONS,
    ...SHARED_RESOURCES_RESET_DOC_EXEMPT
  ]);

  /** @type {string[]} */
  const missingCoverage = [];
  for (const key of documented) {
    if (whitelist.has(key)) continue;
    if (exceptions.has(key)) continue;
    missingCoverage.push(key);
  }

  /** @type {string[]} */
  const undocumentedOnWhitelist = [];
  for (const key of whitelist) {
    if (documented.includes(key)) continue;
    // Keys only listed in localStateKeys but not yet in SHARED table are OK for this audit.
    undocumentedOnWhitelist.push(key);
  }

  const ok = missingCoverage.length === 0;
  return { ok, undocumentedOnWhitelist, missingCoverage };
}

/**
 * @returns {boolean}
 */
export function runSharedResourcesResetCoverageAuditCli() {
  const { ok, missingCoverage } = runSharedResourcesResetCoverageAudit();
  if (!ok) {
    for (const key of missingCoverage) {
      console.error(
        `[audit:shared-resources-reset] SHARED_RESOURCES key missing reset coverage (whitelist or exempt list): ${key}`
      );
    }
    return false;
  }
  console.log(
    `[audit:shared-resources-reset] OK — all SHARED_RESOURCES localStorage keys covered (${FOCUS_TIGER_LOCAL_STORAGE_KEYS.length} reset keys)`
  );
  return true;
}

const isCli =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  if (!runSharedResourcesResetCoverageAuditCli()) process.exitCode = 1;
}
