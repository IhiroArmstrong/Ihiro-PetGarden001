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
  formatHoldoutValidateStdout,
  holdoutSafeError,
  parseHoldoutFile,
  readHoldoutRunCount,
  redactHoldoutError,
  resolveHoldoutFilePath,
  scoreHoldoutRow,
  stripHoldoutItem,
  summarizeHoldoutScores,
  validateHoldoutCounts
} from './confideMoodVetoHoldoutLab.js';

const SET_V1 = 'confide-routing-blind-zh/v1';

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

  it('caps the same holdout set version at two runs, before a third read', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-runs-'));
    const logPath = path.join(dir, 'runs.json');
    assert.equal(authorizeHoldoutRun(logPath, SET_V1), 1);
    assert.equal(authorizeHoldoutRun(logPath, SET_V1), 2);
    assert.throws(
      () => authorizeHoldoutRun(logPath, SET_V1),
      (err) => /同一盲测集版本最多跑 2 次/.test(err.message)
    );
    rmSync(dir, { recursive: true, force: true });
  });

  it('does not reset the cap when Brief version changes but the set does not', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-runs-'));
    const logPath = path.join(dir, 'runs.json');
    authorizeHoldoutRun(logPath, SET_V1);
    authorizeHoldoutRun(logPath, SET_V1);
    assert.equal(readHoldoutRunCount(logPath, SET_V1), 2);
    assert.throws(
      () => authorizeHoldoutRun(logPath, SET_V1),
      (err) => /同一盲测集版本最多跑 2 次/.test(err.message)
    );
    assert.equal(authorizeHoldoutRun(logPath, 'confide-routing-blind-zh/v2'), 1);
    rmSync(dir, { recursive: true, force: true });
  });

  it('validate-only counts grey-untagged and does not increment the run log', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-runs-'));
    const logPath = path.join(dir, 'runs.json');
    const parsed = parseHoldoutFile({
      brief_version: CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION,
      holdout_set_version: SET_V1,
      items: [
        {
          id: 'grey-1',
          class_id: 'escape-urge',
          dim: '仅报告',
          text: SECRET
        }
      ]
    });
    const report = validateHoldoutCounts(parsed);
    assert.equal(report.ok, false);
    assert.equal(report.grey_untagged, 1);
    assert.equal(report.grey_intent, 1);
    assert.equal(readHoldoutRunCount(logPath, SET_V1), 0);
    const out = formatHoldoutValidateStdout(report);
    assert.match(out, /validate_only=yes/);
    assert.match(out, /run_count_incremented=no/);
    assert.equal(out.includes(SECRET), false);
    const tagged = parseHoldoutFile({
      brief_version: CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION,
      holdout_set_version: SET_V1,
      items: [
        {
          id: 'grey-2',
          class_id: 'escape-urge',
          dim: '仅报告',
          tags: ['crisis-edge-grey'],
          text: SECRET
        }
      ]
    });
    assert.equal(validateHoldoutCounts(tagged).ok, true);
    assert.equal(validateHoldoutCounts(tagged).grey_untagged, 0);
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
      holdout_set_version: SET_V1,
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
