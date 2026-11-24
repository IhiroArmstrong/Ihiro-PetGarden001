/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_GLOBAL_SIT_ACCELERATOR,
  resolveGlobalSitAccelerator,
  validateGlobalSitAccelerator
} from '../../src/core/globalSitHotkeyPolicy.js';

export const DEFAULT_GLOBAL_SIT_HOTKEY_PREFS = Object.freeze({
  accelerator: DEFAULT_GLOBAL_SIT_ACCELERATOR
});

/**
 * @param {string} userDataDir
 * @returns {string}
 */
export function globalSitHotkeyPrefsPath(userDataDir) {
  return path.join(userDataDir, 'global-sit-hotkey.json');
}

/**
 * @param {unknown} raw
 * @returns {{ accelerator: string }}
 */
export function normalizeGlobalSitHotkeyPrefs(raw) {
  const row = raw && typeof raw === 'object' ? raw : {};
  return {
    accelerator: resolveGlobalSitAccelerator(row.accelerator)
  };
}

/**
 * @param {string} userDataDir
 * @returns {{ accelerator: string }}
 */
export function loadGlobalSitHotkeyPrefs(userDataDir) {
  try {
    return normalizeGlobalSitHotkeyPrefs(
      JSON.parse(fs.readFileSync(globalSitHotkeyPrefsPath(userDataDir), 'utf8'))
    );
  } catch {
    return { ...DEFAULT_GLOBAL_SIT_HOTKEY_PREFS };
  }
}

/**
 * @param {string} userDataDir
 * @param {{ accelerator?: unknown }} prefs
 * @returns {{ ok: boolean, accelerator: string, reason: string, saved: boolean }}
 */
export function saveGlobalSitHotkeyPrefs(userDataDir, prefs) {
  const checked = validateGlobalSitAccelerator(prefs?.accelerator);
  if (!checked.ok) {
    return {
      ok: false,
      accelerator: loadGlobalSitHotkeyPrefs(userDataDir).accelerator,
      reason: checked.reason,
      saved: false
    };
  }
  const next = { accelerator: checked.accelerator };
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(
    globalSitHotkeyPrefsPath(userDataDir),
    `${JSON.stringify(next)}\n`
  );
  return { ok: true, accelerator: next.accelerator, reason: 'ok', saved: true };
}
