/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ZEN_CINEMA_FILMS,
  ZEN_CINEMA_THUMB_SRC,
  ZEN_CINEMA_YOUTUBE_URL,
  findZenCinemaFilmById,
  openZenCinemaExternal
} from './zenCinemaConfig.js';

describe('zenCinemaConfig', () => {
  it('pins a curated film list with kebab-case ids and public thumbs', () => {
    assert.equal(ZEN_CINEMA_FILMS.length >= 2, true);
    assert.equal(ZEN_CINEMA_FILMS[0].id, 'satori-flash');
    assert.equal(ZEN_CINEMA_YOUTUBE_URL, 'https://youtu.be/RV46qrvG1pw');
    assert.equal(
      ZEN_CINEMA_THUMB_SRC,
      '/images/zen-cinema/satori-flash-thumb.png'
    );
    const whatIsZen = findZenCinemaFilmById('what-is-zen');
    assert.ok(whatIsZen);
    assert.equal(whatIsZen.youtubeUrl, 'https://youtu.be/xawM6cgJSrE');
    assert.equal(
      whatIsZen.thumbSrc,
      '/images/zen-cinema/what-is-zen-thumb.png'
    );
    assert.equal(whatIsZen.titleKey, 'ZEN_CINEMA_FILM_TITLE_WHAT_IS_ZEN');
    const hundredFootPole = findZenCinemaFilmById('hundred-foot-pole');
    assert.ok(hundredFootPole);
    assert.equal(hundredFootPole.youtubeUrl, 'https://youtu.be/xpcPXJ95-00');
    assert.equal(
      hundredFootPole.thumbSrc,
      '/images/zen-cinema/hundred-foot-pole-thumb.png'
    );
    assert.equal(
      hundredFootPole.titleKey,
      'ZEN_CINEMA_FILM_TITLE_HUNDRED_FOOT_POLE'
    );
    for (const film of ZEN_CINEMA_FILMS) {
      assert.match(film.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.match(film.youtubeUrl, /^https:\/\/youtu\.be\/[A-Za-z0-9_-]+$/);
      assert.match(film.thumbSrc, /^\/images\/zen-cinema\/[a-z0-9-]+\.png$/);
      assert.match(film.titleKey, /^ZEN_CINEMA_FILM_TITLE/);
    }
  });

  it('openZenCinemaExternal opens the selected film with noopener', () => {
    /** @type {unknown[]} */
    const calls = [];
    openZenCinemaExternal({
      id: 'what-is-zen',
      open: (...args) => {
        calls.push(args);
        return null;
      }
    });
    assert.deepEqual(calls, [
      ['https://youtu.be/xawM6cgJSrE', '_blank', 'noopener,noreferrer']
    ]);
  });

  it('openZenCinemaExternal falls back to the first film when id is missing', () => {
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
