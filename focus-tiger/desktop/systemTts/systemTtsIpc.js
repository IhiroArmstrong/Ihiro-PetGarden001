/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * System TTS IPC — macOS AVSpeechSynthesizer (Slice 0 lab only).
 */

import { createTtsProvider } from './ttsProvider.js';

/**
 * @param {{
 *   ipcMain: import('electron').IpcMain,
 *   getMainWindow: () => import('electron').BrowserWindow | null
 * }} deps
 */
export function attachSystemTtsIpc(deps) {
  const provider = createTtsProvider();

  const emitStatus = () => {
    const win = deps.getMainWindow?.();
    if (!win || win.isDestroyed() || win.webContents.isDestroyed()) return;
    win.webContents.send('desktop:system-tts-status', provider.snapshot());
  };

  deps.ipcMain.handle('desktop:system-tts-gate', async (_event, locale) => {
    const gate = await provider.probeGate(typeof locale === 'string' ? locale : 'en-US');
    emitStatus();
    return gate;
  });

  deps.ipcMain.handle('desktop:system-tts-speak', async (_event, payload) => {
    const locale =
      payload && typeof payload === 'object' && typeof payload.locale === 'string'
        ? payload.locale
        : 'en-US';
    const text =
      payload && typeof payload === 'object' && typeof payload.text === 'string'
        ? payload.text
        : undefined;
    const result = await provider.speak(locale, text);
    emitStatus();
    return result;
  });

  deps.ipcMain.handle('desktop:system-tts-stop', async () => {
    const result = await provider.stop();
    emitStatus();
    return result;
  });

  deps.ipcMain.handle('desktop:system-tts-snapshot', () => provider.snapshot());

  return provider;
}
