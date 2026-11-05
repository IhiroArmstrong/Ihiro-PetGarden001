/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

import {
  ensureGuidedMeditationCached,
  sha256FileHex,
  verifyGuidedMeditationSha256
} from '../../desktop/guidedMeditation/guidedMeditationDownload.js';

describe('guidedMeditationDownload', () => {
  it('verifies SHA-256 and deletes corrupt cache', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-gm-'));
    const file = path.join(dir, 'delivery.mp4');
    fs.writeFileSync(file, 'hello');
    const digest = sha256FileHex(file);
    verifyGuidedMeditationSha256(file, digest);
    assert.throws(
      () => verifyGuidedMeditationSha256(file, '0'.repeat(64)),
      /guided_meditation_sha256_mismatch/
    );
    assert.equal(fs.existsSync(file), false);
  });

  it('downloads via fetch mock and skips re-fetch when cached', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-gm-'));
    const body = Buffer.from('guided-meditation-fixture');
    const expectedSha256 = sha256FileHexFromBuffer(body);
    const fetch = async () => ({
      ok: true,
      status: 200,
      headers: {
        get: (name) => (String(name).toLowerCase() === 'content-length' ? String(body.length) : null)
      },
      body: {
        getReader: () => {
          let done = false;
          return {
            read: async () => {
              if (done) return { done: true, value: undefined };
              done = true;
              return { done: false, value: body };
            }
          };
        }
      }
    });
    const first = await ensureGuidedMeditationCached({
      userDataDir: dir,
      lessonId: 'concepts-habits-intro',
      kind: 'audio',
      url: 'https://example.test/a.m4a',
      objectHash: 'testhash',
      expectedSha256,
      expectedBytes: body.length,
      fetch
    });
    assert.equal(first.fromCache, false);
    const second = await ensureGuidedMeditationCached({
      userDataDir: dir,
      lessonId: 'concepts-habits-intro',
      kind: 'audio',
      url: 'https://example.test/a.m4a',
      objectHash: 'testhash',
      expectedSha256,
      expectedBytes: body.length,
      fetch: async () => {
        throw new Error('should_not_refetch');
      }
    });
    assert.equal(second.fromCache, true);
  });
});

function sha256FileHexFromBuffer(buf) {
  return createHash('sha256').update(buf).digest('hex');
}
