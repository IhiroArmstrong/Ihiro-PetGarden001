import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COMPANION_MODE_STAY,
  COMPANION_MODE_STEP_AWAY,
  COMPANION_MODE_ACROSS_TOOLS
} from './FocusSession.js';
import {
  SessionUiGate,
  computePostSessionOverlayActive,
  resolveCompanionModeSelectCommit
} from './SessionUiGate.js';

describe('SessionUiGate', () => {
  it('未就绪时 canBeginFocusOnCompanionModeSelect 必须为 false（失败契约）', () => {
    const gate = new SessionUiGate();
    assert.equal(gate.arrivalGateReady, false);
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STAY),
      false
    );
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_ACROSS_TOOLS),
      false
    );
  });

  it('门闩就绪后三模式均可 begin', () => {
    const gate = new SessionUiGate();
    gate.setArrivalGateReady(true);
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STAY),
      true
    );
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_ACROSS_TOOLS),
      true
    );
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STEP_AWAY),
      true
    );
  });

  it('完成中 / Arrival 开着 / 专注中 → 不得 begin', () => {
    const gate = new SessionUiGate();
    gate.setArrivalGateReady(true);
    gate.setCompletionPending(true);
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STAY),
      false
    );
    gate.setCompletionPending(false);
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STAY, {
        arrivalOpen: true
      }),
      false
    );
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STAY, {
        isFocusing: true
      }),
      false
    );
  });

  it('resolveSitClickWhenIdle：未就绪 → start-arrival，不得 begin-focus', () => {
    const gate = new SessionUiGate();
    assert.equal(gate.resolveSitClickWhenIdle(), 'start-arrival');
    gate.setArrivalGateReady(true);
    assert.equal(gate.resolveSitClickWhenIdle(), 'begin-focus');
    gate.setCompletionPending(true);
    assert.equal(gate.resolveSitClickWhenIdle(), 'ignore');
  });

  it('resolveAutoStartNeedsArrival：未就绪选 Here & Now → start-arrival', () => {
    const gate = new SessionUiGate();
    assert.equal(
      gate.resolveAutoStartNeedsArrival(COMPANION_MODE_STAY),
      'start-arrival'
    );
    gate.setArrivalGateReady(true);
    assert.equal(
      gate.resolveAutoStartNeedsArrival(COMPANION_MODE_STAY),
      'ignore'
    );
    gate.setArrivalGateReady(false);
    assert.equal(
      gate.resolveAutoStartNeedsArrival(COMPANION_MODE_STEP_AWAY),
      'start-arrival'
    );
  });

  it('叠层激活时 hint 为 ignore', () => {
    const gate = new SessionUiGate();
    assert.equal(gate.resolveCompanionHintClick(), 'toggle');
    gate.setPostSessionOverlayActive(true);
    assert.equal(gate.resolveCompanionHintClick(), 'ignore');
  });

  it('canStartArrivalFromChrome：专注中 / 完成中 / Arrival 开着 → false', () => {
    const gate = new SessionUiGate();
    assert.equal(gate.canStartArrivalFromChrome(), true);
    assert.equal(gate.canStartArrivalFromChrome({ isFocusing: true }), false);
    gate.setCompletionPending(true);
    assert.equal(gate.canStartArrivalFromChrome(), false);
  });
});

describe('computePostSessionOverlayActive', () => {
  it('aggregates with some(); third source works without changing helper', () => {
    assert.equal(computePostSessionOverlayActive([false, false]), false);
    assert.equal(computePostSessionOverlayActive([false, true]), true);
    assert.equal(
      computePostSessionOverlayActive([() => false, () => true]),
      true
    );
    // 扩展第三种叠层：只追加源，不改聚合函数
    assert.equal(
      computePostSessionOverlayActive([false, false, () => true]),
      true
    );
    assert.equal(
      computePostSessionOverlayActive([false, false, () => false]),
      false
    );
  });
});

describe('resolveCompanionModeSelectCommit', () => {
  it('reject 时不得 commit（契约：未通过不写 storage）', () => {
    assert.equal(
      resolveCompanionModeSelectCommit({
        canBegin: false,
        needsArrivalAction: 'ignore'
      }),
      'reject'
    );
  });

  it('Gate 通过开表 / 开 Arrival 才 commit', () => {
    assert.equal(
      resolveCompanionModeSelectCommit({
        canBegin: true,
        needsArrivalAction: 'ignore'
      }),
      'commit-begin'
    );
    assert.equal(
      resolveCompanionModeSelectCommit({
        canBegin: false,
        needsArrivalAction: 'start-arrival'
      }),
      'commit-arrival'
    );
  });
});
