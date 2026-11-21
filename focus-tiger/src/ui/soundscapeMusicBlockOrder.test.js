/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SOUNDSCAPE_MUSIC_BLOCK_KEYS,
  soundscapeMusicBlockNodes
} from './soundscapeMusicBlockOrder.js';

test('soundscape music block lists tracks before the upload row', () => {
  assert.equal(
    SOUNDSCAPE_MUSIC_BLOCK_KEYS.indexOf('trackRow') <
      SOUNDSCAPE_MUSIC_BLOCK_KEYS.indexOf('uploadRow'),
    true
  );
  assert.equal(
    SOUNDSCAPE_MUSIC_BLOCK_KEYS.indexOf('trackRow') <
      SOUNDSCAPE_MUSIC_BLOCK_KEYS.indexOf('uploadHintEl'),
    true
  );
  const ui = Object.fromEntries(
    SOUNDSCAPE_MUSIC_BLOCK_KEYS.map((key) => [key, { key }])
  );
  const nodes = soundscapeMusicBlockNodes(ui);
  assert.deepEqual(
    nodes.map((n) => n.key),
    [...SOUNDSCAPE_MUSIC_BLOCK_KEYS]
  );
});
