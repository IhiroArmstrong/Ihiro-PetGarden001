import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'JourneyLogUI.js'), 'utf8');

test('Journey Log close and backup controls have :active press (Z 0–1s)', () => {
  assert.match(src, /\.journey-log__btn:active:not\(:disabled\)/);
  assert.match(src, /\.journey-log__backup-link:active/);
  assert.match(src, /cursor: default/);
});

test('enabled backup panel names this list as the record (no second archive)', () => {
  assert.match(src, /journey-log-backup-where/);
  assert.match(src, /practiceBackupWhereText/);
  assert.match(src, /JOURNEY_LOG_BACKUP_STATUS_ENABLED/);
});
