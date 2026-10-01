/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { OVERLAY_UI_FILE_SOURCES } from './overlaySlotContractRegistry.js';
import {
  OVERLAY_UI_MUTATION_FEEDBACK_KEYS,
  OVERLAY_UI_SUCCESS_TOKENS_FORBIDDEN_IN_FAIL,
  OVERLAY_UI_SURFACE,
  OVERLAY_UI_SURFACE_COLUMNS
} from './overlayUiSurfaceContract.js';

test('OVERLAY_UI_SURFACE covers every occupancy UI file', () => {
  const files = new Set(OVERLAY_UI_SURFACE.map((row) => row.file));
  for (const name of Object.keys(OVERLAY_UI_FILE_SOURCES)) {
    assert.ok(files.has(name), `missing surface row for ${name}`);
  }
});

test('occupancy surface rows stay in OVERLAY_UI_FILE_SOURCES', () => {
  const occupancyFiles = new Set(Object.keys(OVERLAY_UI_FILE_SOURCES));
  for (const row of OVERLAY_UI_SURFACE) {
    if (row.occupancy === false) continue;
    assert.ok(
      occupancyFiles.has(row.file),
      `${row.file} occupancy true but not in FILE_SOURCES`
    );
  }
});

test('O-04 columns stay enumerated', () => {
  assert.deepEqual(OVERLAY_UI_SURFACE_COLUMNS, [
    'registry',
    'slotRequest',
    'zIndexFloor',
    'mountPointer',
    'mutationFeedback',
    'e2eOverlap',
    'trackerCoverage'
  ]);
});

test('every surface row has mutationFeedback pending/success/fail', () => {
  assert.deepEqual([...OVERLAY_UI_MUTATION_FEEDBACK_KEYS], [
    'pending',
    'success',
    'fail'
  ]);
  for (const row of OVERLAY_UI_SURFACE) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(row, 'failureFeedback'),
      false,
      `${row.file} still has retired failureFeedback`
    );
    const mf = row.mutationFeedback;
    assert.ok(mf && typeof mf === 'object', `${row.file} missing mutationFeedback`);
    for (const key of OVERLAY_UI_MUTATION_FEEDBACK_KEYS) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(mf, key),
        `${row.file} mutationFeedback missing ${key}`
      );
      assert.ok(mf[key]?.mode, `${row.file} mutationFeedback.${key} missing mode`);
    }
  }
});

test('reminder-preference-saved is a success token, not a fail token', () => {
  const row = OVERLAY_UI_SURFACE.find((item) => item.file === 'ReminderPreferenceUI.js');
  assert.ok(row, 'missing ReminderPreferenceUI.js surface row');
  const successTokens = row.mutationFeedback.success?.tokens || [];
  const failTokens = row.mutationFeedback.fail?.tokens || [];
  assert.ok(
    successTokens.includes('reminder-preference-saved'),
    'success key must keep reminder-preference-saved'
  );
  assert.equal(
    failTokens.includes('reminder-preference-saved'),
    false,
    'fail key must not include reminder-preference-saved'
  );
  assert.ok(
    OVERLAY_UI_SUCCESS_TOKENS_FORBIDDEN_IN_FAIL.includes('reminder-preference-saved')
  );
});
