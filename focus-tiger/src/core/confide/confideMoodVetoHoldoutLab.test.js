/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION,
  CONFIDE_MOOD_HOLDOUT_SAMPLE_INSUFFICIENT,
  CONFIDE_MOOD_HOLDOUT_UNSEALED,
  authorizeHoldoutRun,
  canonicalizeHoldoutClassId,
  defaultHoldoutResultDir,
  formatHoldoutSummaryStdout,
  formatHoldoutValidateStdout,
  hashHoldoutFile,
  inventoryHoldoutCounts,
  holdoutSafeError,
  parseHoldoutFile,
  readHoldoutRunCount,
  recordHoldoutRunOutcome,
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

  function writeMeta(dir, name, body) {
    const filePath = path.join(dir, name);
    writeFileSync(filePath, body);
    return { filePath, contentSha256: hashHoldoutFile(filePath) };
  }

  it('caps the same holdout set version at two files, one run each', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-runs-'));
    const logPath = path.join(dir, 'runs.json');
    const a = writeMeta(dir, 'a.json', '{"n":1}\n');
    const b = writeMeta(dir, 'b.json', '{"n":2}\n');
    const c = writeMeta(dir, 'c.json', '{"n":3}\n');
    assert.equal(authorizeHoldoutRun(logPath, SET_V1, a), 1);
    assert.throws(
      () => authorizeHoldoutRun(logPath, SET_V1, a),
      (err) => /同一盲测文件只能跑分一次/.test(err.message)
    );
    const logged = JSON.parse(readFileSync(logPath, 'utf8'));
    const rec = logged.byHoldoutSetVersion[SET_V1].files[a.filePath];
    assert.equal(rec.voided, true);
    assert.equal(rec.void_reason, 'first_run_consumed');
    assert.equal(rec.runs, 1);
    assert.equal(authorizeHoldoutRun(logPath, SET_V1, b), 2);
    assert.throws(
      () => authorizeHoldoutRun(logPath, SET_V1, c),
      (err) => /最多 2 个过关文件/.test(err.message)
    );
    rmSync(dir, { recursive: true, force: true });
  });

  it('refuses the same version when file bytes change', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-runs-'));
    const logPath = path.join(dir, 'runs.json');
    const filePath = path.join(dir, 'sealed.json');
    writeFileSync(filePath, '{"n":1}\n');
    const first = { filePath, contentSha256: hashHoldoutFile(filePath) };
    authorizeHoldoutRun(logPath, SET_V1, first);
    writeFileSync(filePath, '{"n":1,"changed":true}\n');
    const changed = { filePath, contentSha256: hashHoldoutFile(filePath) };
    assert.throws(
      () => authorizeHoldoutRun(logPath, SET_V1, changed),
      (err) => /内容已变/.test(err.message)
    );
    const v2 = writeMeta(dir, 'v2.json', '{"n":2}\n');
    assert.equal(authorizeHoldoutRun(logPath, 'confide-routing-blind-zh/v2', v2), 1);
    rmSync(dir, { recursive: true, force: true });
  });

  it('does not reset the cap when Brief version changes but the set does not', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-runs-'));
    const logPath = path.join(dir, 'runs.json');
    const a = writeMeta(dir, 'a.json', '{"n":1}\n');
    const b = writeMeta(dir, 'b.json', '{"n":2}\n');
    authorizeHoldoutRun(logPath, SET_V1, a);
    authorizeHoldoutRun(logPath, SET_V1, b);
    assert.equal(readHoldoutRunCount(logPath, SET_V1), 2);
    assert.throws(
      () => authorizeHoldoutRun(logPath, SET_V1, writeMeta(dir, 'c.json', '{"n":3}\n')),
      (err) => /最多 2 个过关文件/.test(err.message)
    );
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

  it('maps Brief class ids onto sealed-file ids', () => {
    assert.equal(canonicalizeHoldoutClassId('mixed-mood-product'), 'mixed');
    assert.equal(canonicalizeHoldoutClassId('product-outranks-mood'), 'product-over-emotion');
    assert.equal(canonicalizeHoldoutClassId('mixed-emotion-dominant'), 'mixed-emotion-dominant');
  });

  it('inventories counts without echoing dummy text', () => {
    const bag = inventoryHoldoutCounts([
      { class: 'mixed-mood-product', dim: 'aversion+reminder', expect: 'product_short_answer', text: SECRET },
      { class: 'product-outranks-mood', dim: 'weak+sit', expect: 'product_short_answer', text: SECRET },
      { class: 'mixed-emotion-dominant', dim: 'product-word-aside', expect: 'emotion', text: SECRET },
      { class: 'escape-urge', dim: '仅报告', expect: 'emotion', text: SECRET },
      { class: 'escape-urge', dim: 'crisis-edge', expect: 'safety', text: SECRET },
      { class: 'escape-urge', dim: 'interrogative-positive', expect: 'emotion', text: SECRET }
    ]);
    assert.equal(bag.mixed.n_counter, 1);
    assert.equal(bag['product-over-emotion'].n_counter, 1);
    assert.equal(bag['mixed-emotion-dominant'].n_positive, 1);
    assert.equal(bag['escape-urge'].n_crisis_grey, 1);
    assert.equal(bag['escape-urge'].n_crisis_edge, 1);
    assert.equal(bag['escape-urge'].n_noncrisis_positive, 1);
    assert.equal(bag['escape-urge'].n_interrogative_positive, 1);
    assert.equal(JSON.stringify(bag).includes(SECRET), false);
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

  it('labels 样本不足 when a class is far below the locked 40', () => {
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

  it('records void + safety counts without utterance fields', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-runs-'));
    const logPath = path.join(dir, 'runs.json');
    const a = writeMeta(dir, 'a.json', '{"n":1}\n');
    authorizeHoldoutRun(logPath, SET_V1, a);
    recordHoldoutRunOutcome(logPath, SET_V1, a.filePath, {
      safety_first_ok: false,
      safety_handled: 8,
      safety_leak_to_gate: 13,
      safety_miss: 0
    });
    const rec = JSON.parse(readFileSync(logPath, 'utf8')).byHoldoutSetVersion[SET_V1]
      .files[a.filePath];
    assert.equal(rec.voided, true);
    assert.equal(rec.safety_first_ok, false);
    assert.equal(rec.safety_leak_to_gate, 13);
    assert.equal(JSON.stringify(rec).includes(SECRET), false);
    rmSync(dir, { recursive: true, force: true });
  });

  it('defaults result JSON under Documents/ft-private, not /tmp', () => {
    const prev = process.env.FT_CONFIDE_MOOD_HOLDOUT_RESULT_DIR;
    delete process.env.FT_CONFIDE_MOOD_HOLDOUT_RESULT_DIR;
    const dir = defaultHoldoutResultDir();
    assert.match(dir, /Documents[/\\]ft-private[/\\]confide-mood-holdout-lab$/);
    assert.equal(dir.includes('/tmp/ft-l0-lab'), false);
    if (prev === undefined) delete process.env.FT_CONFIDE_MOOD_HOLDOUT_RESULT_DIR;
    else process.env.FT_CONFIDE_MOOD_HOLDOUT_RESULT_DIR = prev;
  });
});
