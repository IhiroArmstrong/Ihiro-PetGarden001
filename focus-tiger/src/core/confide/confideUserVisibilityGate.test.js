/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canOpenConfidePanel,
  CONFIDE_USER_MOUNT_ENABLED,
  isConfideChromeStageAllowed,
  isConfideDevHarness,
  isConfideUserVisible
} from './confideUserVisibilityGate.js';
import { isConfideSafetyCorpusOk } from './confideCorpus.js';

test('safety copy is human-ok; product mount still closed by default', () => {
  assert.equal(isConfideSafetyCorpusOk(), true);
  assert.equal(CONFIDE_USER_MOUNT_ENABLED, false);
  assert.equal(isConfideUserVisible(), false);
});

test('user-visible requires mountEnabled AND safety ok', () => {
  assert.equal(
    isConfideUserVisible({ safetyOk: () => true, mountEnabled: false }),
    false
  );
  assert.equal(
    isConfideUserVisible({ safetyOk: () => false, mountEnabled: true }),
    false
  );
  assert.equal(
    isConfideUserVisible({ safetyOk: () => true, mountEnabled: true }),
    true
  );
});

test('dev harness ?confide=1 does not imply user-visible', () => {
  assert.equal(isConfideDevHarness('?confide=1'), true);
  assert.equal(isConfideDevHarness('product=1&confide=1'), true);
  assert.equal(isConfideDevHarness('?product=1'), false);
  assert.equal(isConfideUserVisible(), false);
});

test('chrome stage: only idle allowed', () => {
  assert.equal(isConfideChromeStageAllowed('idle'), true);
  assert.equal(isConfideChromeStageAllowed('arrival'), false);
  assert.equal(isConfideChromeStageAllowed('focusing'), false);
  assert.equal(isConfideChromeStageAllowed('overlay-suppress'), false);
  assert.equal(isConfideChromeStageAllowed('bridge'), false);
});

test('canOpenConfidePanel: harness OR mount, and idle only', () => {
  assert.equal(canOpenConfidePanel({ search: '', stage: 'idle' }), false);
  assert.equal(
    canOpenConfidePanel({ search: '?confide=1', stage: 'idle' }),
    true
  );
  assert.equal(
    canOpenConfidePanel({ search: '?confide=1', stage: 'focusing' }),
    false
  );
  assert.equal(
    canOpenConfidePanel({
      search: '',
      stage: 'idle',
      safetyOk: () => true,
      mountEnabled: true
    }),
    true
  );
  assert.equal(
    canOpenConfidePanel({
      search: '',
      stage: 'arrival',
      safetyOk: () => true,
      mountEnabled: true
    }),
    false
  );
});

test('canOpenConfidePanel: desktop companion generation is Idle + safety only', () => {
  assert.equal(
    canOpenConfidePanel({
      search: '',
      stage: 'idle',
      companionGeneration: true
    }),
    true
  );
  assert.equal(
    canOpenConfidePanel({
      search: '',
      stage: 'idle',
      companionGeneration: true,
      safetyOk: () => false
    }),
    false
  );
});
