/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { probeProductKnowledgeCatalog } from './confideProductKnowledge.js';
import { FOCUS_TIGER_LOCAL_STORAGE_KEYS } from '../localStateKeys.js';
import { readMindflowNebulaEnabled } from '../mindflowNebula/mindflowNebulaStore.js';
import {
  CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY,
  hasCoPracticeResearchConsent
} from '../coPracticeResearchConsent.js';
import {
  LOCAL_BACKUP_NAMED_EXCLUDE_ROWS,
  LOCAL_BACKUP_RESET_ONLY_KEYS,
  PRACTICE_BACKUP_EXPORT_KEYS
} from '../practiceBackup/localBackupStorageRegistry.js';
import { computeKbLiveGapReport } from '../../../scripts/audit-kb-live-gap.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const catalog = JSON.parse(
  readFileSync(join(ROOT, 'src/core/confide/productKnowledgeCatalog.json'), 'utf8')
);
const kbDoc = readFileSync(
  join(ROOT, 'docs/product-knowledge-base.md'),
  'utf8'
);
const draftBlock = kbDoc.slice(
  kbDoc.indexOf('<!-- kb-k3-t84-drafts:begin -->'),
  kbDoc.indexOf('<!-- kb-k3-t84-drafts:end -->')
);
const MINDFLOW_KEY = 'focus-tiger.mindflow-nebula-enabled.v1';

function backupRegistryKnows(key) {
  return (
    PRACTICE_BACKUP_EXPORT_KEYS.includes(key) ||
    LOCAL_BACKUP_RESET_ONLY_KEYS.includes(key) ||
    LOCAL_BACKUP_NAMED_EXCLUDE_ROWS.some((row) => row.key === key)
  );
}

describe('KB help single-source knife 3', () => {
  it('links Sound to 0037 and names the Preferences → Sound panel', () => {
    const row = catalog.entries.find((entry) => entry.id === 'KB-FUNC-0037');
    assert.ok(row);
    assert.match(row.shortAnswerEn, /Preferences → Sound/);
    assert.equal(row.yinMayRetrieve, true);
    const hit = probeProductKnowledgeCatalog('background music');
    assert.equal(hit.id, 'KB-FUNC-0037');
  });

  it('keeps Sit with a question and Presence Field help-only', () => {
    const sit = catalog.entries.find((entry) => entry.id === 'KB-FUNC-0040');
    const field = catalog.entries.find((entry) => entry.id === 'KB-FUNC-0041');
    assert.equal(sit.yinMayRetrieve, false);
    assert.equal(field.yinMayRetrieve, false);
    assert.equal(sit.helpCenterVisible, true);
    assert.equal(field.helpCenterVisible, true);
    for (const text of [
      'Sit with a question',
      '带着问题坐一会儿',
      'Sit with a question inventory',
      'Presence Field',
      '智能场',
      'Presence Field inventory'
    ]) {
      const probe = probeProductKnowledgeCatalog(text);
      assert.notEqual(probe.id, 'KB-FUNC-0040', text);
      assert.notEqual(probe.id, 'KB-FUNC-0041', text);
    }
  });

  it('does not catalog Mindflow or Practice Study before T84', () => {
    const ids = catalog.entries.map((entry) => entry.id);
    assert.equal(ids.includes('KB-FUNC-0042'), false);
    assert.equal(ids.includes('KB-FUNC-0043'), false);
    assert.match(draftBlock, /Mindflow nebula/);
    assert.match(draftBlock, /Practice Study/);
    assert.match(draftBlock, /待审/);
    assert.doesNotMatch(draftBlock, /turns\.jsonl/);
    assert.doesNotMatch(draftBlock, /user utterance/i);
  });

  it('machine-checks Mindflow / Practice Study: default off, backup registry, no Confide originals', () => {
    const empty = { getItem() { return null; } };
    assert.equal(readMindflowNebulaEnabled(empty), false);
    assert.equal(hasCoPracticeResearchConsent(empty), false);
    assert.ok(FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(MINDFLOW_KEY));
    assert.ok(
      FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY)
    );
    assert.ok(backupRegistryKnows(MINDFLOW_KEY));
    assert.ok(backupRegistryKnows(CO_PRACTICE_RESEARCH_CONSENT_STORAGE_KEY));
  });

  it('clears the three named live gaps that this knife ships', () => {
    const report = computeKbLiveGapReport();
    const candidates = report.batch2Candidates.map((row) => row.liveId);
    assert.equal(candidates.includes('kb-live-sound'), false);
    assert.equal(candidates.includes('kb-live-contemplative-inquiry'), false);
    assert.equal(candidates.includes('kb-live-presence-field'), false);
    assert.ok(candidates.includes('kb-live-mindflow-nebula'));
    assert.ok(candidates.includes('kb-live-practice-study'));
  });
});
