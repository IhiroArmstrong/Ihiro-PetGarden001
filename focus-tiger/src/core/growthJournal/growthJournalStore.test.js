/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { isPracticeBackupExportKey } from '../practiceBackup/localBackupStorageRegistry.js';
import {
  GROWTH_JOURNAL_CONSENT_KEY,
  GROWTH_JOURNAL_MAY_ENTER_GENERATION,
  GROWTH_JOURNAL_STORAGE_KEY,
  appendGrowthJournalEntry,
  clearGrowthJournalEntries,
  considerGrowthJournalAfterSend,
  readGrowthJournalConsent,
  readGrowthJournalState,
  shouldWriteGrowthJournal,
  writeGrowthJournalConsent
} from './growthJournalStore.js';

function memoryStorage() {
  /** @type {Record<string, string>} */
  const data = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
    removeItem(key) {
      delete data[key];
    }
  };
}

describe('T106 growth journal', () => {
  it('does not write without Keep, and never writes crisis', () => {
    const storage = memoryStorage();
    assert.equal(shouldWriteGrowthJournal({ consented: false, crisis: false }), false);
    assert.equal(shouldWriteGrowthJournal({ consented: true, crisis: true }), false);
    assert.equal(shouldWriteGrowthJournal({ consented: true, crisis: false }), true);

    const first = considerGrowthJournalAfterSend({
      storage,
      text: 'a quiet thought',
      route: CONFIDE_ROUTE.FALLBACK
    });
    assert.equal(first.action, 'ask');
    assert.equal(readGrowthJournalState(storage).entries.length, 0);

    const crisis = considerGrowthJournalAfterSend({
      storage,
      text: 'I want to disappear',
      route: CONFIDE_ROUTE.SAFETY_REDIRECT
    });
    assert.equal(crisis.action, 'skip');
    assert.equal(crisis.reason, 'crisis');
    assert.equal(readGrowthJournalState(storage).entries.length, 0);
  });

  it('writes only after granted consent and skips after decline', () => {
    const storage = memoryStorage();
    writeGrowthJournalConsent(storage, 'granted', '2026-11-26T00:00:00.000Z');
    const written = considerGrowthJournalAfterSend({
      storage,
      text: '  keep this line  ',
      route: 'share',
      now: '2026-11-26T01:00:00.000Z'
    });
    assert.equal(written.action, 'written');
    const rows = readGrowthJournalState(storage).entries;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].text, 'keep this line');
    assert.equal(rows[0].source, 'confide');

    const other = memoryStorage();
    writeGrowthJournalConsent(other, 'declined', '2026-11-26T00:00:00.000Z');
    const skipped = considerGrowthJournalAfterSend({
      storage: other,
      text: 'keep this line',
      route: 'share'
    });
    assert.equal(skipped.action, 'skip');
    assert.equal(skipped.reason, 'declined');
    assert.equal(readGrowthJournalState(other).entries.length, 0);
  });

  it('clear deletes entries; keys stay off practice backup export', () => {
    const storage = memoryStorage();
    writeGrowthJournalConsent(storage, 'granted', '2026-11-26T00:00:00.000Z');
    appendGrowthJournalEntry(storage, {
      text: 'one',
      at: '2026-11-26T01:00:00.000Z'
    });
    assert.equal(readGrowthJournalState(storage).entries.length, 1);
    clearGrowthJournalEntries(storage);
    assert.equal(readGrowthJournalState(storage).entries.length, 0);
    assert.equal(readGrowthJournalConsent(storage).status, 'granted');
    assert.equal(isPracticeBackupExportKey(GROWTH_JOURNAL_STORAGE_KEY), false);
    assert.equal(isPracticeBackupExportKey(GROWTH_JOURNAL_CONSENT_KEY), false);
    assert.equal(GROWTH_JOURNAL_MAY_ENTER_GENERATION, false);
  });

  it('generation and backup consumers must not import the journal store', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const core = join(here, '..');
    const files = [
      join(core, 'confide/confideReplyFlow.js'),
      join(core, 'confide/noticingOneLineGenerateGate.js'),
      join(core, 'confide/confideReadHybrid.js'),
      join(core, 'practiceBackup/practiceBackupSnapshot.js')
    ];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      assert.equal(
        src.includes('growthJournalStore'),
        false,
        `${file} must not import growth journal`
      );
    }
    const ui = readFileSync(join(here, '../../ui/ConfideToYinUI.js'), 'utf8');
    assert.match(ui, /considerGrowthJournalAfterSend/);
    assert.match(ui, /confide-growth-journal-keep/);
  });
});
