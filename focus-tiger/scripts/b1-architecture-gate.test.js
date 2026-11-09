/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Without the gate, relative import cycles / core→ui / main.js could grow with no CI signal.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeB1ArchitectureGateMetrics } from './b1-architecture-gate-scan.js';
import { runB1ArchitectureGateAudit } from './audit-b1-architecture-gate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BASELINE_PATH = join(ROOT, 'docs/audit/b1-architecture-gate-baseline.json');

describe('audit:b1-architecture-gate', () => {
  it('current tree matches locked baseline (only-non-decreasing gate)', () => {
    const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
    const current = computeB1ArchitectureGateMetrics(join(ROOT, 'src'));
    assert.equal(
      current.relativeImportCycleCount,
      baseline.metrics.relativeImportCycleCount
    );
    assert.equal(current.coreToUiCrossImports, baseline.metrics.coreToUiCrossImports);
    assert.equal(current.mainJsLineCount, baseline.metrics.mainJsLineCount);
    assert.equal(runB1ArchitectureGateAudit(), true);
  });
});
