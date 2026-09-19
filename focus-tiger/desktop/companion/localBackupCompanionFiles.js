/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const COMPANION_L2_DIR = 'companion-l2';
const YIN_MEMORY_FILE = 'yin-personal-memory.json';

/**
 * Read companion files for local backup export (Yin memory only).
 * Confide turns.jsonl is local debug log and is intentionally excluded.
 *
 * @param {string} userDataDir
 * @returns {Promise<{ yinPersonalMemory: unknown | null }>}
 */
export async function readLocalBackupCompanionFiles(userDataDir) {
  const dir = path.join(userDataDir, COMPANION_L2_DIR);
  /** @type {unknown | null} */
  let yinPersonalMemory = null;
  try {
    const raw = await readFile(path.join(dir, YIN_MEMORY_FILE), 'utf8');
    yinPersonalMemory = JSON.parse(raw);
  } catch {
    yinPersonalMemory = null;
  }
  return { yinPersonalMemory };
}

/**
 * @param {string} userDataDir
 * @param {{ yinPersonalMemory?: unknown | null, confideTurnsJsonl?: string | null }} bundle
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export async function writeLocalBackupCompanionFiles(userDataDir, bundle) {
  if (!bundle || typeof bundle !== 'object') {
    return { ok: true };
  }
  const dir = path.join(userDataDir, COMPANION_L2_DIR);
  try {
    await mkdir(dir, { recursive: true });
    if ('yinPersonalMemory' in bundle) {
      const val = bundle.yinPersonalMemory;
      if (val == null) {
        try {
          await writeFile(path.join(dir, YIN_MEMORY_FILE), '', 'utf8');
        } catch {
          /* absent ok */
        }
      } else {
        await writeFile(
          path.join(dir, YIN_MEMORY_FILE),
          `${JSON.stringify(val, null, 2)}\n`,
          'utf8'
        );
      }
    }
    // confideTurnsJsonl: legacy import field — never written back (debug log stays device-local).
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'companion_write_failed';
    return { ok: false, reason: msg };
  }
}
