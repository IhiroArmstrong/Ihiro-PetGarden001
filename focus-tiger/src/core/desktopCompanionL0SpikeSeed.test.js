/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  retireLegacyProductionGgufs,
  seedProductionFromSpikeFile,
  trySeedProductionFromSpikeCache
} from '../../desktop/companion/l0SpikeSeed.js';

describe('L0 spike cache seed', () => {
  it('copies a complete spike GGUF into companion-l0 when dest is missing', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-l0-seed-'));
    const filename = 'Qwen3-1.7B-Q4_K_M.gguf';
    const spikePath = path.join(root, 'spike', filename);
    const destPath = path.join(root, 'prod', filename);
    const bytes = 1_107_409_472;
    fs.mkdirSync(path.dirname(spikePath), { recursive: true });
    fs.writeFileSync(spikePath, Buffer.alloc(0));
    fs.truncateSync(spikePath, bytes);

    try {
      assert.equal(seedProductionFromSpikeFile(destPath, spikePath), true);
      assert.equal(fs.existsSync(destPath), true);
      assert.equal(fs.statSync(destPath).size, bytes);
      assert.equal(seedProductionFromSpikeFile(destPath, spikePath), false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('unlinks leftover 0.6B only after production 1.7B dest is complete', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-l0-retire-'));
    const destPath = path.join(root, 'Qwen3-1.7B-Q4_K_M.gguf');
    const leftover = path.join(root, 'Qwen_Qwen3-0.6B-Q4_K_M.gguf');
    fs.writeFileSync(leftover, 'old');
    try {
      assert.deepEqual(retireLegacyProductionGgufs(destPath), []);
      assert.equal(fs.existsSync(leftover), true);
      fs.writeFileSync(destPath, Buffer.alloc(0));
      fs.truncateSync(destPath, 1_107_409_472);
      const removed = retireLegacyProductionGgufs(destPath);
      assert.equal(removed.includes(leftover), true);
      assert.equal(fs.existsSync(leftover), false);
      assert.equal(fs.existsSync(destPath), true);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('no-ops on non-darwin when spike cache path is unavailable', () => {
    if (process.platform === 'darwin') return;
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-l0-seed-skip-'));
    const destPath = path.join(root, 'Qwen3-1.7B-Q4_K_M.gguf');
    try {
      assert.equal(trySeedProductionFromSpikeCache(destPath), false);
      assert.equal(fs.existsSync(destPath), false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
