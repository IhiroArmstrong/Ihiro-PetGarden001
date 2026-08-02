import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MEDITATION_STAR_REWARD_WIDTH_FILL_ZOOM,
  playbackZoomAtIndex
} from './spritePlaybackZoom.js';

describe('playbackZoomAtIndex', () => {
  it('maps first frame to from and last to to', () => {
    assert.equal(playbackZoomAtIndex(0, 63, 1, 1.58), 1);
    assert.equal(playbackZoomAtIndex(62, 63, 1, 1.58), 1.58);
  });

  it('interpolates linearly at mid frame', () => {
    const mid = playbackZoomAtIndex(31, 63, 1, 1.58);
    assert.ok(Math.abs(mid - (1 + 1.58) / 2) < 1e-9);
  });

  it('single-frame sequence stays at from', () => {
    assert.equal(playbackZoomAtIndex(0, 1, 1, 1.58), 1);
  });
});

describe('MEDITATION_STAR_REWARD_WIDTH_FILL_ZOOM', () => {
  it('is 16/11 so 1056×864 contain fills 16:9 width', () => {
    assert.equal(MEDITATION_STAR_REWARD_WIDTH_FILL_ZOOM, 16 / 11);
    // At scale 1, plate width / viewport = (1056/864)/(16/9) = 11/16
    assert.equal((1056 / 864) / (16 / 9), 11 / 16);
    assert.equal(1 / (11 / 16), 16 / 11);
  });
});
