/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L1/L2 companion IPC. Generate is desktop-only; renderer still routes
 * safety / emotion buckets without calling this channel.
 */

import os from 'node:os';
import { isCompanionL1Allowed } from './l1Capability.js';
import { CompanionL1Runtime } from './l1Runtime.js';

/**
 * @param {{
 *   ipcMain: import('electron').IpcMain,
 *   app: import('electron').App,
 *   getMainWindow: () => import('electron').BrowserWindow | null
 * }} deps
 * @returns {CompanionL1Runtime}
 */
export function attachCompanionL1Ipc(deps) {
  const runtime = new CompanionL1Runtime({
    userDataDir: deps.app.getPath('userData'),
    getWebContents: () => {
      const win = deps.getMainWindow?.();
      if (!win || win.isDestroyed()) return null;
      return win.webContents;
    },
    totalMemBytes: os.totalmem(),
    env: process.env,
    isPackaged: deps.app.isPackaged,
    execPath: process.execPath
  });

  deps.ipcMain.on('desktop:companion-allowed', (event) => {
    event.returnValue = runtime.allowed;
  });

  deps.ipcMain.handle('desktop:companion-status', () => runtime.snapshot());
  deps.ipcMain.handle('desktop:companion-ensure', () => runtime.ensureReady());
  deps.ipcMain.handle('desktop:companion-unload', () => runtime.unload());
  deps.ipcMain.handle('desktop:companion-set-focusing', (_event, focusing) =>
    runtime.setFocusing(Boolean(focusing))
  );
  deps.ipcMain.handle('desktop:companion-generate', (_event, payload) =>
    runtime.generate(payload && typeof payload === 'object' ? payload : {})
  );

  return runtime;
}

export { isCompanionL1Allowed };
