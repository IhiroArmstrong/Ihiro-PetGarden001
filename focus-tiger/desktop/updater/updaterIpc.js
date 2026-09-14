/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Desktop updater IPC — preload whitelist only.
 */

/**
 * @param {{
 *   ipcMain: import('electron').IpcMain,
 *   runtime: ReturnType<import('./updaterRuntime.js').createDesktopUpdaterRuntime>,
 *   isDevMode: () => boolean
 * }} deps
 */
export function attachDesktopUpdaterIpc(deps) {
  deps.ipcMain.handle('desktop:updater-get-state', () =>
    deps.runtime.getSnapshot()
  );
  deps.ipcMain.handle('desktop:updater-check', () => deps.runtime.checkForUpdates());
  deps.ipcMain.handle('desktop:updater-download', () =>
    deps.runtime.downloadUpdate()
  );
  deps.ipcMain.handle('desktop:updater-quit-and-install', () =>
    deps.runtime.quitAndInstall()
  );
  deps.ipcMain.handle('desktop:updater-skip', () => deps.runtime.skipVersion());

  deps.ipcMain.handle('desktop:updater-fake-state', (_event, payload) => {
    if (!deps.isDevMode()) {
      throw new Error('updater_fake_state_dev_only');
    }
    const phase =
      payload && typeof payload === 'object' && payload.phase
        ? String(payload.phase)
        : 'available';
    deps.runtime.applyFakePhase(phase);
    return deps.runtime.getSnapshot();
  });
}
