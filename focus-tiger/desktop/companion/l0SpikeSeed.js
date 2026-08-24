/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * One-time seed: reuse a completed 1.7B spike download for production companion-l0/.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SPIKE_17_CACHE_DIRNAME } from './l0Spike17Config.js';
import { isGgufDownloadComplete, writeDownloadMeta } from './l0Download.js';
import {
  L0_LEGACY_MODEL_FILENAMES,
  L0_MODEL_EXPECTED_BYTES,
  L0_MODEL_FILENAME,
  L0_MODEL_MIN_BYTES
} from './l0Config.js';

/**
 * @param {string} destPath production GGUF path (`companion-l0/…`)
 * @param {string} spikePath completed spike-cache GGUF path
 * @returns {boolean} true when dest was seeded from spikePath
 */
export function seedProductionFromSpikeFile(destPath, spikePath) {
  if (fs.existsSync(destPath)) return false;
  if (path.basename(destPath) !== L0_MODEL_FILENAME) return false;
  if (!spikePath || !fs.existsSync(spikePath)) return false;

  const bytes = fs.statSync(spikePath).size;
  if (
    !isGgufDownloadComplete(bytes, L0_MODEL_EXPECTED_BYTES, L0_MODEL_MIN_BYTES)
  ) {
    return false;
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(spikePath, destPath);
  writeDownloadMeta(destPath, {
    expectedBytes: L0_MODEL_EXPECTED_BYTES,
    url: null,
    etag: null
  });
  return true;
}

/**
 * @param {string} destPath production GGUF path (`companion-l0/…`)
 * @returns {boolean} true when dest was seeded from spike cache
 */
export function trySeedProductionFromSpikeCache(destPath) {
  const spikePath = defaultSpikeModelPath();
  if (!spikePath) return false;
  return seedProductionFromSpikeFile(destPath, spikePath);
}

/**
 * After production 1.7B dest is complete, drop leftover 0.6B GGUF (+ meta/part).
 * Does nothing if dest is missing or incomplete.
 *
 * @param {string} destPath production GGUF path (`companion-l0/…`)
 * @returns {string[]} unlinked paths
 */
export function retireLegacyProductionGgufs(destPath) {
  if (!destPath || !fs.existsSync(destPath)) return [];
  const bytes = fs.statSync(destPath).size;
  if (
    !isGgufDownloadComplete(bytes, L0_MODEL_EXPECTED_BYTES, L0_MODEL_MIN_BYTES)
  ) {
    return [];
  }
  const dir = path.dirname(destPath);
  const current = path.basename(destPath);
  const unlinked = [];
  for (const name of L0_LEGACY_MODEL_FILENAMES) {
    if (name === current) continue;
    for (const filePath of [
      path.join(dir, name),
      path.join(dir, `${name}.meta.json`),
      path.join(dir, `${name}.part`)
    ]) {
      if (!fs.existsSync(filePath)) continue;
      fs.unlinkSync(filePath);
      unlinked.push(filePath);
    }
  }
  return unlinked;
}

/**
 * @returns {string | null}
 */
function defaultSpikeModelPath() {
  if (process.platform === 'darwin') {
    return path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'Focus Tiger',
      SPIKE_17_CACHE_DIRNAME,
      L0_MODEL_FILENAME
    );
  }
  return null;
}
