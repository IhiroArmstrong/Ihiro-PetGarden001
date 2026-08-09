import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  advanceRitualPrompt,
  completeRitualBreath,
  continueWelcome,
  createRitualFlowState,
  finishRitualEnd,
  getCurrentStep,
  getRitualConfig,
  leaveRitualFlow,
  listRitualConfigs,
  selectRitualChip,
  RITUAL_ACCESS_FEATURE_KEYS,
  RITUAL_PERSISTENT_FEATURE_KEYS
} from './RitualFlow.js';

describe('RitualFlow catalog', () => {
  it('exposes three configs with distinct access keys', () => {
    const configs = listRitualConfigs();
    assert.equal(configs.length, 3);
    assert.equal(
      getRitualConfig('morning')?.accessFeatureKey,
      RITUAL_ACCESS_FEATURE_KEYS.morning
    );
    assert.equal(
      getRitualConfig('emotional-reset')?.accessFeatureKey,
      RITUAL_ACCESS_FEATURE_KEYS['emotional-reset']
    );
    assert.equal(
      getRitualConfig('work-transition')?.accessFeatureKey,
      RITUAL_ACCESS_FEATURE_KEYS['work-transition']
    );
  });

  it('morning breath is 30s; emotional-reset breath is 60s', () => {
    const morningBreath = getRitualConfig('morning')?.steps.find(
      (s) => s.kind === 'breath'
    );
    const resetBreath = getRitualConfig('emotional-reset')?.steps.find(
      (s) => s.kind === 'breath'
    );
    assert.equal(morningBreath?.kind === 'breath' && morningBreath.durationMs, 30_000);
    assert.equal(resetBreath?.kind === 'breath' && resetBreath.durationMs, 60_000);
  });

  it('each ritual lists four persistent claim keys', () => {
    for (const id of /** @type {const} */ ([
      'morning',
      'emotional-reset',
      'work-transition'
    ])) {
      assert.equal(RITUAL_PERSISTENT_FEATURE_KEYS[id].length, 4);
    }
  });
});

describe('RitualFlow morning path', () => {
  it('welcome → arrival chip → breath → intention chip → end → complete', () => {
    let state = createRitualFlowState('morning');
    assert.equal(getCurrentStep(state)?.kind, 'welcome');
    state = continueWelcome(state);
    assert.equal(getCurrentStep(state)?.kind, 'chips');
    state = selectRitualChip(state, 'calm');
    assert.equal(state.selections.arrival, 'calm');
    assert.equal(getCurrentStep(state)?.kind, 'breath');
    state = completeRitualBreath(state);
    assert.equal(getCurrentStep(state)?.kind, 'chips');
    state = selectRitualChip(state, 'kindness');
    assert.equal(state.selections.intention, 'kindness');
    assert.equal(getCurrentStep(state)?.kind, 'end');
    state = finishRitualEnd(state);
    assert.equal(state.completed, true);
  });

  it('rejects unknown chip without advancing', () => {
    let state = createRitualFlowState('morning');
    state = continueWelcome(state);
    const before = state.stepIndex;
    state = selectRitualChip(state, 'nope');
    assert.equal(state.stepIndex, before);
    assert.equal(state.selections.arrival, undefined);
  });
});

describe('RitualFlow emotional-reset path', () => {
  it('ends after breath without prompts', () => {
    let state = createRitualFlowState('emotional-reset');
    state = continueWelcome(state);
    state = selectRitualChip(state, 'tired');
    state = completeRitualBreath(state);
    assert.equal(getCurrentStep(state)?.kind, 'end');
    state = finishRitualEnd(state);
    assert.equal(state.completed, true);
  });
});

describe('RitualFlow work-transition prompts', () => {
  it('two skippable prompts then end', () => {
    let state = createRitualFlowState('work-transition');
    state = continueWelcome(state);
    state = completeRitualBreath(state);
    assert.equal(getCurrentStep(state)?.kind, 'prompts');
    assert.equal(state.promptIndex, 0);
    state = advanceRitualPrompt(state, { skipped: true });
    assert.equal(state.promptIndex, 1);
    assert.equal(state.selections.prompt_0, 'skipped');
    state = advanceRitualPrompt(state, { skipped: false });
    assert.equal(getCurrentStep(state)?.kind, 'end');
    assert.equal(state.selections.prompt_1, 'continued');
    state = finishRitualEnd(state);
    assert.equal(state.completed, true);
  });
});

describe('RitualFlow leave', () => {
  it('marks leftEarly and not completed', () => {
    let state = createRitualFlowState('morning');
    state = continueWelcome(state);
    state = leaveRitualFlow(state);
    assert.equal(state.leftEarly, true);
    assert.equal(state.completed, false);
  });
});
