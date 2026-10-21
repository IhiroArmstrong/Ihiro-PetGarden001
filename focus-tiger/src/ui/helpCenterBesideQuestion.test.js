/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const hints = readFileSync(join(here, 'OnboardingHintsUI.js'), 'utf8');
const shell = readFileSync(join(here, 'NarrowIdleShell.js'), 'utf8');

test('wide Idle mounts Help Center chrome to the right of ?', () => {
  assert.match(hints, /id = 'onboarding-hint-help-center'/);
  assert.match(hints, /idle-help-center-beside/);
  assert.match(hints, /furnitureRow\.append\(this\.helpBtn, this\.helpCenterBtn\)/);
  assert.match(hints, /onHelpCenterClose\?\.\(\)/);
  assert.match(hints, /onHelpCenterChrome \|\| this\.onHelpCenter/);
  assert.match(hints, /pinHelpChromeAboveOverlay/);
  assert.match(hints, /unpinHelpChromeAboveOverlay/);
});

test('narrow ActionBar mounts Help Center chrome beside ?', () => {
  assert.match(shell, /id="ft-narrow-help-center-btn"/);
  assert.match(shell, /data-proxy="help-center-beside"/);
  assert.match(shell, /onHelpCenterChrome/);
});
