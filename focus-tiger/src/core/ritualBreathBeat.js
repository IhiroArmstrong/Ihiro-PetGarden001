/**
 * Shared inhale/exhale phase helpers for RitualFlow breath steps.
 * Reuses MicroRitual beat constants — does not open MicroRitualUI or completeMicroRitual.
 */

export {
  MICRO_RITUAL_BREATH_PHASE_MS,
  isInhalePhase,
  shouldCompleteMicroRitualByWallClock
} from './MicroRitual.js';
