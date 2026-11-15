/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseGenerationSurfaces,
  runGenerationGateReport
} from './check-generation-gate.js';

const here = dirname(fileURLToPath(import.meta.url));
const doc = readFileSync(join(here, '../docs/GENERATION_SURFACES.md'), 'utf8');

test('inventory table names the production prompt and says cloud was checked', () => {
  const rows = parseGenerationSurfaces(doc);
  assert.ok(rows.length >= 8);
  assert.ok(rows.some((row) => row.anchor === 'desktop/companion/l1Hold.js:111'));
  assert.match(doc, /已查、无/);
  assert.match(doc, /turns\.jsonl/);
});

test('report mode matches the tree and does not require a failing exit', () => {
  const report = runGenerationGateReport({ check: false });
  assert.equal(report.exitCode, 0);
  assert.equal(report.drift, 0);
  assert.equal(report.scanned.cloudHits.length, 0);
  assert.ok(report.scanned.promptSites.includes('desktop/companion/l1Hold.js:111'));
  assert.match(report.lines.join('\n'), /cloud-llm-result=已查、无/);
});
