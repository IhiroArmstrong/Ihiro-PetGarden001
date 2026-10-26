/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { getDesktopShellBridge, isDesktopShellRuntime } from './desktopShell.js';
import { decideRhythmTiming } from './inputRhythmEngine.js';

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function canUseInputRhythm(globalObj = globalThis) {
  if (!isDesktopShellRuntime(globalObj)) return false;
  const shell = getDesktopShellBridge(globalObj);
  return typeof shell?.getInputRhythm === 'function';
}

export async function readInputRhythmSnapshot(globalObj = globalThis) {
  if (!canUseInputRhythm(globalObj)) {
    return {
      available: false,
      enabled: false,
      authorized: false,
      helperAlive: false,
      timing: decideRhythmTiming({ enabled: false })
    };
  }
  try {
    return await getDesktopShellBridge(globalObj).getInputRhythm();
  } catch {
    return {
      available: false,
      enabled: false,
      authorized: false,
      helperAlive: false,
      timing: decideRhythmTiming({ enabled: false })
    };
  }
}

export async function writeInputRhythmEnabled(enabled, globalObj = globalThis) {
  if (!canUseInputRhythm(globalObj)) {
    return { enabled: false, saved: false, snapshot: await readInputRhythmSnapshot(globalObj) };
  }
  try {
    const snapshot = await getDesktopShellBridge(globalObj).setInputRhythmEnabled(
      Boolean(enabled)
    );
    return {
      enabled: snapshot?.enabled === true,
      saved: true,
      snapshot
    };
  } catch {
    return {
      enabled: !enabled,
      saved: false,
      snapshot: await readInputRhythmSnapshot(globalObj)
    };
  }
}

export async function clearInputRhythm(globalObj = globalThis) {
  if (!canUseInputRhythm(globalObj)) {
    return { cleared: false, snapshot: await readInputRhythmSnapshot(globalObj) };
  }
  try {
    const snapshot = await getDesktopShellBridge(globalObj).clearInputRhythm();
    return { cleared: true, snapshot };
  } catch {
    return { cleared: false, snapshot: await readInputRhythmSnapshot(globalObj) };
  }
}

export async function openInputRhythmSettings(globalObj = globalThis) {
  if (!canUseInputRhythm(globalObj)) return false;
  try {
    await getDesktopShellBridge(globalObj).openInputRhythmSettings();
    return true;
  } catch {
    return false;
  }
}

export function createRhythmTimingCache(globalObj = globalThis) {
  let snapshot = {
    enabled: false,
    authorized: false,
    helperAlive: false,
    features: {}
  };
  return {
    timing(extra = {}) {
      const features = snapshot.features || {};
      return decideRhythmTiming({
        enabled: snapshot.enabled === true,
        authorized: snapshot.authorized === true,
        helperAlive: snapshot.helperAlive === true,
        companionMode: extra.companionMode,
        switchCount5m: features.switchCount5m,
        keyCount5m: features.keyCount5m,
        backspaceCount5m: features.backspaceCount5m,
        awayFromTaskApp: extra.awayFromTaskApp === true
      });
    },
    async refresh() {
      snapshot = await readInputRhythmSnapshot(globalObj);
      return snapshot;
    }
  };
}
