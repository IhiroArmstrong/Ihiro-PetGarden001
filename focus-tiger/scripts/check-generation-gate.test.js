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
  collectReleaseNoGenerateErrors,
  parseGenerationSurfaces,
  runGenerationGateReport
} from './check-generation-gate.js';

const here = dirname(fileURLToPath(import.meta.url));
const doc = readFileSync(join(here, '../docs/GENERATION_SURFACES.md'), 'utf8');

test('inventory table names the production prompt and says cloud was checked', () => {
  const rows = parseGenerationSurfaces(doc);
  assert.ok(rows.length >= 8);
  assert.ok(rows.some((row) => row.anchor === 'desktop/companion/l1Hold.js:113'));
  assert.match(doc, /已查、无/);
  assert.match(doc, /turns\.jsonl/);
});

test('report mode matches the tree and does not require a failing exit', () => {
  const report = runGenerationGateReport({ check: false });
  assert.equal(report.exitCode, 0);
  assert.equal(report.drift, 0);
  assert.equal(report.scanned.cloudHits.length, 0);
  assert.ok(report.scanned.promptSites.includes('desktop/companion/l1Hold.js:113'));
  assert.match(report.lines.join('\n'), /cloud-llm-result=已查、无/);
  assert.match(report.lines.join('\n'), /product-generate=guardedGenerate/);
  assert.match(report.lines.join('\n'), /release-no-generate=ok/);
});

test('check mode stays green when product generate is wired', () => {
  const report = runGenerationGateReport({
    check: true,
    root: join(here, '../'),
    docText: doc
  });
  assert.equal(report.exitCode, 0);
});

test('G1: confide visible generate rows are not release-reachable', () => {
  const rows = parseGenerationSurfaces(doc);
  for (const id of ['confide-observe-l3', 'confide-chat-l3', 'confide-observe-retry']) {
    const row = rows.find((item) => item.pathId === id);
    assert.ok(row, id);
    assert.equal(row.visible, 'yes');
    assert.equal(row.releaseReach, 'no');
  }
  const errors = collectReleaseNoGenerateErrors({
    rows,
    root: join(here, '../')
  });
  assert.deepEqual(errors, []);
});

test('G1 fails when a confide row claims releaseReach yes', () => {
  const broken = doc.replace(
    '| confide-observe-l3 |',
    '| confide-observe-l3 |'
  ).replace(
    '| none-until-pr3 | yes | no | desktop/companion/l1Hold.js:113 |',
    '| none-until-pr3 | yes | yes | desktop/companion/l1Hold.js:113 |'
  );
  const rows = parseGenerationSurfaces(broken);
  const errors = collectReleaseNoGenerateErrors({
    rows,
    root: join(here, '../')
  });
  assert.ok(errors.some((err) => /confide-observe-l3 releaseReach must be no/.test(err)));
});
