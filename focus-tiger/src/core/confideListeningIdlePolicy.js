/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T38 · Default seated idle: more closed-eye breathing, occasional open arc.
 * @type {{ breathPingpongCycles: number, blinkPingpongCycles: number }}
 */
export const DEFAULT_IDLE_ORCHESTRATOR_TIMING = Object.freeze({
  breathPingpongCycles: 2,
  blinkPingpongCycles: 1
});

/**
 * T38 · Confide panel open: predominantly open-eye listening with lighter blinks.
 * @type {{ breathPingpongCycles: number, blinkPingpongCycles: number }}
 */
export const CONFIDE_LISTENING_IDLE_TIMING = Object.freeze({
  breathPingpongCycles: 1,
  blinkPingpongCycles: 2
});

/**
 * @param {{ breathPingpongCycles?: number, blinkPingpongCycles?: number }} timing
 * @returns {{ breathPingpongCycles: number, blinkPingpongCycles: number }}
 */
export function normalizeIdleOrchestratorTiming(timing = {}) {
  const breath = Math.max(
    1,
    Math.floor(
      Number(timing.breathPingpongCycles) ||
        DEFAULT_IDLE_ORCHESTRATOR_TIMING.breathPingpongCycles
    )
  );
  const blink = Math.max(
    1,
    Math.floor(
      Number(timing.blinkPingpongCycles) ||
        DEFAULT_IDLE_ORCHESTRATOR_TIMING.blinkPingpongCycles
    )
  );
  return { breathPingpongCycles: breath, blinkPingpongCycles: blink };
}
