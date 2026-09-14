/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Wire desktop DMG updater chip (IPC). Web reload path stays in main.js.
 */

import {
  DESKTOP_UPDATE_PHASES,
  readForceDesktopUpdateFlag,
  shouldDeferQuitAndInstall,
  shouldRevealDesktopUpdateChip
} from './desktopUpdaterState.js';

/**
 * @typedef {{
 *   phase?: string,
 *   version?: string,
 *   progressPercent?: number | null,
 *   error?: string,
 *   skippedVersion?: string
 * }} DesktopUpdaterBridgeState
 */

/**
 * @typedef {{
 *   getState?: () => Promise<DesktopUpdaterBridgeState>,
 *   check?: () => Promise<DesktopUpdaterBridgeState>,
 *   download?: () => Promise<DesktopUpdaterBridgeState>,
 *   quitAndInstall?: () => Promise<boolean>,
 *   skip?: () => Promise<DesktopUpdaterBridgeState>,
 *   fakeState?: (payload: { phase?: string }) => Promise<DesktopUpdaterBridgeState>,
 *   onState?: (cb: (state: DesktopUpdaterBridgeState) => void) => () => void
 * }} DesktopUpdaterBridge
 */

/**
 * @param {{
 *   softUpdatePromptUI: import('../ui/SoftUpdatePromptUI.js').SoftUpdatePromptUI,
 *   getBusySession: () => boolean,
 *   updater?: DesktopUpdaterBridge | null,
 *   locationSearch?: string,
 *   devFake?: boolean
 * }} opts
 */
export function attachDesktopUpdater({
  softUpdatePromptUI,
  getBusySession,
  updater = null,
  locationSearch = '',
  devFake = false
}) {
  /** @type {DesktopUpdaterBridgeState} */
  let state = {
    phase: DESKTOP_UPDATE_PHASES.IDLE,
    version: '',
    progressPercent: null,
    error: '',
    skippedVersion: ''
  };

  let disposed = false;
  let unsubState = () => {};

  softUpdatePromptUI.setMode('desktop');

  const sync = () => {
    const busy = getBusySession();
    const reveal = shouldRevealDesktopUpdateChip({
      phase: state.phase,
      busySession: busy,
      skippedVersion: state.skippedVersion,
      availableVersion: state.version
    });
    softUpdatePromptUI.setDesktopState({
      phase: state.phase,
      versionLabel: state.version,
      progressPercent: state.progressPercent,
      revealed: reveal
    });
  };

  const applyState = (next) => {
    state = {
      phase: String(next?.phase || DESKTOP_UPDATE_PHASES.IDLE),
      version: String(next?.version || '').trim(),
      progressPercent:
        next?.progressPercent === null || next?.progressPercent === undefined
          ? null
          : Number(next.progressPercent),
      error: String(next?.error || ''),
      skippedVersion: String(next?.skippedVersion || state.skippedVersion || '')
    };
    sync();
  };

  const onPrimary = async () => {
    if (state.phase === DESKTOP_UPDATE_PHASES.AVAILABLE) {
      softUpdatePromptUI.setDesktopState({
        phase: DESKTOP_UPDATE_PHASES.DOWNLOADING,
        versionLabel: state.version,
        progressPercent: 0,
        revealed: true
      });
      if (updater?.download) {
        applyState(await updater.download());
      }
      return;
    }
    if (state.phase === DESKTOP_UPDATE_PHASES.READY_TO_INSTALL) {
      if (shouldDeferQuitAndInstall({ phase: state.phase, busySession: getBusySession() })) {
        sync();
        return;
      }
      await updater?.quitAndInstall?.();
      return;
    }
    if (state.phase === DESKTOP_UPDATE_PHASES.DOWNLOADING) {
      sync();
    }
  };

  const onRetry = async () => {
    softUpdatePromptUI.setDesktopState({
      phase: DESKTOP_UPDATE_PHASES.DOWNLOADING,
      versionLabel: state.version,
      progressPercent: 0,
      revealed: true
    });
    if (updater?.download) {
      applyState(await updater.download());
    }
  };

  const onSkip = async () => {
    if (updater?.skip) {
      applyState(await updater.skip());
      return;
    }
    applyState({
      phase: DESKTOP_UPDATE_PHASES.SKIPPED,
      version: state.version,
      skippedVersion: state.version
    });
  };

  softUpdatePromptUI.setHandlers({
    onUpdate: () => {
      void onPrimary();
    },
    onRetry: () => {
      void onRetry();
    },
    onSkip: () => {
      void onSkip();
    }
  });

  if (updater?.onState) {
    unsubState = updater.onState((payload) => {
      if (disposed) return;
      applyState(payload);
    });
  }

  if (updater?.getState) {
    void updater.getState().then((payload) => {
      if (!disposed) applyState(payload);
    });
  }

  if (devFake && readForceDesktopUpdateFlag(locationSearch)) {
    if (updater?.fakeState) {
      void updater.fakeState({ phase: 'available' }).then((payload) => {
        if (!disposed) applyState(payload);
      });
    } else {
      applyState({
        phase: DESKTOP_UPDATE_PHASES.AVAILABLE,
        version: 'dev'
      });
    }
  } else if (updater?.check) {
    setTimeout(() => {
      if (!disposed) void updater.check?.().then((payload) => applyState(payload));
    }, 2500);
  }

  const api = {
    sync: () => sync(),
    get state() {
      return { ...state };
    },
    dispose() {
      disposed = true;
      unsubState();
    }
  };

  return api;
}
