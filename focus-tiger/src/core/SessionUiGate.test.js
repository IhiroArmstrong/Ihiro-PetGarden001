/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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
  resolveCompanionModeSelectCommit,
  shouldEnableFocusChromeButton
} from './SessionUiGate.js';

describe('SessionUiGate', () => {
  it('未就绪时 Here & Now / Flow 不得 begin；Offline 可跳过 Arrival', () => {
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
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STEP_AWAY),
      true,
      'Offline Space 跳过 Arrival'
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
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STEP_AWAY),
      false,
      'Offline 在完成中仍不得 begin'
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

  it('resolveSitClickWhenIdle：Idle 始终 start-arrival（门闩就绪亦不跳过仪式）', () => {
    const gate = new SessionUiGate();
    assert.equal(gate.resolveSitClickWhenIdle(), 'start-arrival');
    gate.setArrivalGateReady(true);
    assert.equal(
      gate.resolveSitClickWhenIdle(),
      'start-arrival',
      'Sit = 重新抵达；开表走 Companion / ⚡'
    );
    gate.setCompletionPending(true);
    assert.equal(gate.resolveSitClickWhenIdle(), 'ignore');
  });

  it('shouldEnableFocusChromeButton：完成中 / 微仪式 → 禁用（防静默 return）', () => {
    assert.equal(shouldEnableFocusChromeButton({}), true);
    assert.equal(
      shouldEnableFocusChromeButton({ completionPending: true }),
      false
    );
    assert.equal(
      shouldEnableFocusChromeButton({ microRitualOpen: true }),
      false
    );
    assert.equal(
      shouldEnableFocusChromeButton({
        completionPending: true,
        microRitualOpen: true
      }),
      false
    );
  });

  it('Arrival 解锁后 clearArrivalGateForFocusStart / AfterRise 不得关掉门闩', () => {
    const gate = new SessionUiGate();
    gate.setArrivalGateReady(true);
    gate.clearArrivalGateForFocusStart();
    assert.equal(gate.arrivalGateReady, true);
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STAY),
      true
    );
    gate.clearArrivalGateAfterRise();
    assert.equal(gate.arrivalGateReady, true);
    assert.equal(
      gate.canBeginFocusOnCompanionModeSelect(COMPANION_MODE_STAY),
      true,
      'Scenario J：Rise 后 Here & Now 须可 begin'
    );
  });

  it('resolveAutoStartNeedsArrival：Here & Now 未就绪 → start-arrival；Offline → ignore', () => {
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
      'ignore',
      'Offline 不得进 Arrival'
    );
    assert.equal(
      gate.resolveAutoStartNeedsArrival(COMPANION_MODE_ACROSS_TOOLS),
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
