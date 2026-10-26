/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Electron main process — Step B (tray + hide-to-background).
 * Red-close = hide. Menu "Quit" = quit. Renderer is told hideReason=tray (SB-18).
 */

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  net,
  protocol,
  shell,
  Tray,
  Notification,
  globalShortcut,
  screen
} from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { planDesktopCheckoutReturn } from './checkoutReturnDelivery.js';
import {
  DESKTOP_CUSTOM_ORIGIN,
  desktopCheckoutReturnSearch,
  isAllowedCloudApiPath,
  isAllowedExternalUrl,
  isDesktopCheckoutReturnUrl
} from './ipcGuard.js';
import {
  HIDE_REASON_NONE,
  HIDE_REASON_TRAY,
  shouldQuitOnWindowClose,
  trayMenuLabels
} from './trayPolicy.js';
import { attachCompanionL1Ipc } from './companion/l1Ipc.js';
import { appendConfideObservationLog } from './companion/confideObservationLog.js';
import { createDesktopUpdaterRuntime } from './updater/updaterRuntime.js';
import { attachDesktopUpdaterIpc } from './updater/updaterIpc.js';
import { attachVoiceInputIpc } from './voiceInput/voiceInputIpc.js';
import { attachSystemTtsIpc } from './systemTts/systemTtsIpc.js';
import { createFloatingMarkerRuntime } from './floatingMarker/floatingMarkerNative.js';
import {
  loadAlwaysOnTopPrefs,
  saveAlwaysOnTopPrefs
} from './alwaysOnTop/alwaysOnTopPolicy.js';
import { createInputRhythmSensorBridge } from './inputRhythm/sensorBridge.js';
import {
  companionBoundsForWorkArea,
  isCompanionBounds,
  loadWindowLayoutPrefs,
  planWindowLayout,
  saveWindowLayoutPrefs
} from './windowLayout/windowLayoutPolicy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'focus-tiger',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

/** Keep in sync with `src/core/cloudApiClient.js` `DEFAULT_CLOUD_API_BASE_URL`. */
const DEFAULT_CLOUD_API_BASE = 'https://focus-tiger-cloud.ihiro.workers.dev';
const DEV_LOAD_URL = 'http://127.0.0.1:5173/?product=1';

/** @type {BrowserWindow | null} */
let mainWindow = null;
/** @type {string | null} */
let pendingCheckoutReturnUrl = null;
/** @type {import('./companion/l1Runtime.js').CompanionL1Runtime | null} */
let companionRuntime = null;
/** @type {ReturnType<typeof createDesktopUpdaterRuntime> | null} */
let updaterRuntime = null;
/** @type {Tray | null} */
let tray = null;
/** @type {ReturnType<typeof createFloatingMarkerRuntime> | null} */
let floatingMarkerRuntime = null;
let alwaysOnTopEnabled = false;
/** @type {ReturnType<typeof createInputRhythmSensorBridge> | null} */
let inputRhythmBridge = null;
/** @type {ReturnType<typeof loadWindowLayoutPrefs>} */
let windowLayoutPrefs = { lastLayout: 'regular', normalBounds: null };
let isQuitting = false;
let shellHidden = false;
let shellHideReason = HIDE_REASON_NONE;

function isDevMode() {
  return process.env.FT_DESKTOP_DEV === '1' || process.argv.includes('--dev');
}

function isVoiceInputProbeMode() {
  return process.env.FT_VOICE_INPUT_PROBE === '1';
}

function isSystemTtsProbeMode() {
  return process.env.FT_SYSTEM_TTS_PROBE === '1';
}

/**
 * Lab probes skip companion IPC. Preload always sendSync's this channel;
 * with no listener Electron never replies and the window stays blank.
 */
function registerLabProbeCompanionDenied() {
  ipcMain.on('desktop:companion-allowed', (event) => {
    event.returnValue = false;
  });
}

function voiceInputProbeHtmlPath() {
  return path.join(__dirname, 'voiceInput', 'voice-input-probe.html');
}

