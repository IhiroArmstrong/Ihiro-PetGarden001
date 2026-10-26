/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { shell } from 'electron';
import {
  InputRhythmWindow,
  decideRhythmTiming,
  observationalRhythmStats
} from '../../src/core/inputRhythmEngine.js';
import {
  clearInputRhythmFeatures,
  loadInputRhythmFeatures,
  loadInputRhythmPrefs,
  saveInputRhythmFeatures,
  saveInputRhythmPrefs
} from './inputRhythmPolicy.js';
import { spawnInputRhythmHelper } from './inputRhythmNative.js';

const INPUT_MONITORING_SETTINGS =
  'x-apple.systempreferences:com.apple.preference.security?Privacy_ListenEvent';

export function createInputRhythmSensorBridge({
  userDataDir,
  now = () => Date.now()
}) {
  const window = new InputRhythmWindow({ now });
  let child = null;
  let helperAlive = false;
  let authorized = false;
  let lastDenied = null;
  let lastHeartbeatAt = 0;

  function persistWindow() {
    const totals = window.totals(now());
    const keys = totals.keys;
    saveInputRhythmFeatures(userDataDir, {
      switchCount5m: totals.switches,
      backspaceCount5m: totals.backs,
      keyCount5m: keys,
      backspaceRatio5m: keys > 0 ? totals.backs / keys : 0,
      updatedAt: now()
    });
  }

  function stopHelper() {
    helperAlive = false;
    authorized = false;
    if (child && !child.killed) {
      child.kill();
    }
    child = null;
  }

  function startHelper() {
    stopHelper();
    if (process.platform !== 'darwin') return false;
    child = spawnInputRhythmHelper({
      onSample: (sample) => {
        helperAlive = true;
        authorized = true;
        lastDenied = null;
        lastHeartbeatAt = now();
        window.ingest(sample);
        persistWindow();
      },
      onDenied: (error) => {
        lastDenied = error;
        authorized = false;
        helperAlive = Boolean(child);
        saveInputRhythmPrefs(userDataDir, { enabled: false });
        stopHelper();
      },
      onExit: () => {
        helperAlive = false;
        child = null;
      }
    });
    return Boolean(child);
  }

  function snapshot(companionMode) {
    const prefs = loadInputRhythmPrefs(userDataDir);
    const features = loadInputRhythmFeatures(userDataDir);
    const totals = window.totals(now());
    const observed = observationalRhythmStats(totals);
    const timing = decideRhythmTiming({
      enabled: prefs.enabled,
      authorized,
      helperAlive,
      companionMode,
      switchCount5m: totals.switches,
      keyCount5m: totals.keys,
      backspaceCount5m: totals.backs
    });
    return {
      available: process.platform === 'darwin',
      enabled: prefs.enabled === true,
      authorized,
      helperAlive,
      lastDenied,
      lastHeartbeatAt,
      features,
      observed,
      timing
    };
  }

  return {
    snapshot,
    getEnabled() {
      return loadInputRhythmPrefs(userDataDir).enabled === true;
    },
    setEnabled(enabled) {
      if (enabled !== true) {
        saveInputRhythmPrefs(userDataDir, { enabled: false });
        stopHelper();
        return snapshot();
      }
      if (process.platform !== 'darwin') {
        saveInputRhythmPrefs(userDataDir, { enabled: false });
        return snapshot();
      }
      saveInputRhythmPrefs(userDataDir, { enabled: true });
      const started = startHelper();
      if (!started) {
        saveInputRhythmPrefs(userDataDir, { enabled: false });
      }
      return snapshot();
    },
    bootIfEnabled() {
      if (loadInputRhythmPrefs(userDataDir).enabled === true) {
        startHelper();
      }
    },
    clear() {
      window.clear();
      clearInputRhythmFeatures(userDataDir);
      return snapshot();
    },
    openInputMonitoringSettings() {
      return shell.openExternal(INPUT_MONITORING_SETTINGS);
    },
    dispose: stopHelper
  };
}
