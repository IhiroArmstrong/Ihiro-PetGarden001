/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Without classification, new reset keys could ship with a green backup audit.
 * This file would fail on develop before LOCAL_BACKUP_EXCLUDE_ROWS covered
 * every reset key (six T81/T83 keys plus the remaining reset-only set).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from '../src/core/localStateKeys.js';
import {
  PRACTICE_BACKUP_EXPORT_KEYS,
  LOCAL_BACKUP_EXCLUDE_ROWS,
  LOCAL_BACKUP_NAMED_EXCLUDE_ROWS,
  listUnclassifiedResetKeys,
  listUnclassifiedNewResetKeys
} from '../src/core/practiceBackup/localBackupStorageRegistry.js';
import {
  extractFrozenStringKeys,
  runLocalBackupCoverageAudit
} from './audit-local-backup-coverage.js';

const T81_T83_KEYS = [
  'focus-tiger.co-practice-research-week-ledger.v1',
  'focus-tiger.co-practice-research-consent.v1',
  'focus-tiger.co-practice-research-last-post.v1',
  'focus-tiger.co-practice-research-weekly-schedule.v1',
  'focus-tiger.co-practice-research-first-sit-prompt.v1',
  'focus-tiger.dev-co-practice-research-consent-fixture.v1'
];

describe('audit:local-backup-coverage classification', () => {
  it('fails when T81/T83 keys are on reset but missing from exclude (pre-fix shape)', () => {
    const excludeWithoutSix = LOCAL_BACKUP_EXCLUDE_ROWS.filter(
      (row) => !T81_T83_KEYS.includes(row.key)
    );
    const unclassified = listUnclassifiedResetKeys(
      FOCUS_TIGER_LOCAL_STORAGE_KEYS,
      PRACTICE_BACKUP_EXPORT_KEYS,
      excludeWithoutSix
    );
    for (const key of T81_T83_KEYS) {
      assert.ok(
        unclassified.includes(key),
        `expected ${key} unclassified without named exclude row`
      );
    }
  });

  it('current tree classifies every reset key and the six research keys stay off export', () => {
    assert.deepEqual(listUnclassifiedResetKeys(FOCUS_TIGER_LOCAL_STORAGE_KEYS), []);
    const namedKeys = new Set(LOCAL_BACKUP_NAMED_EXCLUDE_ROWS.map((row) => row.key));
    for (const key of T81_T83_KEYS) {
      assert.equal(PRACTICE_BACKUP_EXPORT_KEYS.includes(key), false);
      assert.ok(namedKeys.has(key));
    }
    assert.equal(runLocalBackupCoverageAudit(), true);
  });

  it('new vs develop reset keys fail unless classified in the same list', () => {
    const developKeys = FOCUS_TIGER_LOCAL_STORAGE_KEYS;
    const current = [...FOCUS_TIGER_LOCAL_STORAGE_KEYS, 'focus-tiger.new-unclassified.v1'];
    assert.deepEqual(
      listUnclassifiedNewResetKeys(current, developKeys),
      ['focus-tiger.new-unclassified.v1']
    );
    const classifiedExclude = [
      ...LOCAL_BACKUP_EXCLUDE_ROWS,
      { key: 'focus-tiger.new-unclassified.v1', tier: 'exclude-product' }
    ];
    assert.deepEqual(
      listUnclassifiedNewResetKeys(
        current,
        developKeys,
        PRACTICE_BACKUP_EXPORT_KEYS,
        classifiedExclude
      ),
      []
    );
  });

  it('extractFrozenStringKeys reads FOCUS_TIGER_LOCAL_STORAGE_KEYS from source text', () => {
    const src = `export const FOCUS_TIGER_LOCAL_STORAGE_KEYS = Object.freeze([\n  'focus-tiger.alpha.v1',\n  'focus-tiger.beta.v1'\n]);\n`;
    assert.deepEqual(extractFrozenStringKeys(src, 'FOCUS_TIGER_LOCAL_STORAGE_KEYS'), [
      'focus-tiger.alpha.v1',
      'focus-tiger.beta.v1'
    ]);
  });
});
