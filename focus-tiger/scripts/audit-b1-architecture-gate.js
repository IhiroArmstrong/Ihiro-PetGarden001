#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * B1 architecture «only non-decreasing» gate — import cycles, core→ui, main.js lines.
 *
 *   npm run audit:b1-architecture-gate
 *   npm run audit:b1-architecture-gate -- --write   (PO-approved baseline refresh only)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeB1ArchitectureGateMetrics } from './b1-architecture-gate-scan.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const BASELINE_PATH = join(ROOT, 'docs/audit/b1-architecture-gate-baseline.json');

const METRIC_KEYS = [
  'relativeImportCycleCount',
  'coreToUiCrossImports',
  'mainJsLineCount'
];

/**
 * @param {string} key
 * @param {number} value
 * @param {number} limit
 * @returns {string}
 */
export function formatB1MetricExceedsError(key, value, limit) {
  if (key === 'mainJsLineCount') {
    return (
      `[audit:b1-architecture-gate] main.js is ${value} lines (cap ${limit}). ` +
      'Extract new logic to src/core/ or src/ui/ — do not grow the entry file. ' +
      'Raising the cap needs a dedicated baseline PR and PO approval ' +
      '(CODEOWNERS: focus-tiger/docs/audit/b1-architecture-gate-baseline.json). ' +
      'Do not run --write on a feature PR.'
    );
  }
  return (
    `[audit:b1-architecture-gate] ${key} ${value} exceeds baseline ${limit} ` +
    '(B1 §7 — fix code or open baseline PR with PO approval; do not --write on a feature PR)'
  );
}

/**
 * @returns {boolean}
 */
export function runB1ArchitectureGateAudit({ write = false } = {}) {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  const current = computeB1ArchitectureGateMetrics(SRC);
  let ok = true;

  if (write) {
    const next = {
      ...baseline,
      lockedDevelopSha: process.env.B1_GATE_BASELINE_SHA || baseline.lockedDevelopSha,
      approvedAt: new Date().toISOString().slice(0, 10),
      approvalNote:
        process.env.B1_GATE_APPROVAL_NOTE ||
        'Manual --write; requires PO + explicit baseline PR (not feature PR self-raise).',
      metrics: {
        relativeImportCycleCount: current.relativeImportCycleCount,
        coreToUiCrossImports: current.coreToUiCrossImports,
        mainJsLineCount: current.mainJsLineCount
      }
    };
    writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
    console.log('[audit:b1-architecture-gate] baseline JSON updated (--write)');
    return true;
  }

  for (const key of METRIC_KEYS) {
    const limit = baseline.metrics[key];
    const value = current[key];
    if (value > limit) {
      console.error(formatB1MetricExceedsError(key, value, limit));
      ok = false;
    }
  }

  if (!ok) return false;

  console.log(
    `[audit:b1-architecture-gate] OK — cycles ${current.relativeImportCycleCount}/${baseline.metrics.relativeImportCycleCount}; ` +
      `core→ui ${current.coreToUiCrossImports}/${baseline.metrics.coreToUiCrossImports}; ` +
      `main.js lines ${current.mainJsLineCount}/${baseline.metrics.mainJsLineCount}`
  );
  return true;
}

const isCli =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isCli) {
  const write = process.argv.includes('--write');
  const ok = runB1ArchitectureGateAudit({ write });
  if (!ok) process.exitCode = 1;
}
