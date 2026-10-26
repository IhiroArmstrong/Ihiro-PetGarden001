/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import fs from 'node:fs';
import path from 'node:path';

export const DEFAULT_INPUT_RHYTHM_PREFS = Object.freeze({
  enabled: false
});

export const EMPTY_INPUT_RHYTHM_FEATURES = Object.freeze({
  switchCount5m: 0,
  backspaceRatio5m: 0,
  keyCount5m: 0,
  backspaceCount5m: 0,
  updatedAt: 0
});

/**
 * @param {unknown} raw
 * @returns {{ enabled: boolean }}
 */
export function normalizeInputRhythmPrefs(raw) {
  const row = raw && typeof raw === 'object' ? raw : {};
  return { enabled: row.enabled === true };
}

/**
 * @param {unknown} raw
 * @returns {{
 *   switchCount5m: number,
 *   backspaceRatio5m: number,
 *   keyCount5m: number,
 *   backspaceCount5m: number,
 *   updatedAt: number
 * }}
 */
export function normalizeInputRhythmFeatures(raw) {
  const row = raw && typeof raw === 'object' ? raw : {};
  for (const key of Object.keys(row)) {
    if (
      ![
        'switchCount5m',
        'backspaceRatio5m',
        'keyCount5m',
        'backspaceCount5m',
        'updatedAt'
      ].includes(key)
    ) {
      continue;
    }
  }
  return {
    switchCount5m: Math.max(0, Math.floor(Number(row.switchCount5m) || 0)),
    backspaceRatio5m: Math.max(0, Number(row.backspaceRatio5m) || 0),
    keyCount5m: Math.max(0, Math.floor(Number(row.keyCount5m) || 0)),
    backspaceCount5m: Math.max(0, Math.floor(Number(row.backspaceCount5m) || 0)),
    updatedAt: Math.max(0, Number(row.updatedAt) || 0)
  };
}

export function inputRhythmPrefsPath(userDataDir) {
  return path.join(userDataDir, 'input-rhythm.json');
}

export function inputRhythmFeaturesPath(userDataDir) {
  return path.join(userDataDir, 'input-rhythm-features.json');
}

export function loadInputRhythmPrefs(userDataDir) {
  try {
    return normalizeInputRhythmPrefs(
      JSON.parse(fs.readFileSync(inputRhythmPrefsPath(userDataDir), 'utf8'))
    );
  } catch {
    return { ...DEFAULT_INPUT_RHYTHM_PREFS };
  }
}

export function saveInputRhythmPrefs(userDataDir, prefs) {
  const next = normalizeInputRhythmPrefs(prefs);
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(inputRhythmPrefsPath(userDataDir), `${JSON.stringify(next)}\n`);
  return next;
}

export function loadInputRhythmFeatures(userDataDir) {
  try {
    return normalizeInputRhythmFeatures(
      JSON.parse(fs.readFileSync(inputRhythmFeaturesPath(userDataDir), 'utf8'))
    );
  } catch {
    return { ...EMPTY_INPUT_RHYTHM_FEATURES };
  }
}

export function saveInputRhythmFeatures(userDataDir, features) {
  const next = normalizeInputRhythmFeatures(features);
  fs.mkdirSync(userDataDir, { recursive: true });
  const previous = loadInputRhythmFeatures(userDataDir);
  if (JSON.stringify(previous) === JSON.stringify(next)) return next;
  fs.writeFileSync(
    inputRhythmFeaturesPath(userDataDir),
    `${JSON.stringify(next)}\n`
  );
  return next;
}

export function clearInputRhythmFeatures(userDataDir) {
  try {
    fs.unlinkSync(inputRhythmFeaturesPath(userDataDir));
  } catch {
    /* missing is success */
  }
  return { ...EMPTY_INPUT_RHYTHM_FEATURES };
}
