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
const ritualSrc = readFileSync(join(here, '../ui/RitualFlowUI.js'), 'utf8');
const mainSrc = readFileSync(join(here, '../main.js'), 'utf8');

test('RitualFlowUI exposes breath elapsed helpers for FocusHUD live view', () => {
  assert.match(ritualSrc, /isBreathing\(\)/);
  assert.match(ritualSrc, /getElapsedSeconds\(\)/);
  assert.match(ritualSrc, /getProgress\(\)/);
});

test('main animate loop treats ritual breath like micro-ritual for HUD timer', () => {
  assert.match(mainSrc, /ritualBreathing/);
  assert.match(mainSrc, /overlayBreathing/);
  assert.match(mainSrc, /ritualFlowUI\.getElapsedSeconds/);
  assert.match(mainSrc, /treatAsFocusing: overlayBreathing/);
});

test('locale greeting ignores language panel in overlayBusy snapshot', () => {
  assert.match(mainSrc, /overlayBusyForLocaleGreeting/);
  assert.match(mainSrc, /languageOpen: false/);
});
