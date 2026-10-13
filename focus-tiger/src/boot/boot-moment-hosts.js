/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A7.2: Recover card / compass / witness chrome / Support modal bindings.
 * Created at the start of moment-hosts boot so Recover / glass / leave
 * helpers never TDZ. Construct sites stay where they were in `init()`.
 */

import { CalmActionRecoverCardUI } from '../ui/CalmActionRecoverCardUI.js';
import { FiveMomentsCompassUI } from '../ui/FiveMomentsCompassUI.js';
import { FocusCircleWitnessChrome } from '../ui/FocusCircleWitnessChrome.js';
import { SupportYinModalUI } from '../ui/SupportYinModalUI.js';

export function createBootMomentHostsState() {
  return {
    calmActionRecoverCardUI: /** @type {CalmActionRecoverCardUI | null} */ (null),
    fiveMomentsCompassUI: /** @type {FiveMomentsCompassUI | null} */ (null),
    focusCircleWitnessChrome: /** @type {FocusCircleWitnessChrome | null} */ (null),
    supportYinModalUI: /** @type {SupportYinModalUI | null} */ (null)
  };
}

export function mountCalmActionRecoverCard(
  state,
  overlayRoot,
  store,
  { RecoverCardUI = CalmActionRecoverCardUI } = {}
) {
  state.calmActionRecoverCardUI = new RecoverCardUI(overlayRoot, store);
  return state.calmActionRecoverCardUI;
}

export function mountFiveMomentsCompass(
  state,
  root,
  handlers,
  { CompassUI = FiveMomentsCompassUI } = {}
) {
  state.fiveMomentsCompassUI = new CompassUI(root, handlers);
  return state.fiveMomentsCompassUI;
}

export function mountFocusCircleWitnessChrome(
  state,
  root,
  handlers,
  { WitnessChromeUI = FocusCircleWitnessChrome } = {}
) {
  state.focusCircleWitnessChrome = new WitnessChromeUI(root, handlers);
  return state.focusCircleWitnessChrome;
}

export function mountSupportYinModal(
  state,
  root,
  handlers,
  { SupportModalUI = SupportYinModalUI } = {}
) {
  state.supportYinModalUI = new SupportModalUI(root, handlers);
  return state.supportYinModalUI;
}
