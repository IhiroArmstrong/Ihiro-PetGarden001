/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateSourceCloudGate,
  findCloudGateInlines,
  isInvitePackCloudGateOff,
  GATE_OFF_INLINES,
  GATE_ON_INLINES,
  SOURCE_ON_LINE
} from './verify-first-pack-cloud-gate.js';

const helperSrc = `${SOURCE_ON_LINE}\n  return true;\n`;

test('source compile-time helper with true fallback passes', () => {
  assert.equal(evaluateSourceCloudGate(helperSrc).ok, true);
});

test('source default false-only file fails', () => {
  const result = evaluateSourceCloudGate(
    'export let practiceBackupCloudEnabled = false;\n'
  );
  assert.equal(result.ok, false);
});

test('invite pack mode is default; only =1 is open-gate', () => {
  assert.equal(isInvitePackCloudGateOff({}), true);
  assert.equal(isInvitePackCloudGateOff({ VITE_FT_PRACTICE_BACKUP_CLOUD: '0' }), true);
  assert.equal(isInvitePackCloudGateOff({ VITE_FT_PRACTICE_BACKUP_CLOUD: '1' }), false);
});

test('minified dist with gate OFF is required for invite pack', () => {
  const hits = findCloudGateInlines(
    [
      {
        file: 'dist/assets/app.js',
        text: 'let practiceBackupCloudEnabled=!1,foo=1'
      }
    ],
    GATE_OFF_INLINES
  );
  assert.equal(hits.length, 1);
  assert.equal(hits[0].token, 'practiceBackupCloudEnabled=!1');
});

test('open-gate dist must not include OFF inlines', () => {
  const off = findCloudGateInlines(
    [
      {
        file: 'dist/assets/app.js',
        text: 'let practiceBackupCloudEnabled=!0,foo=1'
      }
    ],
    GATE_OFF_INLINES
  );
  const on = findCloudGateInlines(
    [
      {
        file: 'dist/assets/app.js',
        text: 'let practiceBackupCloudEnabled=!0,foo=1'
      }
    ],
    GATE_ON_INLINES
  );
  assert.equal(off.length, 0);
  assert.equal(on.length, 1);
});
