import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveFocusHudLiveView } from './focusHudLive.js';

describe('resolveFocusHudLiveView', () => {
  it('Idle with no overlay stays idle / zero live', () => {
    const view = resolveFocusHudLiveView({
      state: 'IDLE',
      sessionElapsedSeconds: 0,
      sessionFocusLevel: 0
    });
    assert.equal(view.focusing, false);
    assert.equal(view.displayState, 'IDLE');
    assert.equal(view.elapsedSeconds, 0);
    assert.equal(view.liveSessionMinutes, 0);
  });

  it('micro-ritual overlay drives Focusing timer without FocusSession', () => {
    const view = resolveFocusHudLiveView({
      state: 'IDLE',
      sessionElapsedSeconds: 0,
      sessionFocusLevel: 0,
      treatAsFocusing: true,
      liveElapsedSeconds: 12.4,
      focusLevelOverride: 0.2
    });
    assert.equal(view.focusing, true);
    assert.equal(view.displayState, 'FOCUSING');
    assert.equal(view.elapsedSeconds, 12.4);
    assert.equal(view.level, 0.2);
    assert.ok(Math.abs(view.liveSessionMinutes - 12.4 / 60) < 1e-9);
  });

  it('real FOCUSING still uses session elapsed when no overlay', () => {
    const view = resolveFocusHudLiveView({
      state: 'FOCUSING',
      sessionElapsedSeconds: 45,
      sessionFocusLevel: 0.75
    });
    assert.equal(view.focusing, true);
    assert.equal(view.displayState, 'FOCUSING');
    assert.equal(view.elapsedSeconds, 45);
    assert.equal(view.level, 0.75);
  });
});
