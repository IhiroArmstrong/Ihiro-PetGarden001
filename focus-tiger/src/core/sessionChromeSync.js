/**
 * Session chrome 同步：Idle 入口（Honesty / 微仪式）与叠层门闩 / 窄宽壳投影。
 * 从 `main.js` 等价抽离，行为不变；可变态仍由 SessionUiGate + UI 实例持有。
 *
 * @see docs/SHARED_RESOURCES.md §4
 */

import { computePostSessionOverlayActive } from './SessionUiGate.js';
import { STATES } from './StateManager.js';
import { resolveShellChromeProjection } from './idleChromeOrchestration.js';

/**
 * Honesty 时长/呼吸/致谢阶段占用中（挡住微仪式 Idle 入口）。
 * 单一入口：勿在 main / shell 再复制 phase 枚举。
 *
 * @param {string | null | undefined} phase
 * @returns {boolean}
 */
export function isHonestyPhaseBusy(phase) {
  return phase === 'duration' || phase === 'breath' || phase === 'thanks';
}

/**
 * Honesty UI 非 hidden（含 prompt）——窄/宽壳 suppress 等用；与 {@link isHonestyPhaseBusy} 区分。
 *
 * @param {string | null | undefined} phase
 * @returns {boolean}
 */
export function isHonestyUiBusy(phase) {
  return Boolean(phase) && phase !== 'hidden';
}

/**
 * @typedef {object} SessionChromeSyncDeps
 * @property {() => { isVisible?: () => boolean } | null | undefined} getHonestyBridge
 * @property {() => { isOpen?: () => boolean } | null | undefined} getArrivalPractice
 * @property {() => { isOpen?: () => boolean } | null | undefined} getReflectionMoment
 * @property {() => {
 *   isOpen?: () => boolean,
 *   hideIdleEntry?: () => void,
 *   showIdleEntry?: () => void
 * } | null | undefined} getMicroRitualUI
 * @property {{ phase: string, hideIdleEntry: () => void }} honestyCheckInUI
 * @property {{ syncIdleEntry: () => void }} honestyCheckIn
 * @property {{
 *   setHonestyBridgeActive: (v: boolean) => void,
 *   setPostSessionOverlayActive: (v: boolean) => void,
 *   setOptionSelectEnabled: (v: boolean) => void,
 *   setArrivalReady: (v: boolean) => void,
 *   setArrivalActive?: (v: boolean) => void
 * }} companionModePicker
 * @property {{
 *   setIdle: (v: boolean) => void,
 *   setSuppressed: (v: boolean, opts?: { keepQuickStart?: boolean }) => void
 * }} narrowIdleShell
 * @property {{
 *   setIdle: (v: boolean) => void,
 *   setSuppressed: (v: boolean) => void
 * }} wideIdleMoreMenu
 * @property {{ state: string }} stateManager
 * @property {{
 *   completionPending: boolean,
 *   setPostSessionOverlayActive: (v: boolean) => void,
 *   setArrivalGateReady: (v: boolean) => void
 * }} sessionUiGate
 * @property {() => void} syncInAppReminderBanner
 */

/**
 * @param {SessionChromeSyncDeps} deps
 */
