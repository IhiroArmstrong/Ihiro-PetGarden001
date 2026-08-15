import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPracticeBackupSnapshotTime,
  practiceBackupWhereText
} from './practiceBackupWhereCopy.js';

describe('practiceBackupWhereCopy', () => {
  it('formats a known ISO timestamp', () => {
    const text = formatPracticeBackupSnapshotTime(
      '2026-08-15T11:00:00.000Z',
      'en'
    );
    assert.ok(text.length > 4);
    assert.equal(formatPracticeBackupSnapshotTime('', 'en'), '');
    assert.equal(formatPracticeBackupSnapshotTime('not-a-date', 'en'), '');
  });

  it('uses last-snapshot copy when uploaded, pending copy otherwise', () => {
    const tFn = (key) =>
      key === 'JOURNEY_LOG_BACKUP_WHERE_ON'
        ? 'Last cloud snapshot: {time}.'
        : 'Keeping the first snapshot quietly.';
    assert.equal(
      practiceBackupWhereText({ lastUploadAt: null }, tFn, 'en'),
      'Keeping the first snapshot quietly.'
    );
    const withTime = practiceBackupWhereText(
      { lastUploadAt: '2026-08-15T11:00:00.000Z' },
      tFn,
      'en'
    );
    assert.match(withTime, /Last cloud snapshot:/);
    assert.equal(withTime.includes('{time}'), false);
  });
});
