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

test('desktop pack refuses FT_QA_BOOT / VITE_FT_QA_BOOT on release', () => {
  assert.match(packSrc, /assertReleaseQaBootEnvUnset/);
  assert.match(packSrc, /FT_QA_BOOT/);
  assert.match(packSrc, /build:verify-no-qa-boot/);
});

test('verify-no-qa-boot-in-dist rejects inlined VITE_FT_QA_BOOT on', () => {
  assert.match(verifySrc, /FORBIDDEN_INLINED/);
  assert.match(verifySrc, /VITE_FT_QA_BOOT/);
});

test('desktop pack verifies first-invite cloud backup gate is off', () => {
  assert.match(packSrc, /build:verify-cloud-gate/);
  const cloudVerifySrc = readFileSync(
    path.join(root, 'scripts/verify-first-pack-cloud-gate.js'),
    'utf8'
  );
  assert.match(cloudVerifySrc, /practiceBackupCloudEnabled = false/);
  assert.match(cloudVerifySrc, /practiceBackupCloudEnabled=!0/);
});

test('desktop pack verifies update feed is https on the locked host', () => {
  assert.match(packSrc, /build:verify-update-feed/);
  const feedVerifySrc = readFileSync(
    path.join(root, 'scripts/verify-first-pack-update-feed.js'),
    'utf8'
  );
  assert.match(feedVerifySrc, /CANONICAL_UPDATE_FEED_HOST/);
  assert.match(feedVerifySrc, /evaluateUpdateFeedUrl/);
  assert.match(feedVerifySrc, /PRIVACY_NOTICE\.md must name/);
});
