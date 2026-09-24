/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

// Sandboxed Electron preload is a classic script, not ESM — even when
// desktop/package.json has "type": "module". `import` throws SyntaxError
// and window.desktopShell never appears (Confide row stays hidden).
const { contextBridge, ipcRenderer } = require('electron');

const companionAllowed = ipcRenderer.sendSync('desktop:companion-allowed') === true;
const voiceInputProbeAllowed =
  ipcRenderer.sendSync('desktop:voice-input-probe-allowed') === true;
const voiceInputProductAllowed =
  ipcRenderer.sendSync('desktop:voice-input-product-allowed') === true;

function createVoiceInputBridge() {
  return {
    getGate: () => ipcRenderer.invoke('desktop:voice-input-gate'),
    start: () => ipcRenderer.invoke('desktop:voice-input-start'),
    stop: () => ipcRenderer.invoke('desktop:voice-input-stop'),
    snapshot: () => ipcRenderer.invoke('desktop:voice-input-snapshot'),
    onStatus: (cb) => {
      if (typeof cb !== 'function') return () => {};
      const wrapped = (_event, payload) => cb(payload);
      ipcRenderer.on('desktop:voice-input-status', wrapped);
      return () =>
        ipcRenderer.removeListener('desktop:voice-input-status', wrapped);
    }
  };
}

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
  },
  onOpenPreferences: (cb) => {
    if (typeof cb !== 'function') return () => {};
    const wrapped = () => cb();
    ipcRenderer.on('desktop:open-preferences', wrapped);
    return () => ipcRenderer.removeListener('desktop:open-preferences', wrapped);
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
    classifyReadTool: (payload) =>
      ipcRenderer.invoke('desktop:companion-classify-read-tool', payload),
    semanticShadowClassify: (payload) =>
      ipcRenderer.invoke('desktop:companion-semantic-shadow-classify', payload),
    semanticLiveClassify: (payload) =>
      ipcRenderer.invoke('desktop:companion-semantic-live-classify', payload),
    semanticProductKnowledgeGate: (payload) =>
      ipcRenderer.invoke('desktop:companion-product-knowledge-gate', payload),
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
      ipcRenderer.invoke('desktop:yin-personal-memory-remember-from-confide', payload),
    recordOptOut: (payload) =>
      ipcRenderer.invoke('desktop:yin-personal-memory-record-opt-out', payload),
    suppressPostRecallFromConfide: (payload) =>
      ipcRenderer.invoke('desktop:yin-personal-memory-suppress-post-recall', payload),
    forget: (memoryId) =>
      ipcRenderer.invoke('desktop:yin-personal-memory-forget', memoryId)
  };
}

desktopShell.localBackup = {
  readCompanionFiles: () =>
    ipcRenderer.invoke('desktop:local-backup-read-companion-files'),
  writeCompanionFiles: (bundle) =>
    ipcRenderer.invoke('desktop:local-backup-write-companion-files', bundle)
};

desktopShell.confideObservation = {
  append: (record) =>
    ipcRenderer.invoke('desktop:confide-observation-append', record)
};

if (voiceInputProbeAllowed) {
  desktopShell.voiceInputProbe = createVoiceInputBridge();
}

if (voiceInputProductAllowed) {
  desktopShell.voiceInput = createVoiceInputBridge();
}

desktopShell.updater = {
  getState: () => ipcRenderer.invoke('desktop:updater-get-state'),
  check: () => ipcRenderer.invoke('desktop:updater-check'),
  download: () => ipcRenderer.invoke('desktop:updater-download'),
  quitAndInstall: () => ipcRenderer.invoke('desktop:updater-quit-and-install'),
  skip: () => ipcRenderer.invoke('desktop:updater-skip'),
  fakeState: (payload) =>
    ipcRenderer.invoke('desktop:updater-fake-state', payload || {}),
  onState: (cb) => {
    if (typeof cb !== 'function') return () => {};
    const wrapped = (_event, payload) => cb(payload);
    ipcRenderer.on('desktop:updater-state', wrapped);
    return () => ipcRenderer.removeListener('desktop:updater-state', wrapped);
  }
};

contextBridge.exposeInMainWorld('desktopShell', desktopShell);
