/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Electron always-on-top preference (no Electron import — unit-testable).
 */

import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_ALWAYS_ON_TOP_PREFS = Object.freeze({
  enabled: false
});

/**
 * @param {unknown} raw
 * @returns {{ enabled: boolean }}
 */
export function normalizeAlwaysOnTopPrefs(raw) {
  const row = raw && typeof raw === 'object' ? raw : {};
  return { enabled: row.enabled === true };
}

/**
 * @param {string} userDataDir
 * @returns {string}
 */
export function alwaysOnTopPrefsPath(userDataDir) {
  return path.join(userDataDir, 'always-on-top.json');
}

/**
 * @param {string} userDataDir
 * @returns {{ enabled: boolean }}
 */
export function loadAlwaysOnTopPrefs(userDataDir) {
  try {
    return normalizeAlwaysOnTopPrefs(
      JSON.parse(fs.readFileSync(alwaysOnTopPrefsPath(userDataDir), 'utf8'))
    );
  } catch {
    return { ...DEFAULT_ALWAYS_ON_TOP_PREFS };
  }
}

/**
 * @param {string} userDataDir
 * @param {{ enabled?: boolean }} prefs
 * @returns {{ enabled: boolean }}
 */
export function saveAlwaysOnTopPrefs(userDataDir, prefs) {
  const next = normalizeAlwaysOnTopPrefs(prefs);
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(alwaysOnTopPrefsPath(userDataDir), `${JSON.stringify(next)}\n`);
  return next;
}
