import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPANION_MODE_SELECT_COMMIT_OUTCOMES,
  SESSION_UI_GATE_BEHAVIOR_CONTRACTS,
  SESSION_UI_GATE_FIELDS
} from './sessionUiGateContractRegistry.js';
import { resolveCompanionModeSelectCommit } from './SessionUiGate.js';

test('registry field ids are unique', () => {
  const ids = SESSION_UI_GATE_FIELDS.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('registry behavior contract ids are unique', () => {
  const ids = SESSION_UI_GATE_BEHAVIOR_CONTRACTS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('COMPANION_MODE_SELECT_COMMIT_OUTCOMES matches resolveCompanionModeSelectCommit return values', () => {
  const observed = new Set();
  observed.add(
    resolveCompanionModeSelectCommit({
      canBegin: true,
      needsArrivalAction: 'ignore'
    })
  );
  observed.add(
    resolveCompanionModeSelectCommit({
      canBegin: false,
      needsArrivalAction: 'start-arrival'
    })
  );
  observed.add(
    resolveCompanionModeSelectCommit({
      canBegin: false,
      needsArrivalAction: 'ignore'
    })
  );
  assert.deepEqual([...observed].sort(), [...COMPANION_MODE_SELECT_COMMIT_OUTCOMES].sort());
});
