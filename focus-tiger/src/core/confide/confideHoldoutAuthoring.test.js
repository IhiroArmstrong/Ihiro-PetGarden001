/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  authorizeHoldoutRun,
  hashHoldoutFile
} from './confideMoodVetoHoldoutLab.js';
import {
  assertSampleNotFromVoidedHoldouts,
  collectVoidedUtteranceHashes,
  requireHoldoutAuthorPromptId
} from './confideHoldoutAuthoring.js';

describe('confide holdout authoring gates', () => {
  it('refuses seal/score without handwritten prompt id', () => {
    assert.throws(
      () => requireHoldoutAuthorPromptId({}),
      (err) => /手写出题编号/.test(err.message)
    );
  });

  it('refuses the same handwritten prompt id on a second file', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-prompt-id-'));
    const logPath = path.join(dir, 'runs.json');
    const aPath = path.join(dir, 'a.json');
    const bPath = path.join(dir, 'b.json');
    writeFileSync(aPath, '{"n":1}\n');
    writeFileSync(bPath, '{"n":2}\n');
    authorizeHoldoutRun(logPath, 'set/v1', {
      filePath: aPath,
      contentSha256: hashHoldoutFile(aPath),
      authorPromptId: 'hand-42'
    });
    assert.throws(
      () =>
        authorizeHoldoutRun(logPath, 'set/v2', {
          filePath: bPath,
          contentSha256: hashHoldoutFile(bPath),
          authorPromptId: 'hand-42'
        }),
      (err) => /手写出题编号已用过/.test(err.message)
    );
    rmSync(dir, { recursive: true, force: true });
  });

  it('refuses sample ingest of a voided-file sentence without echoing it', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-voided-utt-'));
    const sealed = path.join(dir, 'sealed.json');
    const secret = 'VOIDED_HOLDOUT_SENTENCE_DO_NOT_COPY';
    writeFileSync(
      sealed,
      `${JSON.stringify({ items: [{ id: 'x', text: secret }] })}\n`
    );
    const hashes = collectVoidedUtteranceHashes([sealed]);
    assert.throws(
      () => assertSampleNotFromVoidedHoldouts(`  ${secret}  `, hashes),
      (err) => /已作废封存/.test(err.message)
    );
    assert.doesNotThrow(() =>
      assertSampleNotFromVoidedHoldouts('fresh sample not in voided file', hashes)
    );
    rmSync(dir, { recursive: true, force: true });
  });
});
