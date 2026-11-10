/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const packSrc = readFileSync(path.join(root, 'desktop/scripts/pack.js'), 'utf8');
const verifySrc = readFileSync(
  path.join(root, 'scripts/verify-no-qa-boot-in-dist.js'),
  'utf8'
);
const cloudEnabledSrc = readFileSync(
  path.join(
    root,
    'src/core/practiceBackup/practiceBackupCloudEnabled.js'
  ),
  'utf8'
);
const releaseFlagsDoc = readFileSync(
  path.join(root, 'docs/plan-a-live-ship-release-flags.md'),
  'utf8'
);

test('desktop pack refuses Plan A live-ship QA env on release', () => {
  assert.match(packSrc, /assertPlanALiveShipPackEnvUnset/);
  assert.match(packSrc, /FT_QA_BOOT/);
  assert.match(packSrc, /VITE_FT_PRACTICE_STUDY_MENU/);
  assert.match(packSrc, /build:verify-no-qa-boot/);
});

test('verify-no-qa-boot-in-dist rejects inlined QA + practice-study menu on', () => {
  assert.match(verifySrc, /FORBIDDEN_INLINED/);
  assert.match(verifySrc, /VITE_FT_QA_BOOT/);
  assert.match(verifySrc, /VITE_FT_PRACTICE_STUDY_MENU/);
});

test('cloud practice backup flag stays false in source', () => {
  assert.match(cloudEnabledSrc, /export let practiceBackupCloudEnabled = false/);
});

test('PO release-flag checklist names all three gates', () => {
  assert.match(releaseFlagsDoc, /QA boot/);
  assert.match(releaseFlagsDoc, /Practice Study/);
  assert.match(releaseFlagsDoc, /practiceBackupCloudEnabled/);
});
