/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { OVERLAY_UI_FILE_SOURCES } from './overlaySlotContractRegistry.js';
import {
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
    'failureFeedback',
    'e2eOverlap',
    'trackerCoverage'
  ]);
});
