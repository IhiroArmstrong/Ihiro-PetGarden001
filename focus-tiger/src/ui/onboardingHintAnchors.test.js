import test from 'node:test';
import assert from 'node:assert/strict';
import { ONBOARDING_HINT_ANCHORS } from './onboardingHintAnchors.js';

test('ambient hints: music mute (top-right) vs Sound fab (bottom-right) must differ', () => {
  const gated = ONBOARDING_HINT_ANCHORS['ambient-gated'];
  const music = ONBOARDING_HINT_ANCHORS['ambient-soundscape'];
  assert.ok(gated);
  assert.ok(music);
  assert.equal(gated.selector, '.ambient-soundscape__fab');
  assert.equal(music.selector, '.ambient-soundscape__mute');
  assert.notEqual(gated.selector, music.selector);
});
