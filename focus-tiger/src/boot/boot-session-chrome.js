/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A7.4: Session chrome gate / Choose-pending box / Arrival auto-start flags.
 * Created before chrome helpers so those closures never TDZ.
 * `SessionUiGate` and `createSessionChromeSync` stay at the existing
 * construct site in `init()`.
 */

import { SessionUiGate } from '../core/SessionUiGate.js';

export function createBootSessionChromeState() {
  return {
    sessionUiGate: /** @type {SessionUiGate | null} */ (null),
    postChooseChrome: { pending: false },
    syncArrivalGateReady: /** @type {(ready: boolean) => void} */ (
      () => {}
    ),
    syncHonestyIdleEntry: /** @type {() => void} */ (() => {}),
    pendingAutoStartMode: /** @type {string | null} */ (null),
    arrivalChoseThisRun: false,
    suppressCompanionOpenAfterNod: false
  };
}

export function mountSessionUiGate(state, { Gate = SessionUiGate } = {}) {
  state.sessionUiGate = new Gate();
  return state.sessionUiGate;
}

/**
 * Bind chrome sync helpers onto the same bag after `createSessionChromeSync`.
 * @param {ReturnType<typeof createBootSessionChromeState>} state
 * @param {{
 *   syncArrivalGateReady: (ready: boolean) => void,
 *   syncHonestyIdleEntry: () => void
 * }} api
 */
export function attachSessionChromeSync(state, api) {
  state.syncArrivalGateReady = api.syncArrivalGateReady;
  state.syncHonestyIdleEntry = api.syncHonestyIdleEntry;
  return api;
}
