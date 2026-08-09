/**
 * Config-driven multi-step RitualFlow (advanced scenes).
 * Pure logic — no DOM. Breath wall-clock is owned by RitualFlowUI.
 *
 * Free MicroRitual stays separate; this module does not call completeMicroRitual.
 */

/** @typedef {'morning' | 'emotional-reset' | 'work-transition'} RitualId */
/** @typedef {'welcome' | 'chips' | 'breath' | 'prompts' | 'end'} RitualStepKind */

/**
 * @typedef {{
 *   id: string,
 *   labelKey: string
 * }} RitualChipOption
 *
 * @typedef {{
 *   kind: 'welcome',
 *   bodyKey: string
 * } | {
 *   kind: 'chips',
 *   promptKey: string,
 *   field: string,
 *   options: readonly RitualChipOption[]
 * } | {
 *   kind: 'breath',
 *   durationMs: number,
 *   guideKey?: string
 * } | {
 *   kind: 'prompts',
 *   promptKeys: readonly string[]
 * } | {
 *   kind: 'end',
 *   bodyKey?: string
 * }} RitualStepDef
 *
 * @typedef {{
 *   id: RitualId,
 *   accessFeatureKey: string,
 *   persistentFeatureKeys: readonly string[],
 *   menuProxy: string,
 *   menuLabelKey: string,
 *   completeToastKey: string,
 *   steps: readonly RitualStepDef[]
 * }} RitualConfig
 *
 * @typedef {{
 *   ritualId: RitualId,
 *   stepIndex: number,
 *   selections: Record<string, string>,
 *   promptIndex: number,
 *   leftEarly: boolean,
 *   completed: boolean
 * }} RitualFlowState
 */

export const RITUAL_IDS = Object.freeze({
  MORNING: 'morning',
  EMOTIONAL_RESET: 'emotional-reset',
  WORK_TRANSITION: 'work-transition'
});

/** Menu proxy keys (Idle More / narrow drawer). */
export const RITUAL_MENU_PROXIES = Object.freeze({
  morning: 'ritual-morning',
  'emotional-reset': 'ritual-emotional-reset',
  'work-transition': 'ritual-work-transition'
});

export const RITUAL_ACCESS_FEATURE_KEYS = Object.freeze({
  morning: 'ritual.morning.access',
  'emotional-reset': 'ritual.emotional-reset.access',
  'work-transition': 'ritual.work-transition.access'
});

export const RITUAL_PERSISTENT_FEATURE_KEYS = Object.freeze({
  morning: Object.freeze([
    'ritual.morning.history',
    'ritual.morning.memento',
    'ritual.morning.copy-unlocked',
    'ritual.morning.sfx-unlocked'
  ]),
  'emotional-reset': Object.freeze([
    'ritual.emotional-reset.history',
    'ritual.emotional-reset.memento',
    'ritual.emotional-reset.copy-unlocked',
    'ritual.emotional-reset.sfx-unlocked'
  ]),
  'work-transition': Object.freeze([
    'ritual.work-transition.history',
    'ritual.work-transition.memento',
    'ritual.work-transition.copy-unlocked',
    'ritual.work-transition.sfx-unlocked'
  ])
});

