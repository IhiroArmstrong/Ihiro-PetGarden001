/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * @typedef {'box' | 'relax478' | 'natural'} BreathPresetId
 */

/**
 * @typedef {object} BreathPresetDefinition
 * @property {string} label
 * @property {number} inhale
 * @property {number} hold
 * @property {number} exhale
 * @property {number} defaultCycles
 * @property {{ inhale: string, hold: string, exhale: string }} phaseCopyKeys
 */

/** @type {Record<BreathPresetId, BreathPresetDefinition>} */
export const PRESETS = Object.freeze({
  box: {
    label: '4-4-4 box breathing',
    inhale: 4,
    hold: 4,
    exhale: 4,
    defaultCycles: 4,
    phaseCopyKeys: {
      inhale: 'BREATH_PHASE_INHALE',
      hold: 'BREATH_PHASE_HOLD',
      exhale: 'BREATH_PHASE_EXHALE'
    }
  },
  relax478: {
    label: '4-7-8 relaxing breath',
    inhale: 4,
    hold: 7,
    exhale: 8,
    defaultCycles: 4,
    phaseCopyKeys: {
      inhale: 'BREATH_PHASE_INHALE',
      hold: 'BREATH_PHASE_HOLD',
      exhale: 'BREATH_PHASE_EXHALE'
    }
  },
  natural: {
    label: '4-6 natural breath',
    inhale: 4,
    hold: 0,
    exhale: 6,
    defaultCycles: 4,
    phaseCopyKeys: {
      inhale: 'BREATH_PHASE_INHALE',
      hold: 'BREATH_PHASE_HOLD',
      exhale: 'BREATH_PHASE_EXHALE'
    }
  }
});

export const DEFAULT_PRESET_ID = 'natural';

/** @type {readonly BreathPresetId[]} */
export const PRESET_IDS = Object.freeze(['box', 'relax478', 'natural']);

/**
 * @param {string} [presetId]
 * @param {number} [cycles]
 * @returns {{ presetId: BreathPresetId, preset: BreathPresetDefinition, cycles: number }}
 */
export function resolveBreathPacerConfig(presetId, cycles) {
  const id =
    presetId && presetId in PRESETS
      ? /** @type {BreathPresetId} */ (presetId)
      : DEFAULT_PRESET_ID;
  const preset = PRESETS[id];
  const hasCycles = Number.isFinite(Number(cycles));
  const resolvedCycles = hasCycles
    ? Math.max(1, Math.floor(Number(cycles)))
    : preset.defaultCycles;
  return { presetId: id, preset, cycles: resolvedCycles };
}
