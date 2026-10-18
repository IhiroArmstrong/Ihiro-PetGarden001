/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIDE_ROUTING_HOLDOUT_BRIEF_VERSION,
  CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT,
  CONFIDE_ROUTING_HOLDOUT_UNSEALED,
  formatRoutingHoldoutSummaryStdout,
  formatRoutingHoldoutValidateStdout,
  parseRoutingHoldoutFile,
  resolveSealedBExpectedPath,
  routingClassMeetsPassCriteria,
  scoreRoutingHoldoutRow,
  stripRoutingHoldoutItem,
  summarizeRoutingHoldoutScores,
  validateRoutingHoldoutCounts
} from './confideRoutingClassHoldoutLab.js';

const WORKSPACE = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const SECRET = 'SYNTHETIC_ROUTING_UTTERANCE_DO_NOT_ECHO';
const CLI = path.join(WORKSPACE, 'desktop/scripts/l0-kb-routing-class-holdout-lab.js');

function syntheticEnvelope(items) {
  return {
    brief_version: CONFIDE_ROUTING_HOLDOUT_BRIEF_VERSION,
    holdout_set_version: 'synthetic-routing/v0',
    items
  };
}

describe('confide routing-class holdout lab', () => {
  it('parses aliases without keeping utterance text', () => {
    const parsed = parseRoutingHoldoutFile(
      syntheticEnvelope([
        {
          class_id: 'mixed-mood-product',
          text: SECRET,
          id: 's1'
        }
      ])
    );
    const stripped = stripRoutingHoldoutItem(parsed.items[0]);
    assert.equal(stripped.classId, 'mixed');
    assert.equal(stripped.expectedPath, 'product');
    assert.equal(JSON.stringify(stripped).includes(SECRET), false);
  });

  it('validate-only reports class counts and never echoes text', () => {
    const report = validateRoutingHoldoutCounts(
      syntheticEnvelope([
        { id: 'a', class: 'mixed', text: SECRET },
        { id: 'b', class_id: 'product-outranks-mood', text: 'ok-unique-b' },
        { id: 'c', class: 'mixed-emotion-dominant', text: 'ok-unique-c' }
      ])
    );
    assert.equal(report.ok, true);
    assert.equal(report.by_class.mixed, 1);
    assert.equal(report.by_class['product-over-emotion'], 1);
    assert.equal(report.by_class['mixed-emotion-dominant'], 1);
    const out = formatRoutingHoldoutValidateStdout(report);
    assert.match(out, /validate_only=yes run_count_incremented=no/);
    assert.match(out, /mixed n=1/);
    assert.equal(out.includes(SECRET), false);
  });

  it('validate rejects padded duplicate utterances on new holdout sets', () => {
    const padded = 'synthetic padded utterance for dup gate';
    const report = validateRoutingHoldoutCounts(
      syntheticEnvelope([
        { id: 'mixed-v6-1', class: 'mixed', text: padded },
        { id: 'mixed-v6-2', class: 'mixed', text: padded },
        { id: 'b', class: 'product-over-emotion', text: 'other unique line b' },
        { id: 'c', class: 'mixed-emotion-dominant', text: 'other unique line c' }
      ])
    );
    assert.equal(report.utterance_dup_report_only, false);
    assert.equal(report.utterance_dup_ok, false);
    assert.equal(report.ok, false);
    const out = formatRoutingHoldoutValidateStdout(report);
    assert.match(out, /utterance_dup_ok=no/);
    assert.match(out, /dup_clusters=1/);
    assert.equal(out.includes(padded), false);
  });

  it('voided zh holdout sets only report utterance dup counts', () => {
    const padded = 'voided set padded line';
    const report = validateRoutingHoldoutCounts({
      brief_version: CONFIDE_ROUTING_HOLDOUT_BRIEF_VERSION,
      holdout_set_version: 'confide-routing-blind-zh/b-v6',
      items: [
        { id: 'a-1', class: 'mixed', text: padded },
        { id: 'a-2', class: 'mixed', text: padded },
        { id: 'b', class: 'product-over-emotion', text: 'unique b' },
        { id: 'c', class: 'mixed-emotion-dominant', text: 'unique c' }
      ]
    });
    assert.equal(report.utterance_dup_report_only, true);
    assert.equal(report.utterance_dup_ok, false);
    assert.equal(report.ok, true);
    assert.equal(report.utterance_dup_by_class.mixed.duplicate_clusters, 1);
  });

  it('resolveSealedBExpectedPath maps expect without utterance text', () => {
    assert.equal(resolveSealedBExpectedPath('life-emotion', 'emotion'), 'mood');
    assert.equal(resolveSealedBExpectedPath('product-short-answer', 'product_short_answer'), 'product');
    assert.equal(resolveSealedBExpectedPath('badge-yin-coin', 'product_honest_empty'), 'product');
    assert.equal(resolveSealedBExpectedPath('mixed', 'product_short_answer'), 'product');
  });

  it('routingClassMeetsPassCriteria uses 85% and sample size', () => {
    assert.equal(
      routingClassMeetsPassCriteria({
        n: 60,
        n_pass: 51,
        pass_rate: 51 / 60,
        sample_insufficient: false
      }),
      true
    );
    assert.equal(
      routingClassMeetsPassCriteria({
        n: 18,
        n_pass: 16,
        pass_rate: 16 / 18,
        sample_insufficient: true
      }),
      false
    );
  });

  it('scores mixed as product-path and dominant-mood as not product-path', () => {
    const scored = [
      scoreRoutingHoldoutRow({
        classId: 'mixed',
        expectedPath: 'product',
        productPath: true
      }),
      scoreRoutingHoldoutRow({
        classId: 'mixed-emotion-dominant',
        expectedPath: 'mood',
        productPath: false
      }),
      scoreRoutingHoldoutRow({
        classId: 'product-over-emotion',
        expectedPath: 'product',
        productPath: false
      })
    ];
    const summary = summarizeRoutingHoldoutScores(scored);
    assert.equal(summary.by_class.mixed.n_pass, 1);
    assert.equal(summary.by_class['mixed-emotion-dominant'].n_pass, 1);
    assert.equal(summary.by_class['product-over-emotion'].n_pass, 0);
    const out = formatRoutingHoldoutSummaryStdout(summary);
    assert.match(out, /mixed n=1/);
    assert.match(out, new RegExp(CONFIDE_ROUTING_HOLDOUT_SAMPLE_INSUFFICIENT));
    assert.equal(out.includes(SECRET), false);
  });

  it('CLI --validate-only on a synthetic file outside the workspace does not increment quota', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'ft-routing-holdout-'));
    const file = path.join(dir, 'synthetic.json');
    const logPath = path.join(dir, 'runs.json');
    writeFileSync(
      file,
      `${JSON.stringify(
        syntheticEnvelope([
          { id: 'a', class: 'mixed', text: 'synthetic mixed ask about reminder' },
          { id: 'b', class: 'product-over-emotion', text: 'synthetic product outranks' },
          { id: 'c', class: 'mixed-emotion-dominant', text: 'synthetic mood still leads' }
        ])
      )}\n`
    );
    const ran = spawnSync(process.execPath, [CLI, '--validate-only'], {
      env: {
        ...process.env,
        FT_CONFIDE_ROUTING_HOLDOUT_PATH: file,
        FT_CONFIDE_ROUTING_HOLDOUT_RUN_LOG: logPath
      },
      encoding: 'utf8'
    });
    assert.equal(ran.status, 0, ran.stderr);
    assert.match(ran.stdout, /validate_only=yes run_count_incremented=no/);
    assert.match(ran.stdout, /mixed n=1/);
    assert.equal(ran.stdout.includes('synthetic mixed ask'), false);
    rmSync(dir, { recursive: true, force: true });
  });

  it('CLI refuses an in-workspace path as 必须在工作区外', () => {
    const ran = spawnSync(process.execPath, [CLI, '--validate-only'], {
      env: {
        ...process.env,
        FT_CONFIDE_ROUTING_HOLDOUT_PATH: path.join(
          WORKSPACE,
          'fixtures',
          'confide-mood-veto-devset-zh-v1.json'
        )
      },
      encoding: 'utf8'
    });
    assert.notEqual(ran.status, 0);
    assert.match(ran.stderr, /工作区外/);
  });

  it('CLI missing path is 未封存', () => {
    const ran = spawnSync(process.execPath, [CLI, '--validate-only'], {
      env: { ...process.env, FT_CONFIDE_ROUTING_HOLDOUT_PATH: '' },
      encoding: 'utf8'
    });
    assert.notEqual(ran.status, 0);
    assert.match(ran.stderr, new RegExp(CONFIDE_ROUTING_HOLDOUT_UNSEALED));
  });
});