/** @type {Readonly<Record<RitualId, RitualConfig>>} */
export const RITUAL_CATALOG = Object.freeze({
  morning: Object.freeze({
    id: 'morning',
    accessFeatureKey: RITUAL_ACCESS_FEATURE_KEYS.morning,
    persistentFeatureKeys: RITUAL_PERSISTENT_FEATURE_KEYS.morning,
    menuProxy: RITUAL_MENU_PROXIES.morning,
    menuLabelKey: 'ritual.morning.menu',
    completeToastKey: 'ritual.morning.complete',
    steps: Object.freeze([
      Object.freeze({
        kind: 'welcome',
        bodyKey: 'ritual.morning.welcome'
      }),
      Object.freeze({
        kind: 'chips',
        promptKey: 'ritual.morning.arrival_prompt',
        field: 'arrival',
        options: Object.freeze([
          Object.freeze({ id: 'calm', labelKey: 'ritual.morning.chip.calm' }),
          Object.freeze({ id: 'busy', labelKey: 'ritual.morning.chip.busy' }),
          Object.freeze({ id: 'heavy', labelKey: 'ritual.morning.chip.heavy' })
        ])
      }),
      Object.freeze({
        kind: 'breath',
        durationMs: 30_000,
        guideKey: 'ritual.shared.breath_guide'
      }),
      Object.freeze({
        kind: 'chips',
        promptKey: 'ritual.morning.intention_prompt',
        field: 'intention',
        options: Object.freeze([
          Object.freeze({
            id: 'focus',
            labelKey: 'ritual.morning.chip.focus'
          }),
          Object.freeze({
            id: 'patience',
            labelKey: 'ritual.morning.chip.patience'
          }),
          Object.freeze({
            id: 'creativity',
            labelKey: 'ritual.morning.chip.creativity'
          }),
          Object.freeze({
            id: 'kindness',
            labelKey: 'ritual.morning.chip.kindness'
          })
        ])
      }),
      Object.freeze({ kind: 'end', bodyKey: 'ritual.morning.end' })
    ])
  }),

  'emotional-reset': Object.freeze({
    id: 'emotional-reset',
    accessFeatureKey: RITUAL_ACCESS_FEATURE_KEYS['emotional-reset'],
    persistentFeatureKeys: RITUAL_PERSISTENT_FEATURE_KEYS['emotional-reset'],
    menuProxy: RITUAL_MENU_PROXIES['emotional-reset'],
    menuLabelKey: 'ritual.emotional_reset.menu',
    completeToastKey: 'ritual.emotional_reset.complete',
    steps: Object.freeze([
      Object.freeze({
        kind: 'welcome',
        bodyKey: 'ritual.emotional_reset.welcome'
      }),
      Object.freeze({
        kind: 'chips',
        promptKey: 'ritual.emotional_reset.emotion_prompt',
        field: 'emotion',
        options: Object.freeze([
          Object.freeze({
            id: 'anxious',
            labelKey: 'ritual.emotional_reset.chip.anxious'
          }),
          Object.freeze({
            id: 'frustrated',
            labelKey: 'ritual.emotional_reset.chip.frustrated'
          }),
          Object.freeze({
            id: 'tired',
            labelKey: 'ritual.emotional_reset.chip.tired'
          })
        ])
      }),
      Object.freeze({
        kind: 'breath',
        durationMs: 60_000,
        guideKey: 'ritual.emotional_reset.breath_guide'
      }),
      Object.freeze({ kind: 'end', bodyKey: 'ritual.emotional_reset.end' })
    ])
  }),

  'work-transition': Object.freeze({
    id: 'work-transition',
    accessFeatureKey: RITUAL_ACCESS_FEATURE_KEYS['work-transition'],
    persistentFeatureKeys: RITUAL_PERSISTENT_FEATURE_KEYS['work-transition'],
    menuProxy: RITUAL_MENU_PROXIES['work-transition'],
    menuLabelKey: 'ritual.work_transition.menu',
    completeToastKey: 'ritual.work_transition.complete',
    steps: Object.freeze([
      Object.freeze({
        kind: 'welcome',
        bodyKey: 'ritual.work_transition.welcome'
      }),
      Object.freeze({
        kind: 'breath',
        durationMs: 30_000,
        guideKey: 'ritual.shared.breath_guide'
      }),
      Object.freeze({
        kind: 'prompts',
        promptKeys: Object.freeze([
          'ritual.work_transition.prompt.stay',
          'ritual.work_transition.prompt.home'
        ])
      }),
      Object.freeze({ kind: 'end', bodyKey: 'ritual.work_transition.end' })
    ])
  })
});

/**
 * @param {string} ritualId
 * @returns {ritualId is RitualId}
 */
export function isRitualId(ritualId) {
  return Object.prototype.hasOwnProperty.call(RITUAL_CATALOG, ritualId);
}

/**
 * @param {string} ritualId
 * @returns {RitualConfig | null}
 */
