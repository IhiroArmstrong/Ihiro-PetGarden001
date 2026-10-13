/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HOLDOUT_UNSEALED,
  HoldoutUnsealedError,
  HoldoutRunLimitError,
  resolveSealedHoldoutPath,
  authorizeHoldoutRun,
  scoreHoldoutRow,
  summarizeHoldoutCounts,
  formatHoldoutSummaryLines
} from './confideHoldoutSeal.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

const SENTINEL = 'SENTINEL_HOLD_OUT_NEVER_PRINT_ME';

describe('resolveSealedHoldoutPath', () => {
  const workspaceRoot = path.join(os.tmpdir(), 'ft-holdout-ws-root');
  const homeDir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-home-'));
  const privateDir = path.join(homeDir, 'Documents', 'ft-private', 'confide-mood-blind-zh');
  const sealedFile = path.join(privateDir, 'holdout.json');

  it('reports 未封存 when the path is missing', () => {
    assert.throws(
      () => resolveSealedHoldoutPath({ rawPath: '', workspaceRoot, homeDir }),
      (err) => err instanceof HoldoutUnsealedError && err.message === HOLDOUT_UNSEALED
    );
  });

  it('refuses .secrets, the git worktree, and the in-repo devset', () => {
    mkdirSync(privateDir, { recursive: true });
    writeFileSync(sealedFile, '{}\n');
    const secrets = path.join(workspaceRoot, 'focus-tiger', '.secrets', 'confide-blind-holdout', 'x.json');
    const devset = path.join(workspaceRoot, 'focus-tiger', 'fixtures', 'confide-mood-veto-devset-zh-v1.json');
    mkdirSync(path.dirname(secrets), { recursive: true });
    mkdirSync(path.dirname(devset), { recursive: true });
    writeFileSync(secrets, '{}\n');
    writeFileSync(devset, '{}\n');
    for (const rawPath of [secrets, devset, path.join(workspaceRoot, 'holdout.json')]) {
      assert.throws(
        () => resolveSealedHoldoutPath({ rawPath, workspaceRoot, homeDir }),
        HoldoutUnsealedError
      );
    }
  });

  it('accepts a file under ~/Documents/ft-private', () => {
    mkdirSync(privateDir, { recursive: true });
    writeFileSync(sealedFile, '{}\n');
    assert.equal(
      resolveSealedHoldoutPath({ rawPath: sealedFile, workspaceRoot, homeDir }),
      path.resolve(sealedFile)
    );
  });
});

describe('authorizeHoldoutRun', () => {
  it('allows two runs per brief version and refuses the third', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-holdout-stamp-'));
    const stampPath = path.join(dir, 'runs.json');
    assert.equal(authorizeHoldoutRun(stampPath, 'brief-v1'), 1);
    assert.equal(authorizeHoldoutRun(stampPath, 'brief-v1'), 2);
    assert.throws(() => authorizeHoldoutRun(stampPath, 'brief-v1'), HoldoutRunLimitError);
    assert.equal(authorizeHoldoutRun(stampPath, 'brief-v2'), 1);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('holdout summary (no sentences)', () => {
  it('counts safety first, veto, false positives, grey, and sample gaps', () => {
    const scored = [
      scoreHoldoutRow({
        classId: 'escape-urge',
        expect: 'safety',
        safetyRoute: CONFIDE_ROUTE.SAFETY_REDIRECT,
        withVeto: 'skip'
      }),
      scoreHoldoutRow({
        classId: 'escape-urge',
        expect: 'safety',
        safetyRoute: CONFIDE_ROUTE.FALLBACK,
        withVeto: 'skip'
      }),
      scoreHoldoutRow({
        classId: 'practice-aversion',
        role: 'positive',
        tags: ['interrogative-positive'],
        safetyRoute: CONFIDE_ROUTE.FALLBACK,
        withVeto: 'skip'
      }),
      scoreHoldoutRow({
        classId: 'practice-aversion',
        role: 'counter',
        safetyRoute: CONFIDE_ROUTE.FALLBACK,
        withVeto: 'skip'
      }),
      scoreHoldoutRow({
        classId: 'escape-urge',
        expect: 'grey',
        safetyRoute: CONFIDE_ROUTE.FALLBACK,
        withVeto: 'honesty'
      })
    ];
    const summary = summarizeHoldoutCounts(scored);
    assert.equal(summary.safety_handled, 1);
    assert.equal(summary.safety_leak_to_gate, 1);
    assert.equal(summary.veto_would_skip, 1);
    assert.equal(summary.veto_false_positive, 1);
    assert.equal(summary.crisis_edge_grey_report_only, 1);
    assert.equal(summary.interrogative_positive_pass_rate, 1);
    assert.ok(summary.sample_insufficient.some((s) => s.startsWith('practice-aversion.positive')));
    const printed = formatHoldoutSummaryLines({ ...summary, briefVersion: 't', run: 1 });
    assert.equal(printed.includes(SENTINEL), false);
    assert.match(printed, /interrogative_positive_pass_rate=/);
    assert.match(printed, /sample_insufficient:/);
  });
});

describe('holdout CLI seal gate', () => {
  it('prints 未封存 and does not fall back to the devset when the path is unset', () => {
    const script = fileURLToPath(new URL('../../../desktop/scripts/l0-kb-mood-veto-holdout.js', import.meta.url));
    const result = spawnSync(process.execPath, [script], {
      env: { ...process.env, FT_CONFIDE_BLIND_HOLDOUT_PATH: '' },
      encoding: 'utf8'
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /未封存/);
    assert.equal(result.stdout.includes('SENTINEL'), false);
    assert.equal(result.stderr.includes('confide-mood-veto-devset'), false);
  });
});
