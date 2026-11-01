/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  extractSharedResourcesLocalStorageKeys,
  runSharedResourcesResetCoverageAudit
} from './audit-shared-resources-reset-coverage.js';

test('extractSharedResourcesLocalStorageKeys finds table keys', () => {
  const md = '| `focus-tiger.foo.v1` | module | note |\n| `focus-tiger.bar.v1` | m2 | n2 |';
  const keys = extractSharedResourcesLocalStorageKeys(md);
  assert.deepEqual(keys, ['focus-tiger.bar.v1', 'focus-tiger.foo.v1']);
});

test('runSharedResourcesResetCoverageAudit passes on repo SHARED_RESOURCES', () => {
  const result = runSharedResourcesResetCoverageAudit();
  assert.equal(
    result.ok,
    true,
    result.missingCoverage.length
      ? `missing: ${result.missingCoverage.join(', ')}`
      : ''
  );
});
