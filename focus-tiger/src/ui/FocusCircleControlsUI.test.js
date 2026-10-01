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
const src = readFileSync(join(here, 'FocusCircleControlsUI.js'), 'utf8');

test('same-membership refresh does not wipe copy/create status', () => {
  assert.match(src, /wasInCircle !== inCircle/);
  assert.match(src, /PRIVACY_SHEET_FOCUS_CIRCLE_COPIED/);
  assert.doesNotMatch(
    src,
    /this\._setStatus\('', false\);\s*this\._syncStatusPolling\(\)/
  );
});

test('create and join map timeout to a recoverable error key', () => {
  assert.match(src, /PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_TIMEOUT/);
  assert.match(src, /result\.reason === 'timeout'/);
});

test('leave maps timeout to fail copy and reads result.ok', () => {
  assert.match(src, /async _handleLeave\(\)/);
  assert.match(src, /result\.ok/);
  assert.match(src, /PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_TIMEOUT/);
  assert.match(src, /PRIVACY_SHEET_FOCUS_CIRCLE_LEFT/);
});
