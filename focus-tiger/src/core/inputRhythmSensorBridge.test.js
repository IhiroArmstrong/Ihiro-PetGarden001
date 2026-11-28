/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { createInputRhythmSensorBridge } from '../../desktop/inputRhythm/sensorBridge.js';
import { loadInputRhythmPrefs } from '../../desktop/inputRhythm/inputRhythmPolicy.js';

describe('inputRhythmSensorBridge', () => {
  it('keeps the switch on when Input Monitoring is denied (SB-21)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-rhythm-deny-'));
    const fakeChild = { killed: false, kill() {} };
    let denied;
    const bridge = createInputRhythmSensorBridge({
      userDataDir: dir,
      platform: 'darwin',
      spawnHelper: (handlers) => {
        denied = handlers.onDenied;
        return fakeChild;
      }
    });
    const snap = bridge.setEnabled(true);
    assert.equal(snap.enabled, true);
    assert.equal(loadInputRhythmPrefs(dir).enabled, true);
    denied?.('input_monitoring_denied');
    assert.equal(loadInputRhythmPrefs(dir).enabled, true);
    const after = bridge.snapshot();
    assert.equal(after.enabled, true);
    assert.equal(after.authorized, false);
    assert.equal(after.lastDenied, 'input_monitoring_denied');
  });

  it('reverts the switch when the helper fails to start', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-rhythm-nostart-'));
    const bridge = createInputRhythmSensorBridge({
      userDataDir: dir,
      platform: 'darwin',
      spawnHelper: () => null
    });
    const snap = bridge.setEnabled(true);
    assert.equal(snap.enabled, false);
    assert.equal(loadInputRhythmPrefs(dir).enabled, false);
  });

  it('does not persist the switch on Linux even if a helper is injected', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ft-rhythm-linux-'));
    const bridge = createInputRhythmSensorBridge({
      userDataDir: dir,
      platform: 'linux',
      spawnHelper: () => ({ killed: false, kill() {} })
    });
    const snap = bridge.setEnabled(true);
    assert.equal(snap.enabled, false);
    assert.equal(snap.available, false);
    assert.equal(loadInputRhythmPrefs(dir).enabled, false);
  });
});