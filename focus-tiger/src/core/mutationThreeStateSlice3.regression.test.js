/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  OVERLAY_UI_SUCCESS_TOKENS_FORBIDDEN_IN_FAIL,
  OVERLAY_UI_SURFACE
} from './overlayUiSurfaceContract.js';
import { CLOUD_JSON_DEFAULT_TIMEOUT_MS } from './cloudApiClient.js';
import { FOCUS_CIRCLE_MUTATION_TIMEOUT_MS } from './focusCircleMembership.js';

const here = dirname(fileURLToPath(import.meta.url));

function readUi(name) {
  return readFileSync(join(here, '../ui', name), 'utf8');
}

describe('Slice 3 cross-module three-state regression (#839 AND-3)', () => {
  it('reminder save success stays a visible success token after render', () => {
    const src = readUi('ReminderPreferenceUI.js');
    assert.match(src, /reminder-preference-saved/);
    assert.match(src, /_savedFlashUntil/);
    const reminderRow = OVERLAY_UI_SURFACE.find(
      (row) => row.file === 'ReminderPreferenceUI.js'
    );
    assert.ok(reminderRow, 'O-04 reminder row');
    const successTokens = reminderRow.mutationFeedback?.success?.tokens || [];
    const failTokens = reminderRow.mutationFeedback?.fail?.tokens || [];
    assert.equal(successTokens.includes('reminder-preference-saved'), true);
    assert.equal(failTokens.includes('reminder-preference-saved'), false);
    assert.equal(
      OVERLAY_UI_SUCCESS_TOKENS_FORBIDDEN_IN_FAIL.includes(
        'reminder-preference-saved'
      ),
      true
    );
  });

  it('Circle click mutations timeout and map to visible fail copy', () => {
    assert.equal(CLOUD_JSON_DEFAULT_TIMEOUT_MS, 12000);
    assert.equal(FOCUS_CIRCLE_MUTATION_TIMEOUT_MS, 12000);
    const witnessCore = readFileSync(
      join(here, 'focusCircleWitness.js'),
      'utf8'
    );
    const wasHere = readFileSync(join(here, 'focusCircleWasHere.js'), 'utf8');
    const controls = readUi('FocusCircleControlsUI.js');
    const witnessUi = readUi('FocusCircleWitnessLeaveUI.js');
    assert.match(witnessCore, /status === 408/);
    assert.match(witnessCore, /reason: 'timeout'/);
    assert.match(wasHere, /status === 408/);
    assert.match(wasHere, /reason: 'timeout'/);
    assert.match(controls, /PRIVACY_SHEET_FOCUS_CIRCLE_WORKING/);
    assert.match(controls, /PRIVACY_SHEET_FOCUS_CIRCLE_ERROR_TIMEOUT/);
    assert.match(controls, /result\.ok/);
    assert.match(witnessUi, /aria-busy/);
    assert.match(witnessUi, /FOCUS_CIRCLE_WITNESS_SUBMIT_ERROR/);
  });
});
