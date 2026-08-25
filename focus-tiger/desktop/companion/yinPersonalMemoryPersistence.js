/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin Personal Memory · Electron userData persistence (Slice 1a).
 * File: userData/companion-l2/yin-personal-memory.json
 * Not localStorage. Not practice backup. Not turns.jsonl.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  emptyYinPersonalMemoryState,
  normalizeYinPersonalMemoryState
} from '../../src/core/yinPersonalMemory/yinPersonalMemorySchema.js';
import { applyYinMemoryConsent } from '../../src/core/yinPersonalMemory/yinPersonalMemoryConsent.js';

export const YIN_PERSONAL_MEMORY_DIRNAME = 'companion-l2';
export const YIN_PERSONAL_MEMORY_FILENAME = 'yin-personal-memory.json';

/**
 * @param {string} userDataDir
 * @returns {string}
 */
export function yinPersonalMemoryFilePath(userDataDir) {
  return path.join(userDataDir, YIN_PERSONAL_MEMORY_DIRNAME, YIN_PERSONAL_MEMORY_FILENAME);
}

/**
 * @param {string} userDataDir
 */
export async function readYinPersonalMemoryState(userDataDir) {
  const filePath = yinPersonalMemoryFilePath(userDataDir);
  try {
    const raw = await readFile(filePath, 'utf8');
    return normalizeYinPersonalMemoryState(JSON.parse(raw));
  } catch (err) {
    if (/** @type {NodeJS.ErrnoException} */ (err).code === 'ENOENT') {
      return emptyYinPersonalMemoryState();
    }
    return emptyYinPersonalMemoryState();
  }
}

/**
 * @param {string} userDataDir
 * @param {import('../../src/core/yinPersonalMemory/yinPersonalMemorySchema.js').YinPersonalMemoryState} state
 */
export async function writeYinPersonalMemoryState(userDataDir, state) {
  const filePath = yinPersonalMemoryFilePath(userDataDir);
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  const next = normalizeYinPersonalMemoryState(state);
  const serialized = JSON.stringify(next);
  try {
    const existing = await readFile(filePath, 'utf8');
    if (existing === serialized) return next;
  } catch {
    /* new file */
  }
  await writeFile(filePath, serialized, 'utf8');
  return next;
}

/**
 * @param {string} userDataDir
 * @param {boolean} granted
 */
export async function setYinPersonalMemoryConsent(userDataDir, granted) {
  const current = await readYinPersonalMemoryState(userDataDir);
  const next = applyYinMemoryConsent(current, granted);
  return writeYinPersonalMemoryState(userDataDir, next);
}
