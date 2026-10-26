/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  DEFAULT_INPUT_RHYTHM_PREFS,
  clearInputRhythmFeatures,
  loadInputRhythmPrefs,
  saveInputRhythmFeatures,
  saveInputRhythmPrefs
} from '../../desktop/inputRhythm/inputRhythmPolicy.js';

describe('inputRhythmPolicy', () => {
  it('defaults off and stores no keycodes', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-rhythm-'));
    assert.equal(loadInputRhythmPrefs(dir).enabled, DEFAULT_INPUT_RHYTHM_PREFS.enabled);
    saveInputRhythmPrefs(dir, { enabled: true });
    assert.equal(loadInputRhythmPrefs(dir).enabled, true);
    const features = saveInputRhythmFeatures(dir, {
      switchCount5m: 2,
      keyCount5m: 10,
      backspaceCount5m: 1,
      backspaceRatio5m: 0.1,
      updatedAt: 1,
      title: 'nope'
    });
    assert.equal('title' in features, false);
    assert.equal(features.switchCount5m, 2);
    clearInputRhythmFeatures(dir);
    assert.equal(fs.existsSync(path.join(dir, 'input-rhythm-features.json')), false);
  });
});