export function getRitualConfig(ritualId) {
  if (!isRitualId(ritualId)) return null;
  return RITUAL_CATALOG[ritualId];
}

/** @returns {RitualConfig[]} */
export function listRitualConfigs() {
  return /** @type {RitualId[]} */ (Object.keys(RITUAL_CATALOG)).map(
    (id) => RITUAL_CATALOG[id]
  );
}

/**
 * @param {RitualId} ritualId
 * @returns {RitualFlowState}
 */
export function createRitualFlowState(ritualId) {
  if (!isRitualId(ritualId)) {
    throw new Error(`[RitualFlow] unknown ritualId "${ritualId}"`);
  }
  return {
    ritualId,
    stepIndex: 0,
    selections: {},
    promptIndex: 0,
    leftEarly: false,
    completed: false
  };
}

/**
 * @param {RitualFlowState} state
 * @returns {RitualStepDef | null}
 */
export function getCurrentStep(state) {
  const config = getRitualConfig(state.ritualId);
  if (!config) return null;
  return config.steps[state.stepIndex] ?? null;
}

/**
 * @param {RitualFlowState} state
 * @returns {RitualFlowState}
 */
export function advanceRitualStep(state) {
  const config = getRitualConfig(state.ritualId);
  if (!config || state.completed || state.leftEarly) return { ...state };
  const nextIndex = state.stepIndex + 1;
  if (nextIndex >= config.steps.length) {
    return { ...state, completed: true };
  }
  const nextStep = config.steps[nextIndex];
  return {
    ...state,
    stepIndex: nextIndex,
    promptIndex: nextStep?.kind === 'prompts' ? 0 : state.promptIndex,
    completed: nextStep?.kind === 'end' ? false : state.completed
  };
}

/**
 * Welcome Continue / auto-advance.
 * @param {RitualFlowState} state
 */
export function continueWelcome(state) {
  const step = getCurrentStep(state);
  if (!step || step.kind !== 'welcome') return { ...state };
  return advanceRitualStep(state);
}

/**
 * @param {RitualFlowState} state
 * @param {string} chipId
 */
export function selectRitualChip(state, chipId) {
  const step = getCurrentStep(state);
  if (!step || step.kind !== 'chips') return { ...state };
  const valid = step.options.some((opt) => opt.id === chipId);
  if (!valid) return { ...state };
  const next = {
    ...state,
    selections: { ...state.selections, [step.field]: chipId }
  };
  return advanceRitualStep(next);
}

/**
 * Breath wall-clock finished (UI timer).
 * @param {RitualFlowState} state
 */
export function completeRitualBreath(state) {
  const step = getCurrentStep(state);
  if (!step || step.kind !== 'breath') return { ...state };
  return advanceRitualStep(state);
}

/**
 * Advance one prompt (Continue or Skip).
 * @param {RitualFlowState} state
 * @param {{ skipped?: boolean }} [opts]
 */
export function advanceRitualPrompt(state, { skipped = false } = {}) {
  const step = getCurrentStep(state);
  if (!step || step.kind !== 'prompts') return { ...state };
  const field = `prompt_${state.promptIndex}`;
  const nextSelections = {
    ...state.selections,
    [field]: skipped ? 'skipped' : 'continued'
  };
  const nextIndex = state.promptIndex + 1;
  if (nextIndex < step.promptKeys.length) {
    return {
      ...state,
      selections: nextSelections,
      promptIndex: nextIndex
    };
  }
  return advanceRitualStep({
    ...state,
    selections: nextSelections,
    promptIndex: nextIndex
  });
}

/**
 * End step acknowledged (or auto).
 * @param {RitualFlowState} state
 */
export function finishRitualEnd(state) {
  const step = getCurrentStep(state);
  if (!step || step.kind !== 'end') return { ...state };
  return { ...state, completed: true };
}

/**
 * Quiet leave — no completion record.
 * @param {RitualFlowState} state
 */
export function leaveRitualFlow(state) {
  return { ...state, leftEarly: true, completed: false };
}

/**
 * @param {RitualFlowState} state
 */
export function isRitualFlowDone(state) {
  return Boolean(state.completed || state.leftEarly);
}
