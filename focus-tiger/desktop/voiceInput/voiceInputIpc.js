/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Voice Input IPC — macOS on-device STT (Slice 0 lab + Slice 1+ product mounts).
 */

import { systemPreferences } from 'electron';
import { createSpeechProvider } from './speechProvider.js';

/**
 * @param {{
 *   ipcMain: import('electron').IpcMain,
 *   getMainWindow: () => import('electron').BrowserWindow | null
 * }} deps
 */
export function attachVoiceInputIpc(deps) {
  const provider = createSpeechProvider({ allowCloudStt: false, locale: 'en-US' });

  const emitStatus = () => {
    const win = deps.getMainWindow?.();
    if (!win || win.isDestroyed() || win.webContents.isDestroyed()) return;
    win.webContents.send('desktop:voice-input-status', provider.snapshot());
  };

  deps.ipcMain.handle('desktop:voice-input-gate', async () => {
    const gate = await provider.probeOnDeviceGate();
    emitStatus();
    return gate;
  });

  deps.ipcMain.handle('desktop:voice-input-start', async () => {
    if (process.platform === 'darwin') {
      const mic = systemPreferences.getMediaAccessStatus('microphone');
      if (mic !== 'granted') {
        const granted = await systemPreferences.askForMediaAccess('microphone');
        if (!granted) {
          const payload = {
            ok: false,
            status: 'error',
            userMessage: 'Microphone permission was denied.'
          };
          emitStatus();
          return payload;
        }
      }
    }
    const result = await provider.startListening();
    emitStatus();
    return result;
  });

  deps.ipcMain.handle('desktop:voice-input-stop', async () => {
    const result = await provider.stopListening();
    if (result && result.ok === true && !String(result.transcript || '').trim()) {
      console.info(
        '[voice-input] empty transcript',
        result.captureDiagnostics || '(no capture diagnostics)'
      );
    }
    emitStatus();
    return result;
  });

  deps.ipcMain.handle('desktop:voice-input-snapshot', () => provider.snapshot());

  return provider;
}

/** @deprecated Use attachVoiceInputIpc */
export const attachVoiceInputProbeIpc = attachVoiceInputIpc;
