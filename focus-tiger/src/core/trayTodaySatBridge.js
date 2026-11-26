/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { DailyCompletionStore } from './DailyCompletionStore.js';
import { getDesktopShellBridge, isDesktopShellRuntime } from './desktopShell.js';
import { getLocalDateKey } from '../utils/localDate.js';
import {
  TRAY_TODAY_SAT_CHANGED_EVENT,
  normalizeTrayTodaySatSnapshot
} from './trayTodaySatPolicy.js';
import {
  readTrayTodaySatEnabled,
  writeTrayTodaySatEnabled
} from './trayTodaySatPreference.js';

/**
 * @param {object} [globalObj]
 * @returns {boolean}
 */
export function canUseTrayTodaySat(globalObj = globalThis) {
  if (!isDesktopShellRuntime(globalObj)) return false;
  const shell = getDesktopShellBridge(globalObj);
  return typeof shell?.setTrayTodaySat === 'function';
}

/**
 * @param {object} [globalObj]
 * @returns {Storage | null}
 */
function storageOf(globalObj) {
  try {
    return globalObj.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {object} [globalObj]
 * @returns {{ enabled: boolean, minutes: number, dateKey: string }}
 */
export function readTrayTodaySatSnapshot(globalObj = globalThis) {
  const storage = storageOf(globalObj);
  const store = new DailyCompletionStore({ storage, now: () => new Date() });
  return normalizeTrayTodaySatSnapshot({
    enabled: readTrayTodaySatEnabled(storage),
    minutes: store.getTodayTotalMinutes(),
    dateKey: getLocalDateKey(new Date())
  });
}

/**
 * @param {object} [globalObj]
 * @returns {Promise<{ ok: boolean, saved: boolean, enabled: boolean }>}
 */
export async function pushTrayTodaySatSnapshot(globalObj = globalThis) {
  const snapshot = readTrayTodaySatSnapshot(globalObj);
  if (!canUseTrayTodaySat(globalObj)) {
    return { ok: false, saved: false, enabled: snapshot.enabled };
  }
  try {
    await getDesktopShellBridge(globalObj).setTrayTodaySat(snapshot);
    return { ok: true, saved: true, enabled: snapshot.enabled };
  } catch {
    return { ok: false, saved: false, enabled: snapshot.enabled };
  }
}

/**
 * @param {boolean} enabled
 * @param {object} [globalObj]
 * @returns {Promise<{ enabled: boolean, saved: boolean }>}
 */
export async function writeTrayTodaySatPreference(enabled, globalObj = globalThis) {
  const next = Boolean(enabled);
  const storage = storageOf(globalObj);
  const saved = writeTrayTodaySatEnabled(storage, next);
  await pushTrayTodaySatSnapshot(globalObj);
  return { enabled: readTrayTodaySatEnabled(storage), saved };
}

/**
 * Boot + session-complete + midnight-on-show. No per-second polling.
 *
 * @param {object} [globalObj]
 */
export function installTrayTodaySatSync(globalObj = globalThis) {
  if (globalObj.__ftTrayTodaySatSyncInstalled) return;
  globalObj.__ftTrayTodaySatSyncInstalled = true;
  void pushTrayTodaySatSnapshot(globalObj);
  try {
    globalObj.addEventListener?.(TRAY_TODAY_SAT_CHANGED_EVENT, () => {
      void pushTrayTodaySatSnapshot(globalObj);
    });
  } catch {
    // node tests
  }
  const doc = globalObj.document;
  if (doc?.addEventListener) {
    doc.addEventListener('visibilitychange', () => {
      if (doc.visibilityState === 'visible') void pushTrayTodaySatSnapshot(globalObj);
    });
  }
}
