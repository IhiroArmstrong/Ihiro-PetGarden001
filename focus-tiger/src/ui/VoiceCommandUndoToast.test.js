/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { undoToastHitStyle } from './VoiceCommandUndoToast.js';

test('resting undo bar is out of the hit-test tree', () => {
  const style = undoToastHitStyle('rest');
  assert.equal(style.hidden, true);
  assert.equal(style.display, 'none');
  assert.equal(style.pointerEvents, 'none');
});

test('fading undo bar stays visible but does not catch clicks', () => {
  const style = undoToastHitStyle('fading');
  assert.equal(style.hidden, false);
  assert.equal(style.display, 'flex');
  assert.equal(style.pointerEvents, 'none');
});

test('shown undo bar accepts the Undo click', () => {
  const style = undoToastHitStyle('shown');
  assert.equal(style.hidden, false);
  assert.equal(style.display, 'flex');
  assert.equal(style.pointerEvents, 'auto');
});
