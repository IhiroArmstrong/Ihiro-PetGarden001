/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktopShell', {
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
});
