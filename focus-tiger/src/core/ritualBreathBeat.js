/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Shared inhale/exhale phase helpers for RitualFlow breath steps.
 * Reuses MicroRitual beat constants — does not open MicroRitualUI or completeMicroRitual.
 */

export {
  MICRO_RITUAL_BREATH_PHASE_MS,
  isInhalePhase,
  shouldCompleteMicroRitualByWallClock
} from './MicroRitual.js';
