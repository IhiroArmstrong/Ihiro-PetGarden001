/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Electron-main append-only log for Confide observation telemetry.
 */

import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const LOG_FILE = 'confide-observation.jsonl';

/**
 * @param {string} userDataDir
 * @param {object} record
 */
export async function appendConfideObservationLog(userDataDir, record) {
  if (!userDataDir || !record || typeof record !== 'object') return;
  try {
    const dir = path.join(userDataDir, 'companion-l2');
    await mkdir(dir, { recursive: true });
    await appendFile(
      path.join(dir, LOG_FILE),
      `${JSON.stringify(record)}\n`,
      'utf8'
    );
  } catch {
    /* local log must not break Share */
  }
}

export { LOG_FILE };
