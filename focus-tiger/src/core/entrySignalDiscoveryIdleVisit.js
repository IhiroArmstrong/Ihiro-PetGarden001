/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * L4 · Idle 进入计数（冷落让位），避免 main.js 膨胀。
 * @see docs/task-briefs/task-entry-signal-ledger.md §8.2
 */

/**
 * @param {object} opts
 * @param {() => object} opts.getScene
 * @param {() => string} opts.getAppState
 * @param {{ IDLE: string, DORMANT: string }} opts.STATES
 */
export function createDiscoveryIdleVisitGate({
  getScene,
  getAppState,
  STATES
}) {
  let visitGen = 0;
  let wasIdle = false;

  return {
    /**
     * Call once before onboarding hint sync on Idle surfaces.
     * @returns {number}
     */
    bumpBeforeHintSync() {
      const scene = getScene?.() || {};
      const idleLike =
        !scene.isFocusing &&
        !scene.reflectionOpen &&
        !scene.arrivalOpen &&
        !scene.microRitualOpen &&
        !scene.honestyBridgeVisible;
      const state = getAppState();
      const isIdle =
        idleLike && (state === STATES.IDLE || state === STATES.DORMANT);
      if (isIdle && !wasIdle) visitGen += 1;
      wasIdle = isIdle;
      return visitGen;
    },
    /** @returns {number} */
    getVisitGen() {
      return visitGen;
    }
  };
}