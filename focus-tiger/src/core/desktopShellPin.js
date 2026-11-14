/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T95 shell pin. Electron 45's own floor is macOS 13 (Ventura).
 * electron-builder writes `minimumSystemVersion` into Info.plist as
 * LSMinimumSystemVersion. The dmg title names the same floor on the installer.
 * Do not float onto 46.
 *
 * GitHub tagged stable v45.3.2 on 2026-11-13. npm registry had no
 * electron@45.3.2 that day (404), so the installable pin is the newest
 * published 45 patch.
 */

export const DESKTOP_ELECTRON_PIN = '45.3.1';
export const MAC_MINIMUM_SYSTEM_VERSION = '13.0';
export const MAC_INSTALLER_TITLE = 'Samatia — macOS 13 Ventura or later';

/**
 * @param {{
 *   devDependencies?: { electron?: string },
 *   build?: { mac?: { minimumSystemVersion?: string }, dmg?: { title?: string } }
 * }} pkg
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function assertDesktopShellPin(pkg) {
  const electron = String(pkg?.devDependencies?.electron || '');
  if (electron !== DESKTOP_ELECTRON_PIN) {
    return {
      ok: false,
      error: `desktop electron pin must be ${DESKTOP_ELECTRON_PIN} (major 45 only), got ${electron || '(empty)'}`
    };
  }
  if (electron.startsWith('46')) {
    return { ok: false, error: 'T95 does not upgrade the shell to Electron 46' };
  }
  const minimum = pkg?.build?.mac?.minimumSystemVersion;
  if (minimum !== MAC_MINIMUM_SYSTEM_VERSION) {
    return {
      ok: false,
      error: `Info.plist minimum macOS must be ${MAC_MINIMUM_SYSTEM_VERSION}, got ${minimum || '(empty)'}`
    };
  }
  const title = String(pkg?.build?.dmg?.title || '');
  if (title !== MAC_INSTALLER_TITLE) {
    return {
      ok: false,
      error: `installer title must name macOS 13, got ${title || '(empty)'}`
    };
  }
  return { ok: true };
}
