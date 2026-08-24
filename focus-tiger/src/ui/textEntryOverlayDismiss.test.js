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

function readUi(name) {
  return readFileSync(join(here, name), 'utf8');
}

test('Stay in touch has Cancel and does not close on outside pointer', () => {
  const src = readUi('NewsletterCaptureUI.js');
  assert.match(src, /newsletter-capture-cancel/);
  assert.match(src, /NEWSLETTER_CANCEL/);
  assert.doesNotMatch(src, /_onDocPointer/);
});

test('Confide has Cancel on the left of Share / Close', () => {
  const src = readUi('ConfideToYinUI.js');
  assert.match(src, /confide-to-yin-cancel/);
  assert.match(src, /CONFIDE_PANEL_CANCEL/);
  assert.match(src, /confide-to-yin__actions-end/);
  assert.match(src, /shouldSubmitConfideOnEnter/);
});

test('Tip jar and Sanctuary (always-visible email) do not close on outside pointer', () => {
  assert.doesNotMatch(readUi('TipJarUI.js'), /_onDocPointer/);
  assert.doesNotMatch(readUi('SanctuaryUnlockUI.js'), /_onDocPointer/);
});

test('Journey backup draft is kept when the backup panel is open', () => {
  const src = readUi('JourneyLogUI.js');
  assert.match(src, /if \(this\._backupPanelOpen\) return;/);
});

test('Membership restore ignores backdrop and outside dismiss', () => {
  const src = readUi('MembershipUnlockUI.js');
  assert.match(src, /if \(this\._view === 'restore'\) return;/);
});
