/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'LocalPracticeDataUI.js'), 'utf8');

test('export and import use independent collapsible sub-cards', () => {
  assert.match(src, /local-practice-data-export-card/);
  assert.match(src, /local-practice-data-import-card/);
  assert.match(src, /local-practice-data-export-head/);
  assert.match(src, /local-practice-data-import-head/);
  assert.match(src, /local-practice-data-export-body/);
  assert.match(src, /local-practice-data-import-body/);
  assert.match(src, /_toggleImportCard/);
  assert.match(src, /_showExportStatus/);
  assert.doesNotMatch(src, /local-practice-data-panel/);
});

test('overwrite preview has title, lead, gain info, and savedAt table row', () => {
  assert.match(src, /LOCAL_DATA_IMPORT_OVERWRITE_TITLE/);
  assert.match(src, /LOCAL_DATA_IMPORT_OVERWRITE_LEAD/);
  assert.match(src, /importHasDataGain/);
  assert.match(src, /LOCAL_DATA_IMPORT_GAIN_INFO/);
  assert.match(src, /LOCAL_DATA_IMPORT_COL_SAVED_AT/);
  assert.match(src, /formatPracticeImportSavedAt/);
});
