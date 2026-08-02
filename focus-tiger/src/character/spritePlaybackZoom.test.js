import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { playbackZoomAtIndex } from './spritePlaybackZoom.js';

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
