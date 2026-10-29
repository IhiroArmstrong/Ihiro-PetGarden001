/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEY,
  readMindflowNebulaEnabled,
  resolveMindflowNebulaPresentation,
  writeMindflowNebulaEnabled
} from './mindflowNebulaStore.js';

test('mindflow nebula defaults off', () => {
  const storage = {
    data: {},
    getItem(k) {
      return this.data[k] ?? null;
    },
    setItem(k, v) {
      this.data[k] = v;
    },
    removeItem(k) {
      delete this.data[k];
    }
  };
  assert.equal(readMindflowNebulaEnabled(storage), false);
  assert.equal(writeMindflowNebulaEnabled(storage, true), true);
  assert.equal(storage.data[STORAGE_KEY], '1');
  assert.equal(readMindflowNebulaEnabled(storage), true);
});

test('resolveMindflowNebulaPresentation hides when disabled or focusing', () => {
  assert.deepEqual(
    resolveMindflowNebulaPresentation({
      enabled: false,
      focusing: false,
      confideOpen: true,
      companionSpeaking: true
    }),
    { visible: false, mode: 'rest' }
  );
  assert.deepEqual(
    resolveMindflowNebulaPresentation({
      enabled: true,
      focusing: true,
      confideOpen: true,
      companionSpeaking: true
    }),
    { visible: false, mode: 'rest' }
  );
});

test('resolveMindflowNebulaPresentation modes when visible', () => {
  assert.deepEqual(
    resolveMindflowNebulaPresentation({
      enabled: true,
      focusing: false,
      confideOpen: false,
      companionSpeaking: false
    }),
    { visible: true, mode: 'rest' }
  );
  assert.deepEqual(
    resolveMindflowNebulaPresentation({
      enabled: true,
      focusing: false,
      confideOpen: true,
      companionSpeaking: false
    }),
    { visible: true, mode: 'confide' }
  );
  assert.deepEqual(
    resolveMindflowNebulaPresentation({
      enabled: true,
      focusing: false,
      confideOpen: true,
      companionSpeaking: true
    }),
    { visible: true, mode: 'companion_speak' }
  );
});
