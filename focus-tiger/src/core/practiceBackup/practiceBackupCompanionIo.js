/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Electron companion-l2 files for local backup (Yin memory + Confide turns log).
 * Web: no bridge → null payloads.
 */

import { getDesktopShellBridge } from '../desktopShell.js';
import { normalizePracticeBackupCompanionFiles } from './practiceBackupSnapshot.js';

/**
 * @returns {Promise<import('./practiceBackupSnapshot.js').PracticeBackupCompanionFiles | null>}
 */
export async function readCompanionBackupBundle() {
  const shell = getDesktopShellBridge();
  const localBackup = shell?.localBackup;
  if (!localBackup || typeof localBackup.readCompanionFiles !== 'function') {
    return null;
  }
  try {
    const raw = await localBackup.readCompanionFiles();
    return normalizePracticeBackupCompanionFiles(raw) ?? null;
  } catch {
    return null;
  }
}

/**
 * @param {import('./practiceBackupSnapshot.js').PracticeBackupCompanionFiles | null | undefined} bundle
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export async function writeCompanionBackupBundle(bundle) {
  if (bundle == null) {
    return { ok: true };
  }
  const shell = getDesktopShellBridge();
  const localBackup = shell?.localBackup;
  if (!localBackup || typeof localBackup.writeCompanionFiles !== 'function') {
    return { ok: true };
  }
  const normalized = normalizePracticeBackupCompanionFiles(bundle) ?? bundle;
  try {
    const result = await localBackup.writeCompanionFiles(normalized);
    if (result && typeof result === 'object' && result.ok === false) {
      return { ok: false, reason: String(result.reason || 'companion_write_failed') };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'companion_write_failed';
    return { ok: false, reason: msg };
  }
}