export function createSessionChromeSync(deps) {
  const {
    getHonestyBridge,
    getArrivalPractice,
    getReflectionMoment,
    getMicroRitualUI,
    honestyCheckInUI,
    honestyCheckIn,
    companionModePicker,
    narrowIdleShell,
    wideIdleMoreMenu,
    stateManager,
    sessionUiGate,
    syncInAppReminderBanner
  } = deps;

  function getPostSessionOverlaySources() {
    return [
      () => getArrivalPractice().isOpen(),
      () => getReflectionMoment().isOpen(),
      () => getMicroRitualUI()?.isOpen() === true
    ];
  }

  function syncMicroRitualIdleEntry() {
    const honestyBusy = isHonestyPhaseBusy(honestyCheckInUI.phase);
    const blocked =
      getArrivalPractice()?.isOpen?.() ||
      getHonestyBridge()?.isVisible?.() ||
      getReflectionMoment()?.isOpen?.() ||
      getMicroRitualUI()?.isOpen?.() ||
      honestyBusy ||
      stateManager.state === STATES.FOCUSING ||
      stateManager.state === STATES.CELEBRATE;
    if (blocked) {
      getMicroRitualUI()?.hideIdleEntry();
      return;
    }
    getMicroRitualUI()?.showIdleEntry();
  }

  function syncHonestyIdleEntry() {
    const bridgeVisible = getHonestyBridge()?.isVisible?.() === true;
    companionModePicker.setHonestyBridgeActive(bridgeVisible);
    const blocked =
      getArrivalPractice()?.isOpen?.() ||
      bridgeVisible ||
      getReflectionMoment()?.isOpen?.() ||
      getMicroRitualUI()?.isOpen?.() ||
      stateManager.state === STATES.FOCUSING ||
      stateManager.state === STATES.CELEBRATE;
    if (blocked) {
      honestyCheckInUI.hideIdleEntry();
    } else {
      honestyCheckIn.syncIdleEntry();
    }
    syncMicroRitualIdleEntry();
    const honestyBusy = isHonestyUiBusy(honestyCheckInUI?.phase);
    const overlayActive = computePostSessionOverlayActive(
      getPostSessionOverlaySources()
    );
    const focusing =
      stateManager.state === STATES.FOCUSING ||
      getMicroRitualUI()?.isOpen?.() === true;
    // Bridge can appear without a full resync — keep wide ⋯ suppressed with dock pills
    const { wide } = resolveShellChromeProjection({
      focusing,
      overlayActive,
      honestyBusy,
      arrivalOpen: Boolean(getArrivalPractice()?.isOpen?.()),
      bridgeVisible
    });
    wideIdleMoreMenu.setSuppressed(wide.suppressed);
  }

  function resyncSessionChrome() {
    const overlayActive = computePostSessionOverlayActive(
      getPostSessionOverlaySources()
    );
    sessionUiGate.setPostSessionOverlayActive(overlayActive);
    companionModePicker.setPostSessionOverlayActive(overlayActive);
    companionModePicker.setOptionSelectEnabled(
      !overlayActive && !sessionUiGate.completionPending
    );
    companionModePicker.setArrivalActive?.(
      Boolean(getArrivalPractice()?.isOpen?.())
    );
    const arrivalOpen = Boolean(getArrivalPractice()?.isOpen?.());
    const focusing =
      stateManager.state === STATES.FOCUSING ||
      getMicroRitualUI()?.isOpen?.() === true;
    const honestyBusy = isHonestyUiBusy(honestyCheckInUI?.phase);
    const bridgeVisible = getHonestyBridge()?.isVisible?.() === true;
    // 桥接 Yes/No：须保留 ActionBar；勿因 bridge alone 收起窄屏顶栏
    // Arrival: keep ActionBar + Quick Start; hide Sit/Honesty/grabber.
    // Reflection / Honesty busy: suppress grabber/home/sheet; ActionBar stays.
    // ActionBar time = wall clock (not FocusHUD session elapsed).
    // Projection SSOT: idleChromeOrchestration.resolveShellChromeProjection
    const { narrow, wide } = resolveShellChromeProjection({
      focusing,
      overlayActive,
      honestyBusy,
      arrivalOpen,
      bridgeVisible
    });
    narrowIdleShell.setIdle(narrow.idle);
    narrowIdleShell.setSuppressed(narrow.suppressed, {
      keepQuickStart: Boolean(narrow.keepQuickStart)
    });
    wideIdleMoreMenu.setIdle(wide.idle);
    wideIdleMoreMenu.setSuppressed(wide.suppressed);
    syncInAppReminderBanner();
  }

  /** @param {boolean} ready */
  function syncArrivalGateReady(ready) {
    sessionUiGate.setArrivalGateReady(ready);
    companionModePicker.setArrivalReady(ready);
  }

  return {
    syncHonestyIdleEntry,
    syncMicroRitualIdleEntry,
    getPostSessionOverlaySources,
    resyncSessionChrome,
    syncArrivalGateReady
  };
}
