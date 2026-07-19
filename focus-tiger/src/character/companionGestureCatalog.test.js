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

test('cloakSleep oneshot is listed for DORMANT entry (pending wire)', () => {
  const cloak = COMPANION_GESTURE_ONESHOTS.find((g) => g.id === 'cloakSleep');
  assert.ok(cloak);
  assert.equal(cloak.sequence, 'cloakSleep');
  assert.match(cloak.suggestedUses, /DORMANT/);
  assert.match(cloak.suggestedUses, /2c|待接线/);
});

test('riseStretchCasual oneshot is listed for Rise; blinkBreathe retained as debug', () => {
  const rise = COMPANION_GESTURE_ONESHOTS.find((g) => g.id === 'riseStretchCasual');
  assert.ok(rise);
  assert.equal(rise.sequence, 'riseStretchCasual');
  assert.match(rise.suggestedUses, /Rise/);
  const blink = COMPANION_GESTURE_ONESHOTS.find((g) => g.id === 'blinkBreathe');
  assert.ok(blink);
  assert.match(blink.suggestedUses, /调试|riseStretchCasual/);
});
