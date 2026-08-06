import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ZEN_CINEMA_THUMB_SRC,
  ZEN_CINEMA_YOUTUBE_URL,
  openZenCinemaExternal
} from './zenCinemaConfig.js';

describe('zenCinemaConfig', () => {
  it('pins featured youtu.be URL and public thumb path', () => {
    assert.equal(ZEN_CINEMA_YOUTUBE_URL, 'https://youtu.be/RV46qrvG1pw');
    assert.equal(
      ZEN_CINEMA_THUMB_SRC,
      '/images/zen-cinema/satori-flash-thumb.png'
    );
  });

  it('openZenCinemaExternal opens URL with noopener', () => {
    /** @type {unknown[]} */
    const calls = [];
    openZenCinemaExternal({
      open: (...args) => {
        calls.push(args);
        return null;
      }
    });
    assert.deepEqual(calls, [
      [ZEN_CINEMA_YOUTUBE_URL, '_blank', 'noopener,noreferrer']
    ]);
  });
});
