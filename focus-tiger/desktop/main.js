/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
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
  Tray
} from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import {
  DESKTOP_CUSTOM_ORIGIN,
  isAllowedCloudApiPath,
  isAllowedExternalUrl
} from './ipcGuard.js';
import {
  HIDE_REASON_NONE,
  HIDE_REASON_TRAY,
  shouldQuitOnWindowClose,
  trayMenuLabels
} from './trayPolicy.js';

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
/** @type {Tray | null} */
let tray = null;
let isQuitting = false;
let shellHidden = false;
let shellHideReason = HIDE_REASON_NONE;

function isDevMode() {
  return process.env.FT_DESKTOP_DEV === '1' || process.argv.includes('--dev');
}

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

function attachWindowLifecycle(win) {
  win.on('close', (event) => {
    if (shouldQuitOnWindowClose({ isQuitting })) return;
    event.preventDefault();
    hideToTray(win);
  });
}

function createTray() {
  if (tray) return tray;
  tray = new Tray(trayIconImage());
  const labels = trayMenuLabels(app.getLocale());
  tray.setToolTip('Focus Tiger');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: labels.show, click: () => showMainWindow() },
      { type: 'separator' },
      {
        label: labels.quit,
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ])
  );
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

  if (isDevMode()) {
    void win.loadURL(DEV_LOAD_URL);
  } else {
    void win.loadURL(`${DESKTOP_CUSTOM_ORIGIN}/index.html?product=1`);
  }
  return win;
}

app.whenReady().then(() => {
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
  ipcMain.handle('desktop:shell-visibility-get', () => visibilityPayload());

  createTray();
  mainWindow = createMainWindow();

  app.on('activate', () => {
    showMainWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  // Step B: tray keeps the process. Quit is menu-only.
});