function systemTtsProbeHtmlPath() {
  return path.join(__dirname, 'systemTts', 'system-tts-probe.html');
}

/** Dev launcher (^C / SIGTERM) must quit even with Step B tray alive. */
function installDevSignalQuit() {
  if (!isDevMode()) return;

  let signalQuitStarted = false;
  const quitFromDevSignal = () => {
    if (signalQuitStarted) return;
    signalQuitStarted = true;
    isQuitting = true;
    void companionRuntime?.dispose?.();
    updaterRuntime?.dispose?.();
    floatingMarkerRuntime?.dispose?.();
  inputRhythmBridge?.dispose?.();
    app.quit();
  };

  process.once('SIGINT', quitFromDevSignal);
  process.once('SIGTERM', quitFromDevSignal);
}

installDevSignalQuit();

function cloudApiBase() {
  return String(
    process.env.FT_CLOUD_API_BASE_URL || DEFAULT_CLOUD_API_BASE
  ).replace(/\/+$/, '');
}

function distDir() {
  if (app.isPackaged) return path.join(__dirname, 'dist');
  return path.join(__dirname, '..', 'dist');
}

function extraResourceDir(name) {
  if (app.isPackaged) return path.join(process.resourcesPath, name);
  return path.join(__dirname, '..', 'public', name);
}

function visibilityPayload() {
  return { hidden: shellHidden, hideReason: shellHideReason };
}

function notifyShellVisibility(win = mainWindow) {
  if (!win || win.isDestroyed() || win.webContents.isDestroyed()) return;
  win.webContents.send('desktop:shell-visibility', visibilityPayload());
}

/**
 * @param {string} root
 * @param {string} rel
 * @returns {string | null}
 */
function safeResolveUnder(root, rel) {
  const resolved = path.resolve(root, rel);
  const rootResolved = path.resolve(root);
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return resolved;
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function serveCustomProtocol(request) {
  const url = new URL(request.url);
  let pathname = decodeURIComponent(url.pathname || '/');
  if (!pathname || pathname === '/') pathname = '/index.html';

  /** @type {string | null} */
  let filePath = null;
  if (pathname.startsWith('/sprites/')) {
    filePath = safeResolveUnder(
      extraResourceDir('sprites'),
      pathname.slice('/sprites/'.length)
    );
  } else if (pathname.startsWith('/audio/')) {
    filePath = safeResolveUnder(
      extraResourceDir('audio'),
      pathname.slice('/audio/'.length)
    );
  } else {
    filePath = safeResolveUnder(distDir(), pathname.replace(/^\//, ''));
  }

  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new Response('Not found', { status: 404 });
  }
  return net.fetch(pathToFileURL(filePath).href);
}

function trayIconImage() {
  const iconPath = path.join(__dirname, '..', 'public', 'icons', 'pwa-192.png');
  const image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) return nativeImage.createEmpty();
  return image.resize({ width: 18, height: 18 });
}

function hideToTray(win = mainWindow) {
  if (!win || win.isDestroyed()) return;
  shellHidden = true;
  shellHideReason = HIDE_REASON_TRAY;
  notifyShellVisibility(win);
  win.hide();
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
  }
  shellHidden = false;
  shellHideReason = HIDE_REASON_NONE;
  mainWindow.show();
  mainWindow.focus();
  notifyShellVisibility(mainWindow);
}

/**
 * Stripe success/cancel deep-link.
 * An already open window stays put and hears the query in-page.
 * Cold start loads once so confirm can read the query.
 *
 * @param {string} rawUrl `focus-tiger://app/?product=1&pro_session=cs_…`
 */
function navigateDesktopCheckoutReturn(rawUrl) {
  const search = desktopCheckoutReturnSearch(rawUrl);
  showMainWindow();
  const win = mainWindow;
  if (!win || win.isDestroyed()) return;
  const plan = planDesktopCheckoutReturn({
    pageUrl: win.webContents.getURL(),
    isLoading: win.webContents.isLoading(),
    search
  });
  if (plan.mode === 'in-page') {
    win.webContents.send('desktop:checkout-return', plan.search);
    return;
  }
  const qs = plan.search;
  if (isDevMode()) {
    const base = DEV_LOAD_URL.split('?')[0];
    void win.loadURL(`${base}?${qs}`);
    return;
  }
  void win.loadURL(`${DESKTOP_CUSTOM_ORIGIN}/index.html?${qs}`);
}

