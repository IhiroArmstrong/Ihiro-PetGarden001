/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import electronUpdater from 'electron-updater';

const { autoUpdater } = electronUpdater;
import {
  isSelfHostedUpdaterEnabled,
  resolveUpdateChannel
} from '../../src/core/desktopUpdaterChannel.js';
import { mapUrgencyForMvp } from '../../src/core/desktopUpdaterState.js';

const CHECK_IDLE_DELAY_MS = 2500;

/**
 * @typedef {{
 *   enabled: boolean,
 *   phase: string,
 *   version: string,
 *   progressPercent: number | null,
 *   error: string,
 *   skippedVersion: string,
 *   urgency: string
 * }} DesktopUpdaterSnapshot
 */

/**
 * @param {{
 *   app: import('electron').App,
 *   getMainWindow: () => import('electron').BrowserWindow | null,
 *   env?: Record<string, string | undefined>,
 * }} deps
 */
export function createDesktopUpdaterRuntime(deps) {
  const channel = resolveUpdateChannel(deps.env || process.env);
  const enabled =
    isSelfHostedUpdaterEnabled(channel) &&
    (deps.app.isPackaged || String(deps.env?.FT_UPDATER_DEV || process.env.FT_UPDATER_DEV || '') === '1');

  /** @type {DesktopUpdaterSnapshot} */
  let snapshot = {
    enabled,
    phase: 'idle',
    version: '',
    progressPercent: null,
    error: '',
    skippedVersion: '',
    urgency: 'optional'
  };

  let checkTimer = null;
  let checking = false;
  let fakePhase = null;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  const feedUrl = String(
    deps.env?.FT_UPDATE_FEED_URL || process.env.FT_UPDATE_FEED_URL || ''
  ).trim();
  if (enabled && feedUrl) {
    autoUpdater.setFeedURL({ provider: 'generic', url: feedUrl });
  }

  function broadcast() {
    const win = deps.getMainWindow?.();
    if (!win || win.isDestroyed() || win.webContents.isDestroyed()) return;
    win.webContents.send('desktop:updater-state', { ...snapshot });
  }

  function setSnapshot(patch) {
    snapshot = { ...snapshot, ...patch };
    broadcast();
  }

  function applyFakePhase(phase) {
    fakePhase = phase;
    if (phase === 'available') {
      setSnapshot({
        phase: 'available',
        version: '9.9.9-dev',
        progressPercent: null,
        error: ''
      });
      return;
    }
    if (phase === 'downloading') {
      setSnapshot({
        phase: 'downloading',
        version: snapshot.version || '9.9.9-dev',
        progressPercent: 42,
        error: ''
      });
      return;
    }
    if (phase === 'readyToInstall') {
      setSnapshot({
        phase: 'readyToInstall',
        version: snapshot.version || '9.9.9-dev',
        progressPercent: 100,
        error: ''
      });
      return;
    }
    if (phase === 'failed') {
      setSnapshot({
        phase: 'failed',
        version: snapshot.version || '9.9.9-dev',
        progressPercent: null,
        error: 'download_failed'
      });
      return;
    }
    fakePhase = null;
    setSnapshot({
      phase: 'idle',
      version: '',
      progressPercent: null,
      error: ''
    });
  }

  function onUpdateAvailable(info) {
    const version = String(info?.version || '').trim();
    const urgency = mapUrgencyForMvp(info?.urgency);
    if (
      snapshot.skippedVersion &&
      version &&
      snapshot.skippedVersion === version
    ) {
      return;
    }
    setSnapshot({
      phase: 'available',
      version,
      progressPercent: null,
      error: '',
      urgency
    });
  }

  function onDownloadProgress(progress) {
    const percent = Number(progress?.percent);
    setSnapshot({
      phase: 'downloading',
      progressPercent: Number.isFinite(percent)
        ? Math.max(0, Math.min(100, Math.round(percent)))
        : null,
      error: ''
    });
  }

  function onUpdateDownloaded(info) {
    setSnapshot({
      phase: 'readyToInstall',
      version: String(info?.version || snapshot.version || '').trim(),
      progressPercent: 100,
      error: ''
    });
  }

  function onUpdaterError(err) {
    const message =
      err instanceof Error ? err.message : String(err || 'update_error');
    if (snapshot.phase === 'idle' && !snapshot.version) {
      return;
    }
    setSnapshot({
      phase: 'failed',
      progressPercent: null,
      error: message
    });
  }

  if (enabled) {
    autoUpdater.on('update-available', onUpdateAvailable);
    autoUpdater.on('download-progress', onDownloadProgress);
    autoUpdater.on('update-downloaded', onUpdateDownloaded);
    autoUpdater.on('error', onUpdaterError);
  }

  async function checkForUpdates() {
    if (!enabled || checking || fakePhase) return snapshot;
    if (!deps.app.isPackaged && !feedUrl) return snapshot;
    checking = true;
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      onUpdaterError(err);
    } finally {
      checking = false;
    }
    return snapshot;
  }

  function scheduleCheck(delayMs = CHECK_IDLE_DELAY_MS) {
    if (!enabled) return;
    if (checkTimer) clearTimeout(checkTimer);
    checkTimer = setTimeout(() => {
      checkTimer = null;
      void checkForUpdates();
    }, delayMs);
  }

  async function downloadUpdate() {
    if (fakePhase) {
      applyFakePhase('downloading');
      setTimeout(() => applyFakePhase('readyToInstall'), 400);
      return snapshot;
    }
    if (!enabled) return snapshot;
    if (snapshot.phase !== 'available' && snapshot.phase !== 'failed') {
      return snapshot;
    }
    setSnapshot({
      phase: 'downloading',
      progressPercent: 0,
      error: ''
    });
    try {
      await autoUpdater.downloadUpdate();
    } catch (err) {
      onUpdaterError(err);
    }
    return snapshot;
  }

  function quitAndInstall() {
    if (fakePhase) {
      return true;
    }
    if (!enabled) return false;
    if (snapshot.phase !== 'readyToInstall') return false;
    autoUpdater.quitAndInstall(false, true);
    return true;
  }

  function skipVersion() {
    const version = String(snapshot.version || '').trim();
    if (!version) {
      setSnapshot({ phase: 'skipped' });
      return snapshot;
    }
    setSnapshot({
      phase: 'skipped',
      skippedVersion: version,
      progressPercent: null,
      error: ''
    });
    return snapshot;
  }

  function getSnapshot() {
    return { ...snapshot };
  }

  function dispose() {
    if (checkTimer) clearTimeout(checkTimer);
    checkTimer = null;
    if (enabled) {
      autoUpdater.removeListener('update-available', onUpdateAvailable);
      autoUpdater.removeListener('download-progress', onDownloadProgress);
      autoUpdater.removeListener('update-downloaded', onUpdateDownloaded);
      autoUpdater.removeListener('error', onUpdaterError);
    }
  }

  return {
    scheduleCheck,
    checkForUpdates,
    downloadUpdate,
    quitAndInstall,
    skipVersion,
    getSnapshot,
    applyFakePhase,
    dispose
  };
}
