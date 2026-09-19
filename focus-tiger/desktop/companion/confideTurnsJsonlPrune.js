/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pruneConfideTurnsJsonlContent } from '../../src/core/confide/confideTurnsJsonlRetention.js';

const COMPANION_L2_DIR = 'companion-l2';
const TURNS_FILE = 'turns.jsonl';

/**
 * @param {string} userDataDir
 * @param {number} [nowMs]
 * @returns {Promise<{ pruned: boolean, dropped: number }>}
 */
export async function pruneLocalConfideTurnsJsonl(userDataDir, nowMs = Date.now()) {
  const filePath = path.join(userDataDir, COMPANION_L2_DIR, TURNS_FILE);
  let prior = '';
  try {
    prior = await readFile(filePath, 'utf8');
  } catch {
    return { pruned: false, dropped: 0 };
  }
  const result = pruneConfideTurnsJsonlContent(prior, nowMs);
  if (result.dropped === 0 && prior === result.content) {
    return { pruned: false, dropped: 0 };
  }
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, result.content, 'utf8');
    return { pruned: true, dropped: result.dropped };
  } catch {
    return { pruned: false, dropped: 0 };
  }
}
