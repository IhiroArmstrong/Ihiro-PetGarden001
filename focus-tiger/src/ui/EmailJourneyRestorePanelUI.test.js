/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'EmailJourneyRestorePanelUI.js'), 'utf8');

test('email restore panel uses glass + dock z + press feedback', () => {
  assert.match(src, /id = 'email-journey-restore-panel'/);
  assert.match(src, /Z\.DOCK/);
  assert.match(src, /GLASS_FILL/);
  assert.match(src, /:active:not\(:disabled\)/);
});

test('email restore panel maps 410 and never silent-returns on send', () => {
  assert.match(src, /emailJourneyStatusKeyForError/);
  assert.match(src, /EMAIL_JOURNEY_STATUS_UNAVAILABLE/);
  assert.match(src, /isEmailJourneyAddressValid/);
});

test('Journey corner is not the D3 entry', () => {
  assert.doesNotMatch(src, /journey-log-backup/);
});
