/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION,
  CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT,
  CONFIDE_MOOD_HOLDOUT_UNSEALED,
  authorizeHoldoutRun,
  formatHoldoutSummaryStdout,
  holdoutSafeError,
  parseHoldoutFile,
  redactHoldoutError,
  resolveHoldoutFilePath,
  scoreHoldoutRow,
  stripHoldoutItem,
  summarizeHoldoutScores
} from './confideMoodVetoHoldoutLab.js';

const WORKSPACE = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const SECRET = 'SECRET_HOLDOUT_UTTERANCE_DO_NOT_ECHO';

describe('confide mood-veto holdout lab gates', () => {
  it('refuses a missing path as 未封存', () => {
    assert.throws(
      () => resolveHoldoutFilePath('/tmp/ft-holdout-does-not-exist.json', WORKSPACE),
      (err) => err.message === CONFIDE_MOOD_HOLDOUT_UNSEALED
    );
  });

  it('refuses an unset path as 未封存', () => {
    assert.throws(
      () => resolveHoldoutFilePath('', WORKSPACE),
      (err) => err.message === CONFIDE_MOOD_HOLDOUT_UNSEALED
    );
  });

  it('refuses the in-repo devset path and does not fall back to it', () => {
    const devset = path.join(WORKSPACE, 'fixtures', 'confide-mood-veto-devset-zh-v1.json');
    assert.throws(
      () => resolveHoldoutFilePath(devset, WORKSPACE),
      (err) => /工作区外/.test(err.message)
    );
  });

  it('accepts a file outside the workspace', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-'));
    const file = path.join(dir, 'sealed.json');
    writeFileSync(file, '{"ok":true}\n');
    assert.equal(resolveHoldoutFilePath(file, WORKSPACE), path.resolve(file));
    rmSync(dir, { recursive: true, force: true });
  });

  it('caps the same Brief version at two runs, before a third read', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-runs-'));
    const logPath = path.join(dir, 'runs.json');
    assert.equal(authorizeHoldoutRun(logPath, CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION), 1);
    assert.equal(authorizeHoldoutRun(logPath, CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION), 2);
    assert.throws(
      () => authorizeHoldoutRun(logPath, CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION),
      (err) => /最多跑 2 次/.test(err.message)
    );
    rmSync(dir, { recursive: true, force: true });
  });

  it('redacts unexpected errors so planted utterances never appear', () => {
    const noisy = new Error(`parse failed near ${SECRET}`);
    assert.equal(redactHoldoutError(noisy).includes(SECRET), false);
    assert.equal(redactHoldoutError(holdoutSafeError(CONFIDE_MOOD_HOLDOUT_UNSEALED)).includes(SECRET), false);
  });

  it('parses items without keeping the utterance on the stripped row', () => {
    const parsed = parseHoldoutFile({
      brief_version: CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION,
      items: [{ class_id: 'practice-aversion', role: 'positive', text: SECRET, tags: ['interrogative-positive'] }]
    });
    const stripped = stripHoldoutItem(parsed.items[0]);
    assert.equal(stripped.interrogativePositive, true);
    assert.equal(JSON.stringify(stripped).includes(SECRET), false);
  });

  it('treats safety leaks as blocking other columns', () => {
    const scored = [
      scoreHoldoutRow({
        classId: 'escape-urge',
        role: 'crisis-edge',
        crisisEdge: true,
        safetyRoute: 'fallback',
        gateAction: 'skip',
        reachedGate: true
      }),
      scoreHoldoutRow({
        classId: 'practice-aversion',
        role: 'positive',
        safetyRoute: 'fallback',
        gateAction: 'skip',
        reachedGate: true,
        interrogativePositive: true
      })
    ];
    const summary = summarizeHoldoutScores(scored);
    assert.equal(summary.safety_first_ok, false);
    assert.equal(summary.other_columns_withheld, true);
    assert.equal(summary.columns.safety_leak_to_gate, 1);
    const out = formatHoldoutSummaryStdout(summary);
    assert.match(out, /安全层未达标/);
    assert.equal(out.includes(SECRET), false);
  });

  it('labels 样本不足 when a class is far below ~60', () => {
    const scored = [
      scoreHoldoutRow({
        classId: 'practice-aversion',
        role: 'positive',
        safetyRoute: 'fallback',
        gateAction: 'skip',
        reachedGate: true,
        interrogativePositive: true
      })
    ];
    const summary = summarizeHoldoutScores(scored);
    assert.equal(summary.sample_insufficient_any, true);
    assert.equal(summary.by_class['practice-aversion'].sample_insufficient_label, CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT);
    assert.match(formatHoldoutSummaryStdout(summary), new RegExp(CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT));
  });
});
