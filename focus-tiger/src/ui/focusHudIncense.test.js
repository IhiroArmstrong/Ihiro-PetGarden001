import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { focusLevelToIncenseVars } from './focusHudIncense.js';

describe('focusLevelToIncenseVars', () => {
  it('clamps below 0 and above 1', () => {
    assert.equal(focusLevelToIncenseVars(-0.5).fill, 0);
    assert.equal(focusLevelToIncenseVars(1.5).fill, 1);
  });

  it('scales smoke and ring opacity with fill (metaphor, not scoreboard)', () => {
    const low = focusLevelToIncenseVars(0);
    const high = focusLevelToIncenseVars(1);
    assert.ok(high.smokeOpacity > low.smokeOpacity);
    assert.ok(high.ringOpacity > low.ringOpacity);
    assert.ok(low.smokeOpacity > 0);
    assert.ok(low.ringOpacity > 0);
  });
});
