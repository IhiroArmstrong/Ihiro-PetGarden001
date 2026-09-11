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
const src = readFileSync(join(here, 'FocusCircleWitnessLeaveUI.js'), 'utf8');
const mainSrc = readFileSync(join(here, '../main.js'), 'utf8');

test('leave picker acquires Tier27 respond slot so idle yin tap cannot steal clicks', () => {
  assert.match(src, /_openLeavePicker\(/);
  assert.match(
    src,
    /_openLeavePicker[\s\S]*?requestRespondSlot/
  );
  assert.match(src, /isPickerOpen\(\)/);
  assert.match(mainSrc, /isPickerOpen\?\.\(\) === true/);
});

test('witness leave UI uses glass panel tokens and body-level z-index above narrow chrome', () => {
  assert.match(src, /glassPanelStyles\.js/);
  assert.match(src, /GLASS_FILL/);
  assert.match(src, /pointer-events: auto/);
  assert.match(src, /z-index: 35/);
  assert.match(mainSrc, /new FocusCircleWitnessLeaveUI\(\s*document\.body/);
});

test('failed witness submit surfaces visible picker error instead of silent return', () => {
  assert.match(src, /FOCUS_CIRCLE_WITNESS_SUBMIT_ERROR/);
  assert.match(src, /focus-circle-witness-picker__status/);
  assert.match(src, /role', 'alert'/);
});

test('leave strip hides while picker is open and restores on cancel', () => {
  assert.match(src, /is-hidden-for-picker/);
  assert.match(src, /restoreLeave: mode === 'leave'/);
});
