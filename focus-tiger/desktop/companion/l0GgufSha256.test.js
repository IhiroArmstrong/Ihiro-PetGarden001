/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { sha256FileHex, verifyGgufSha256 } from './l0GgufSha256.js';

describe('l0GgufSha256', () => {
  it('rejects mismatch before load (9-03)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-gguf-sha-'));
    const file = path.join(dir, 'm.gguf');
    fs.writeFileSync(file, Buffer.from('hello', 'utf8'));
    const hex = sha256FileHex(file);
    verifyGgufSha256(file, hex);
    assert.throws(() => verifyGgufSha256(file, 'a'.repeat(64)), /model_sha256_mismatch/);
  });
});
