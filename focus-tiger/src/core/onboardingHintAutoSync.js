/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Idle onboarding hint sync (pulses only) — keeps main.js off the architecture gate.
 * @param {object} opts
 * @param {() => object | null | undefined} opts.getHints OnboardingHintsUI instance
 * @param {() => object} opts.getScene
 * @param {(scene: object) => string[]} opts.resolveAutoHintIds
 * @param {{ bumpBeforeHintSync: () => number }} opts.discoveryIdleVisit
 */
export function createOnboardingHintAutoSync({
  getHints,
  getScene,
  resolveAutoHintIds,
  discoveryIdleVisit
}) {
  let syncing = false;
  return function syncOnboardingAutoHints() {
    const hints = getHints();
    if (!hints || syncing) return;
    syncing = true;
    try {
      const visitGen = discoveryIdleVisit.bumpBeforeHintSync();
      const ids = resolveAutoHintIds(getScene());
      hints.syncVisibleAutos(ids);
      hints.noteDiscoveryIdleVisit?.(visitGen);
      requestAnimationFrame(() => {
        hints.repositionAll?.();
        hints.syncDiscoveryDots?.();
      });
    } finally {
      syncing = false;
    }
  };
}