/**
 * @param {string} rawUrl
 */
function handleDesktopCheckoutReturn(rawUrl) {
  if (!isDesktopCheckoutReturnUrl(rawUrl)) return;
  if (!app.isReady()) {
    pendingCheckoutReturnUrl = rawUrl;
    return;
  }
  navigateDesktopCheckoutReturn(rawUrl);
}

function registerDesktopCheckoutProtocol() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(
        'focus-tiger',
        process.execPath,
        [path.resolve(process.argv[1])]
      );
    }
  } else {
    app.setAsDefaultProtocolClient('focus-tiger');
  }

  const onCheckoutDeepLink = (event, url) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    handleDesktopCheckoutReturn(url);
  };

  if (process.platform === 'darwin') {
    app.on('will-finish-launching', () => {
      app.on('open-url', onCheckoutDeepLink);
    });
  } else {
    app.on('open-url', onCheckoutDeepLink);
  }
}

const coldStartCheckoutUrl = process.argv.find((arg) =>
  isDesktopCheckoutReturnUrl(arg)
);
if (coldStartCheckoutUrl) {
  pendingCheckoutReturnUrl = coldStartCheckoutUrl;
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const deepLink = argv.find((arg) => isDesktopCheckoutReturnUrl(arg));
    if (deepLink) handleDesktopCheckoutReturn(deepLink);
    else showMainWindow();
  });

  registerDesktopCheckoutProtocol();
}

function attachWindowLifecycle(win) {
  win.on('close', (event) => {
    if (shouldQuitOnWindowClose({ isQuitting })) return;
    event.preventDefault();
    hideToTray(win);
  });
}

function notifyOpenPreferences(win = mainWindow) {
  if (!win || win.isDestroyed() || win.webContents.isDestroyed()) return;
  win.webContents.send('desktop:open-preferences');
}

function openPreferencesFromMenu() {
  showMainWindow();
  notifyOpenPreferences(mainWindow);
}

