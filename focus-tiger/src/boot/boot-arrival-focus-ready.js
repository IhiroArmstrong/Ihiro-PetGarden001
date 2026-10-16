/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * A7.6: Arrival UI assign / FocusInput / first-paint occupancy /
 * taste prefetch starter / loading-mask lift / `__FT_APP_READY__`.
 * Focus bag is created before HUD helpers so those closures never TDZ.
 * Construct, occupancy play, prefetch, and mask lift stay at the
 * existing sites in `init()`. Defaults are not imported here so node
 * unit tests stay DOM-free.
 */

export function createBootArrivalFocusReadyState() {
  return {
    focusInput: /** @type {import('../input/FocusInput.js').FocusInput | null} */ (
      null
    )
  };
}

export function mountArrivalPractice(
  honestyState,
  overlayRoot,
  handlers,
  { ArrivalUI } = {}
) {
  if (typeof ArrivalUI !== 'function') {
    throw new Error('mountArrivalPractice requires ArrivalUI');
  }
  honestyState.arrivalPractice = new ArrivalUI(overlayRoot, handlers);
  return honestyState.arrivalPractice;
}

export function mountFocusInput(state, onStart, onStop, { Input } = {}) {
  if (typeof Input !== 'function') {
    throw new Error('mountFocusInput requires Input');
  }
  state.focusInput = new Input(onStart, onStop);
  return state.focusInput;
}

export function applyBootSpriteOccupancy(sceneAnimState, decision, keepValue) {
  if (decision.occupy && decision.occupy !== keepValue) {
    sceneAnimState.spriteOccupancy = decision.occupy;
  }
  return sceneAnimState.spriteOccupancy;
}

export function createTastePrefetchStarter({
  isOverlayBusy,
  nextDelayMs,
  schedule,
  runPrefetch
}) {
  let firstWaitDone = false;
  function startOnce() {
    const delayMs = nextDelayMs({
      overlayBusy: isOverlayBusy(),
      firstWaitDone
    });
    if (delayMs > 0) {
      if (!firstWaitDone && delayMs >= 12000) {
        firstWaitDone = true;
      }
      schedule(startOnce, delayMs);
      return;
    }
    runPrefetch();
  }
  return { startOnce };
}

export function scheduleLiftLoadingMask(raf, lift) {
  raf(lift);
}

export function markAppReady(target, { EventCtor = Event } = {}) {
  target.__FT_APP_READY__ = true;
  if (typeof target.dispatchEvent === 'function') {
    target.dispatchEvent(new EventCtor('ft:app-ready'));
  }
  return true;
}
