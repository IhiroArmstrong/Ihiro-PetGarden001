/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// Sandboxed Electron preload is a classic script, not ESM — even when
// desktop/package.json has "type": "module". `import` throws SyntaxError
// and window.desktopShell never appears (Confide row stays hidden).
const { contextBridge, ipcRenderer } = require('electron');

const companionAllowed = ipcRenderer.sendSync('desktop:companion-allowed') === true;

/** @type {Record<string, unknown>} */
const desktopShell = {
  isDesktop: true,
  openExternal: (url) => ipcRenderer.invoke('desktop:open-external', url),
  cloudPostJson: (path, body) =>
    ipcRenderer.invoke('desktop:cloud-post', path, body),
  getVersion: () => ipcRenderer.invoke('desktop:version'),
  quit: () => ipcRenderer.invoke('desktop:quit'),
  hide: () => ipcRenderer.invoke('desktop:hide'),
  show: () => ipcRenderer.invoke('desktop:show'),
  getShellVisibility: () => ipcRenderer.invoke('desktop:shell-visibility-get'),
  onShellVisibility: (cb) => {
    if (typeof cb !== 'function') return () => {};
    const wrapped = (_event, payload) => cb(payload);
    ipcRenderer.on('desktop:shell-visibility', wrapped);
    return () => ipcRenderer.removeListener('desktop:shell-visibility', wrapped);
  }
};

if (companionAllowed) {
  desktopShell.companion = {
    ensureReady: () => ipcRenderer.invoke('desktop:companion-ensure'),
    unload: () => ipcRenderer.invoke('desktop:companion-unload'),
    getStatus: () => ipcRenderer.invoke('desktop:companion-status'),
    setFocusing: (focusing) =>
      ipcRenderer.invoke('desktop:companion-set-focusing', Boolean(focusing)),
    generate: (payload) => ipcRenderer.invoke('desktop:companion-generate', payload),
    onStatus: (cb) => {
      if (typeof cb !== 'function') return () => {};
      const wrapped = (_event, payload) => cb(payload);
      ipcRenderer.on('desktop:companion-status', wrapped);
      return () => ipcRenderer.removeListener('desktop:companion-status', wrapped);
    }
  };
  desktopShell.yinPersonalMemory = {
    getState: () => ipcRenderer.invoke('desktop:yin-personal-memory-get'),
    setConsent: (granted) =>
      ipcRenderer.invoke('desktop:yin-personal-memory-set-consent', Boolean(granted)),
    rememberFromConfide: (payload) =>
      ipcRenderer.invoke('desktop:yin-personal-memory-remember-from-confide', payload)
  };
}

contextBridge.exposeInMainWorld('desktopShell', desktopShell);
