/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const COMPANION_L2_DIR = 'companion-l2';
const YIN_MEMORY_FILE = 'yin-personal-memory.json';
const TURNS_FILE = 'turns.jsonl';

/**
 * @param {string} userDataDir
 * @returns {Promise<{ yinPersonalMemory: unknown | null, confideTurnsJsonl: string | null }>}
 */
export async function readLocalBackupCompanionFiles(userDataDir) {
  const dir = path.join(userDataDir, COMPANION_L2_DIR);
  /** @type {unknown | null} */
  let yinPersonalMemory = null;
  /** @type {string | null} */
  let confideTurnsJsonl = null;
  try {
    const raw = await readFile(path.join(dir, YIN_MEMORY_FILE), 'utf8');
    yinPersonalMemory = JSON.parse(raw);
  } catch {
    yinPersonalMemory = null;
  }
  try {
    confideTurnsJsonl = await readFile(path.join(dir, TURNS_FILE), 'utf8');
  } catch {
    confideTurnsJsonl = null;
  }
  return { yinPersonalMemory, confideTurnsJsonl };
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
    if ('confideTurnsJsonl' in bundle) {
      const turns = bundle.confideTurnsJsonl;
      await writeFile(
        path.join(dir, TURNS_FILE),
        turns == null ? '' : String(turns),
        'utf8'
      );
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'companion_write_failed';
    return { ok: false, reason: msg };
  }
}
