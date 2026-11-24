/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { globalSitPracticeUrl } from '../../src/core/globalSitHotkeyPolicy.js';
import {
  loadGlobalSitHotkeyPrefs,
  saveGlobalSitHotkeyPrefs
} from './globalSitHotkeyPrefs.js';
import {
  registerGlobalSitHotkey,
  unregisterGlobalSitHotkey
} from './globalSitHotkeyRegister.js';

/**
 * @param {object} deps
 * @param {{ getPath: Function, on: Function }} deps.app
 * @param {{ handle: Function }} deps.ipcMain
 * @param {{ register: Function, unregister: Function }} deps.globalShortcut
 * @param {() => void} deps.showMainWindow
 * @param {(url: string) => void} deps.navigatePractice
 * @param {string} [deps.platform]
 */
export function attachGlobalSitHotkey(deps) {
  const platform = deps.platform || process.platform;
  const userDataDir = deps.app.getPath('userData');
  let current = loadGlobalSitHotkeyPrefs(userDataDir).accelerator;
  let registered = false;

  const fire = () => {
    deps.showMainWindow();
    deps.navigatePractice(globalSitPracticeUrl());
  };

  const applyRegister = (previousAccelerator) => {
    if (platform !== 'darwin') {
      registered = false;
      return { registered: false, accelerator: current, reason: 'unavailable' };
    }
    const result = registerGlobalSitHotkey({
      globalShortcut: deps.globalShortcut,
      previousAccelerator,
      accelerator: current,
      onFire: fire
    });
    current = result.accelerator;
    registered = result.registered;
    return result;
  };

  applyRegister('');

  deps.ipcMain.handle('desktop:global-sit-hotkey-get', () => ({
    accelerator: current,
    registered,
    available: platform === 'darwin'
  }));

  deps.ipcMain.handle('desktop:global-sit-hotkey-set', (_event, accelerator) => {
    const saved = saveGlobalSitHotkeyPrefs(userDataDir, { accelerator });
    if (!saved.ok) {
      return {
        ok: false,
        accelerator: current,
        registered,
        reason: saved.reason,
        saved: false,
        available: platform === 'darwin'
      };
    }
    const previous = current;
    current = saved.accelerator;
    const result = applyRegister(previous);
    return {
      ok: result.registered,
      accelerator: current,
      registered: result.registered,
      reason: result.registered ? 'ok' : result.reason,
      saved: true,
      available: platform === 'darwin'
    };
  });

  deps.app.on('will-quit', () => {
    unregisterGlobalSitHotkey(deps.globalShortcut, current);
  });

  return {
    snapshot: () => ({ accelerator: current, registered })
  };
}
