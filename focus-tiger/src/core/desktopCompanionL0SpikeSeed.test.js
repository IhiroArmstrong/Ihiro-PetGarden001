/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { trySeedProductionFromSpikeCache } from '../../desktop/companion/l0SpikeSeed.js';

describe('L0 spike cache seed', () => {
  it('copies a complete spike GGUF into companion-l0 when dest is missing', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-l0-seed-'));
    const spikeDir = path.join(
      root,
      'Library',
      'Application Support',
      'Focus Tiger',
      'companion-spike-17b'
    );
    const prodDir = path.join(root, 'companion-l0');
    fs.mkdirSync(spikeDir, { recursive: true });
    const filename = 'Qwen3-1.7B-Q4_K_M.gguf';
    const spikePath = path.join(spikeDir, filename);
    const destPath = path.join(prodDir, filename);
    const bytes = 1_107_409_472;
    fs.writeFileSync(spikePath, Buffer.alloc(0));
    fs.truncateSync(spikePath, bytes);

    const originalHomedir = os.homedir;
    Object.defineProperty(os, 'homedir', {
      configurable: true,
      value: () => root
    });
    try {
      assert.equal(trySeedProductionFromSpikeCache(destPath), true);
      assert.equal(fs.existsSync(destPath), true);
      assert.equal(fs.statSync(destPath).size, bytes);
      assert.equal(trySeedProductionFromSpikeCache(destPath), false);
    } finally {
      Object.defineProperty(os, 'homedir', {
        configurable: true,
        value: originalHomedir
      });
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
