/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DOCS_SYNC_MACHINE_BLOCK_PATHS,
  runDocsSync
} from './docs-sync.js';

describe('docs-sync', () => {
  it('exports machine-block allowlist for pre-commit staging', () => {
    assert.ok(DOCS_SYNC_MACHINE_BLOCK_PATHS.includes('docs/kb-live-gap-audit.md'));
    assert.ok(DOCS_SYNC_MACHINE_BLOCK_PATHS.includes('docs/kb-live-entry-registry.md'));
  });

  it('refreshes all machine blocks without throwing', () => {
    assert.equal(runDocsSync(), true);
  });
});
