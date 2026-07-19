import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPANION_GESTURE_CHAINS,
  COMPANION_GESTURE_ONESHOTS
} from './companionGestureCatalog.js';

test('gaze lookaround is a single combined chain (p1→p4)', () => {
  assert.equal(COMPANION_GESTURE_CHAINS.length, 1);
  const chain = COMPANION_GESTURE_CHAINS[0];
  assert.equal(chain.id, 'gazeLookAround');
  assert.deepEqual(chain.sequences, [
    'gazeP1CenterBlinkLeft',
    'gazeP2LeftToUp',
    'gazeP3TowardRight',
    'gazeP4RightToDown'
  ]);
});

test('blinkBreathe oneshot is listed for Rise', () => {
  const blink = COMPANION_GESTURE_ONESHOTS.find((g) => g.id === 'blinkBreathe');
  assert.ok(blink);
  assert.equal(blink.sequence, 'blinkBreathe');
  assert.match(blink.suggestedUses, /Rise/);
});
