/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canOpenConfidePanel,
  CONFIDE_USER_MOUNT_ENABLED,
  isConfideChromeStageAllowed,
  isConfideDevHarness,
  isConfideLocaleAllowed,
  isConfideUserVisible,
  shouldShowConfideEarChrome
} from './confideUserVisibilityGate.js';
import { isConfideSafetyCorpusOk } from './confideCorpus.js';

test('safety copy is human-ok; product mount on for non-ja first ship', () => {
  assert.equal(isConfideSafetyCorpusOk(), true);
  assert.equal(CONFIDE_USER_MOUNT_ENABLED, true);
  assert.equal(isConfideLocaleAllowed('en'), true);
  assert.equal(isConfideLocaleAllowed('zh'), true);
  assert.equal(isConfideLocaleAllowed('ja'), false);
  assert.equal(isConfideUserVisible({ locale: 'en' }), true);
  assert.equal(isConfideUserVisible({ locale: 'ja' }), false);
});

test('user-visible requires mountEnabled AND safety ok AND non-ja locale', () => {
  assert.equal(
    isConfideUserVisible({
      safetyOk: () => true,
      mountEnabled: false,
      locale: 'en'
    }),
    false
  );
  assert.equal(
    isConfideUserVisible({
      safetyOk: () => false,
      mountEnabled: true,
      locale: 'en'
    }),
    false
  );
  assert.equal(
    isConfideUserVisible({
      safetyOk: () => true,
      mountEnabled: true,
      locale: 'en'
    }),
    true
  );
  assert.equal(
    isConfideUserVisible({
      safetyOk: () => true,
      mountEnabled: true,
      locale: 'ja'
    }),
    false
  );
});

test('dev harness ?confide=1 does not imply user-visible when mount is off', () => {
  assert.equal(isConfideDevHarness('?confide=1'), true);
  assert.equal(isConfideDevHarness('product=1&confide=1'), true);
  assert.equal(isConfideDevHarness('?product=1'), false);
  assert.equal(
    isConfideUserVisible({ mountEnabled: false, locale: 'en' }),
    false
  );
});

test('chrome stage: only idle allowed', () => {
  assert.equal(isConfideChromeStageAllowed('idle'), true);
  assert.equal(isConfideChromeStageAllowed('arrival'), false);
  assert.equal(isConfideChromeStageAllowed('focusing'), false);
  assert.equal(isConfideChromeStageAllowed('overlay-suppress'), false);
  assert.equal(isConfideChromeStageAllowed('bridge'), false);
});

test('canOpenConfidePanel: English idle mount on; Japanese UI never opens', () => {
  assert.equal(
    canOpenConfidePanel({ search: '', stage: 'idle', locale: 'en' }),
    true
  );
  assert.equal(
    canOpenConfidePanel({ search: '', stage: 'idle', locale: 'ja' }),
    false
  );
  assert.equal(
    canOpenConfidePanel({
      search: '?confide=1',
      stage: 'idle',
      locale: 'ja',
      qaHarnessAllowed: true
    }),
    false
  );
  assert.equal(
    canOpenConfidePanel({
      search: '?confide=1',
      stage: 'idle',
      locale: 'en',
      qaHarnessAllowed: true
    }),
    true
  );
  assert.equal(
    canOpenConfidePanel({
      search: '?confide=1',
      stage: 'focusing',
      locale: 'en',
      qaHarnessAllowed: true
    }),
    false
  );
  assert.equal(
    canOpenConfidePanel({
      search: '',
      stage: 'idle',
      safetyOk: () => true,
      mountEnabled: true,
      locale: 'en'
    }),
    true
  );
  assert.equal(
    canOpenConfidePanel({
      search: '',
      stage: 'arrival',
      safetyOk: () => true,
      mountEnabled: true,
      locale: 'en'
    }),
    false
  );
});

test('canOpenConfidePanel: companion purchase does not bypass mount-off (Plan A option 1)', () => {
  assert.equal(
    canOpenConfidePanel({
      search: '',
      stage: 'idle',
      companionGeneration: true,
      safetyOk: () => true,
      mountEnabled: false,
      locale: 'en'
    }),
    false
  );
});

test('canOpenConfidePanel: ?confide=1 ignored when QA harness is off (production build)', () => {
  assert.equal(
    canOpenConfidePanel({
      search: '?confide=1',
      stage: 'idle',
      qaHarnessAllowed: false,
      mountEnabled: false,
      locale: 'en'
    }),
    false
  );
});

test('ear chrome visibility matches canOpen (no dead click)', () => {
  assert.equal(
    shouldShowConfideEarChrome({ search: '', stage: 'idle', locale: 'en' }),
    true
  );
  assert.equal(
    shouldShowConfideEarChrome({ search: '', stage: 'idle', locale: 'ja' }),
    false
  );
  assert.equal(
    shouldShowConfideEarChrome({
      search: '?confide=1',
      stage: 'idle',
      locale: 'en',
      qaHarnessAllowed: true
    }),
    true
  );
  assert.equal(
    shouldShowConfideEarChrome({
      search: '?confide=1',
      stage: 'focusing',
      locale: 'en',
      qaHarnessAllowed: true
    }),
    false
  );
  assert.equal(
    shouldShowConfideEarChrome({
      search: '',
      stage: 'idle',
      companionGeneration: true,
      safetyOk: () => true,
      mountEnabled: false,
      locale: 'en'
    }),
    false
  );
});
