import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFramePaths } from './CharacterConfig.js';

test('buildFramePaths supports a non-default start frame', () => {
  const paths = buildFramePaths('halo-breathing', 3, { startFrame: 7 });

  assert.deepEqual(paths, [
    '/sprites/tiger-cub/monk-robe-default/halo-breathing/frame_007.png',
    '/sprites/tiger-cub/monk-robe-default/halo-breathing/frame_008.png',
    '/sprites/tiger-cub/monk-robe-default/halo-breathing/frame_009.png'
  ]);
});