function installMacApplicationMenu() {
  if (process.platform !== 'darwin') return;
  const labels = trayMenuLabels(app.getLocale());

  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences…',
          accelerator: 'Cmd+,',
          click: () => openPreferencesFromMenu()
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    {
      role: 'window',
      submenu: [
        {
          label: labels.companionWindow,
          click: () => applyWindowLayoutAction('companion')
        },
        {
          label: labels.sitFullscreen,
          click: () => applyWindowLayoutAction('fullscreen')
        },
        { type: 'separator' },
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function applyAlwaysOnTop(win = mainWindow) {
  if (!win || win.isDestroyed()) return;
  win.setAlwaysOnTop(alwaysOnTopEnabled, 'floating');
}

function persistAlwaysOnTop(enabled) {
  alwaysOnTopEnabled = Boolean(enabled);
  saveAlwaysOnTopPrefs(app.getPath('userData'), { enabled: alwaysOnTopEnabled });
  applyAlwaysOnTop();
  applyTrayMenu();
  return alwaysOnTopEnabled;
}

function describeWindowLayout(win = mainWindow) {
  if (!win || win.isDestroyed()) return 'regular';
  if (win.isFullScreen()) return 'fullscreen';
  if (isCompanionBounds(win.getBounds())) return 'companion';
  return 'regular';
}

function currentWorkArea(win = mainWindow) {
  if (!win || win.isDestroyed()) {
    return screen.getPrimaryDisplay().workArea;
  }
  return screen.getDisplayMatching(win.getBounds()).workArea;
}

function applyPlannedBounds(win, bounds) {
  if (!win || win.isDestroyed() || !bounds) return;
  if (Number.isFinite(bounds.x) && Number.isFinite(bounds.y)) {
    win.setBounds(bounds);
    return;
  }
  win.setSize(bounds.width, bounds.height);
}

function applyWindowLayoutAction(action) {
  showMainWindow();
  const win = mainWindow;
  if (!win || win.isDestroyed()) return { layout: 'regular', saved: false };
  const plan = planWindowLayout({
    action: action === 'fullscreen' ? 'fullscreen' : 'companion',
    isFullScreen: win.isFullScreen(),
    currentBounds: win.getBounds(),
    prefs: windowLayoutPrefs,
    workArea: currentWorkArea(win)
  });
  const commitPrefs = () => {
    windowLayoutPrefs = saveWindowLayoutPrefs(app.getPath('userData'), plan.persist);
    applyTrayMenu();
  };
  const finishGeometry = () => {
    applyPlannedBounds(win, plan.setBounds);
    commitPrefs();
  };
  if (plan.waitForLeaveFullScreen && win.isFullScreen()) {
    win.once('leave-full-screen', () => {
      applyPlannedBounds(win, plan.setBounds);
    });
    win.setFullScreen(false);
    commitPrefs();
    return { layout: plan.layout, saved: true };
  }
  if (plan.setFullScreen === true && !win.isFullScreen()) {
    win.setFullScreen(true);
  } else if (plan.setFullScreen === false && win.isFullScreen()) {
    win.setFullScreen(false);
  }
  finishGeometry();
  return { layout: describeWindowLayout(win), saved: true };
}

function applyTrayMenu() {
  if (!tray) return;
  const labels = trayMenuLabels(app.getLocale());
  const prefs = floatingMarkerRuntime?.prefs?.() ?? {
    show: false,
    hideInFullScreen: true
  };
  /** @type {import('electron').MenuItemConstructorOptions[]} */
  const items = [
    { label: labels.show, click: () => showMainWindow() },
    {
      label: labels.alwaysOnTop,
      type: 'checkbox',
      checked: alwaysOnTopEnabled,
      click: (item) => {
        persistAlwaysOnTop(item.checked);
      }
    },
    {
      label: labels.companionWindow,
      click: () => applyWindowLayoutAction('companion')
    },
    {
      label: labels.sitFullscreen,
      click: () => applyWindowLayoutAction('fullscreen')
    }
  ];
  if (process.platform === 'darwin' && floatingMarkerRuntime) {
    items.push(
      { type: 'separator' },
      {
        label: labels.floatingMarker,
        type: 'checkbox',
        checked: prefs.show,
        click: (item) => {
          floatingMarkerRuntime?.setShow(item.checked);
        }
      },
      {
        label: labels.hideInFullScreen,
        type: 'checkbox',
        checked: prefs.hideInFullScreen,
        click: (item) => {
          floatingMarkerRuntime?.setHideInFullScreen(item.checked);
        }
      }
    );
  }
  items.push(
    { type: 'separator' },
    {
      label: labels.quit,
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  );
  tray.setContextMenu(Menu.buildFromTemplate(items));
}

function createTray() {
  if (tray) return tray;
  tray = new Tray(trayIconImage());
  tray.setToolTip('Focus Tiger');
  applyTrayMenu();
  tray.on('click', () => showMainWindow());
  return tray;
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 390,
    minHeight: 640,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  attachWindowLifecycle(win);
  win.once('ready-to-show', () => {
    shellHidden = false;
    shellHideReason = HIDE_REASON_NONE;
    applyAlwaysOnTop(win);
    if (windowLayoutPrefs.lastLayout === 'companion') {
      applyPlannedBounds(win, companionBoundsForWorkArea(currentWorkArea(win)));
    }
    win.show();
    notifyShellVisibility(win);
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalUrl(url)) {
      void shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (isDevMode()) {
      if (url.startsWith('http://127.0.0.1:5173')) return;
    } else if (url.startsWith(`${DESKTOP_CUSTOM_ORIGIN}/`) || url === DESKTOP_CUSTOM_ORIGIN) {
      return;
    }
    event.preventDefault();
    if (isAllowedExternalUrl(url)) {
      void shell.openExternal(url);
    }
  });

  if (isSystemTtsProbeMode()) {
    void win.loadFile(systemTtsProbeHtmlPath());
  } else if (isVoiceInputProbeMode()) {
    void win.loadFile(voiceInputProbeHtmlPath());
  } else if (isDevMode()) {
    void win.loadURL(DEV_LOAD_URL);
  } else {
    void win.loadURL(`${DESKTOP_CUSTOM_ORIGIN}/index.html?product=1`);
  }
  return win;
}

if (gotSingleInstanceLock) {
  app.whenReady().then(async () => {
  protocol.handle('focus-tiger', (request) => serveCustomProtocol(request));

  ipcMain.handle('desktop:open-external', async (_event, url) => {
    if (!isAllowedExternalUrl(url)) {
      throw new Error('external_url_blocked');
    }
    await shell.openExternal(url);
    return true;
  });

  ipcMain.handle('desktop:cloud-post', async (_event, apiPath, body) => {
    if (!isAllowedCloudApiPath(apiPath)) {
      return {
        ok: false,
        status: 400,
        detail: 'cloud_path_blocked',
        body: null
      };
    }
    try {
      const res = await fetch(`${cloudApiBase()}${apiPath}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body == null || body === '' ? '{}' : String(body)
      });
      let json = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }
      if (!res.ok) {
        const detail =
          json && typeof json === 'object' && 'detail' in json
            ? String(json.detail || '')
            : `HTTP ${res.status}`;
        return {
          ok: false,
          status: res.status,
          detail: detail || `HTTP ${res.status}`,
          body: json
        };
      }
      return { ok: true, body: json };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        detail: err instanceof Error ? err.message : 'cloud_network_error',
        body: null
      };
    }
  });

  ipcMain.handle('desktop:version', () => app.getVersion());
  ipcMain.handle('desktop:quit', () => {
    isQuitting = true;
    app.quit();
  });
  ipcMain.handle('desktop:hide', () => {
    hideToTray();
    return visibilityPayload();
  });
  ipcMain.handle('desktop:show', () => {
    showMainWindow();
    return visibilityPayload();
  });
  ipcMain.handle('desktop:always-on-top-get', () => alwaysOnTopEnabled);
  ipcMain.handle('desktop:always-on-top-set', (_event, enabled) =>
    persistAlwaysOnTop(enabled)
  );
  ipcMain.handle('desktop:input-rhythm-get', () =>
    inputRhythmBridge?.snapshot() || { available: false, enabled: false }
  );
  ipcMain.handle('desktop:input-rhythm-set', (_event, enabled) =>
    inputRhythmBridge?.setEnabled(enabled) || { available: false, enabled: false }
  );
  ipcMain.handle('desktop:input-rhythm-clear', () =>
    inputRhythmBridge?.clear() || { available: false, enabled: false }
  );
  ipcMain.handle('desktop:input-rhythm-open-settings', () =>
    inputRhythmBridge?.openInputMonitoringSettings()
  );
  ipcMain.handle('desktop:window-layout-get', () => describeWindowLayout());
  ipcMain.handle('desktop:window-layout-apply', (_event, action) =>
    applyWindowLayoutAction(action === 'fullscreen' ? 'fullscreen' : 'companion')
  );
  ipcMain.handle('desktop:shell-visibility-get', () => visibilityPayload());
  ipcMain.handle('desktop:session-end-notification', (_event, payload) => {
    const title = String(payload?.title || '').trim();
    const body = String(payload?.body || '').trim();
    if (!title) return false;
    if (!Notification.isSupported()) return false;
    const note = new Notification({ title, body });
    note.show();
    return true;
  });

  ipcMain.on('desktop:voice-input-probe-allowed', (event) => {
    event.returnValue = isVoiceInputProbeMode();
  });

  ipcMain.on('desktop:system-tts-probe-allowed', (event) => {
    event.returnValue = isSystemTtsProbeMode();
  });

  ipcMain.on('desktop:voice-input-product-allowed', (event) => {
    event.returnValue = process.platform === 'darwin';
  });

  ipcMain.on('desktop:system-tts-product-allowed', (event) => {
    event.returnValue = process.platform === 'darwin';
  });

  ipcMain.handle('desktop:confide-observation-append', (_event, record) =>
    appendConfideObservationLog(
      app.getPath('userData'),
      record && typeof record === 'object' ? record : {}
    )
  );

  if (process.env.FT_COMPANION_L0 === '1') {
    const { runL0BenchInMain } = await import('./companion/l0Main.js');
    try {
      await runL0BenchInMain({
        BrowserWindow,
        createWindow: createMainWindow,
        userDataDir: app.getPath('userData')
      });
    } catch (err) {
      console.error('[l0]', err);
      app.exit(1);
      return;
    }
    app.quit();
    return;
  }

  if (isSystemTtsProbeMode()) {
    registerLabProbeCompanionDenied();
    attachSystemTtsIpc({
      ipcMain,
      getMainWindow: () => mainWindow
    });
    installMacApplicationMenu();
    createTray();
    mainWindow = createMainWindow();
    app.on('activate', () => {
      showMainWindow();
    });
    return;
  }

  if (isVoiceInputProbeMode()) {
    registerLabProbeCompanionDenied();
    attachVoiceInputIpc({
      ipcMain,
      getMainWindow: () => mainWindow
    });
    installMacApplicationMenu();
    createTray();
    mainWindow = createMainWindow();
    app.on('activate', () => {
      showMainWindow();
    });
    return;
  }

  attachVoiceInputIpc({
    ipcMain,
    getMainWindow: () => mainWindow
  });

  attachSystemTtsIpc({
    ipcMain,
    getMainWindow: () => mainWindow
  });

  companionRuntime = attachCompanionL1Ipc({
    ipcMain,
    app,
    getMainWindow: () => mainWindow
  });

  updaterRuntime = createDesktopUpdaterRuntime({
    app,
    getMainWindow: () => mainWindow,
    env: process.env
  });
  attachDesktopUpdaterIpc({
    ipcMain,
    runtime: updaterRuntime,
    isDevMode
  });

  alwaysOnTopEnabled = loadAlwaysOnTopPrefs(app.getPath('userData')).enabled;
  windowLayoutPrefs = loadWindowLayoutPrefs(app.getPath('userData'));
  inputRhythmBridge = createInputRhythmSensorBridge({
    userDataDir: app.getPath('userData')
  });
  inputRhythmBridge.bootIfEnabled();
  installMacApplicationMenu();
  floatingMarkerRuntime = createFloatingMarkerRuntime({
    userDataDir: app.getPath('userData'),
    onClicked: () => showMainWindow(),
    onStateChange: () => applyTrayMenu()
  });
  createTray();
  floatingMarkerRuntime.start();
  mainWindow = createMainWindow();
  if (process.platform === 'darwin') {
    globalShortcut.register('Control+Shift+Y', () => {
      showMainWindow();
      if (!mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isDestroyed()) return;
      mainWindow.webContents.send('desktop:yin-voice-ptt');
    });
  }
  app.on('will-quit', () => {
    globalShortcut.unregister('Control+Shift+Y');
  });
  updaterRuntime.scheduleCheck();

  if (pendingCheckoutReturnUrl) {
    navigateDesktopCheckoutReturn(pendingCheckoutReturnUrl);
    pendingCheckoutReturnUrl = null;
  }

  app.on('activate', () => {
    showMainWindow();
    updaterRuntime?.scheduleCheck();
  });
  });
}

app.on('before-quit', () => {
  isQuitting = true;
  void companionRuntime?.dispose?.();
  updaterRuntime?.dispose?.();
  floatingMarkerRuntime?.dispose?.();
});

app.on('window-all-closed', () => {
  if (process.env.FT_COMPANION_L0 === '1') return;
  // Step B: tray keeps the process. Quit is menu-only.
});
