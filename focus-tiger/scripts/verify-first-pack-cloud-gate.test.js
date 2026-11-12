/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateSourceCloudGate,
  findForbiddenCloudGateInlines,
  SOURCE_OFF_LINE
} from './verify-first-pack-cloud-gate.js';

test('source default false passes', () => {
  assert.equal(evaluateSourceCloudGate(`${SOURCE_OFF_LINE}\n`).ok, true);
});

test('source default true fails (would pack a live email restore)', () => {
  const result = evaluateSourceCloudGate(
    'export let practiceBackupCloudEnabled = true;\n'
  );
  assert.equal(result.ok, false);
});

test('minified dist with gate ON fails', () => {
  const hits = findForbiddenCloudGateInlines([
    {
      file: 'dist/assets/app.js',
      text: 'let practiceBackupCloudEnabled=!0,foo=1'
    }
  ]);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].token, 'practiceBackupCloudEnabled=!0');
});

test('clean dist with gate off has no forbidden inline', () => {
  const hits = findForbiddenCloudGateInlines([
    {
      file: 'dist/assets/app.js',
      text: 'let practiceBackupCloudEnabled=!1,foo=1'
    }
  ]);
  assert.equal(hits.length, 0);
});
