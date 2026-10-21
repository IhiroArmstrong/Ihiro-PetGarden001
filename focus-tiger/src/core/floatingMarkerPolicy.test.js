/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  DEFAULT_FLOATING_MARKER_PREFS,
  collectionBehaviorTokens,
  isCoveringWindow,
  normalizeFloatingMarkerPrefs,
  shouldOrderOutForFullScreen
} from '../../desktop/floatingMarker/floatingMarkerPolicy.js';
import { trayMenuLabels } from '../../desktop/trayPolicy.js';

const nativeSwift = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../desktop/native/floating-marker.swift'
  ),
  'utf8'
);

describe('floating marker policy', () => {
  it('defaults to off, with hide-in-fullscreen on', () => {
    assert.deepEqual(DEFAULT_FLOATING_MARKER_PREFS, {
      show: false,
      hideInFullScreen: true
    });
    assert.deepEqual(normalizeFloatingMarkerPrefs(null), {
      show: false,
      hideInFullScreen: true
    });
    assert.equal(normalizeFloatingMarkerPrefs({ show: true }).show, true);
  });

  it('hide-in-fullscreen drops canJoinAllSpaces (regression vs stage-1 demo)', () => {
    const hidden = collectionBehaviorTokens(true);
    assert.equal(hidden.includes('canJoinAllSpaces'), false);
    assert.equal(hidden.includes('fullScreenAuxiliary'), false);
    assert.equal(hidden.includes('moveToActiveSpace'), true);
    const shown = collectionBehaviorTokens(false);
    assert.equal(shown.includes('canJoinAllSpaces'), true);
    assert.equal(shown.includes('fullScreenAuxiliary'), true);
  });

  it('orders out when the menu bar is collapsed or another window covers the screen', () => {
    assert.equal(shouldOrderOutForFullScreen(false, { menuBarCollapsed: true }), false);
    assert.equal(shouldOrderOutForFullScreen(true, { menuBarCollapsed: true }), true);
    assert.equal(shouldOrderOutForFullScreen(true, { coveringWindow: true }), true);
    assert.equal(shouldOrderOutForFullScreen(true, {}), false);
    assert.equal(isCoveringWindow(97, 100), true);
    assert.equal(isCoveringWindow(90, 100), false);
  });

  it('Swift helper mirrors the hide-in-fullscreen collection-behavior gate', () => {
    assert.match(nativeSwift, /if hideInFullScreen/);
    assert.match(nativeSwift, /moveToActiveSpace/);
    assert.match(nativeSwift, /canJoinAllSpaces/);
    assert.match(nativeSwift, /coveringWindow/);
    assert.match(nativeSwift, /NSHostingView/);
  });
});

describe('tray labels include floating companion', () => {
  it('adds Mac companion rows in en/zh/ja', () => {
    assert.equal(typeof trayMenuLabels('en').floatingMarker, 'string');
    assert.equal(typeof trayMenuLabels('zh-CN').hideInFullScreen, 'string');
    assert.equal(typeof trayMenuLabels('ja').floatingMarker, 'string');
  });
});
