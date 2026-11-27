/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { countInnerMirrorThemes, matchInnerMirrorThemes } from './innerMirrorLexicon.js';
import { INNER_MIRROR_ZERO_HIT_FIXTURES } from './innerMirrorThemeTable.js';

describe('innerMirror lexicon', () => {
  it('counts zero on Brief miss-hit fixtures', () => {
    for (const sentence of INNER_MIRROR_ZERO_HIT_FIXTURES) {
      assert.deepEqual(
        matchInnerMirrorThemes(sentence),
        [],
        `${sentence} must score 0`
      );
    }
  });

  it('hits closed Chinese and English forms', () => {
    assert.deepEqual(matchInnerMirrorThemes('今天好累'), ['tired']);
    assert.deepEqual(matchInnerMirrorThemes('我们起冲突了'), ['friction']);
    assert.ok(matchInnerMirrorThemes('I was criticized yesterday').includes('criticized'));
    assert.ok(matchInnerMirrorThemes('She kept avoiding it').includes('avoid'));
    assert.ok(matchInnerMirrorThemes('We had an argument').includes('friction'));
    assert.ok(matchInnerMirrorThemes('I rushed the draft').includes('rush'));
  });

  it('does not prefix-match critic or conflict', () => {
    assert.deepEqual(matchInnerMirrorThemes('the critic sat down'), []);
    assert.deepEqual(matchInnerMirrorThemes('scheduling conflict'), []);
  });

  it('counts themes only after a leave, never from a crisis row', () => {
    const now = new Date('2026-11-27T12:00:00');
    const counted = countInnerMirrorThemes(
      [
        {
          at: '2026-11-27T11:00:00.000Z',
          themes: ['tired'],
          themeStatus: 'active'
        },
        {
          at: '2026-11-27T11:01:00.000Z',
          themes: ['tired'],
          themeStatus: 'void'
        }
      ],
      { now }
    );
    assert.equal(counted.counts.tired, 1);
    assert.equal(counted.leftCount, 1);
  });
});
