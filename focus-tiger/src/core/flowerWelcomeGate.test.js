/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FLOWER_WELCOME_ABSENCE_DAYS,
  FLOWER_WELCOME_FLAG_STORAGE_KEY,
  isFlowerWelcomeEnabled,
  markFlowerWelcomeBubbleShown,
  readFlowerWelcomeState,
  resolveFlowerWelcomeForce,
  shouldPreferFlowerWelcomeOverWellness,
  touchFlowerWelcomeLastOpen
} from './flowerWelcomeGate.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    }
  };
}

describe('flowerWelcomeGate', () => {
  it('flag defaults on; URL/storage can kill', () => {
    const storage = memoryStorage();
    assert.equal(isFlowerWelcomeEnabled({ storage, search: '' }), true);
    assert.equal(
      isFlowerWelcomeEnabled({ storage, search: '?flowerWelcome=0' }),
      false
    );
    storage.setItem(FLOWER_WELCOME_FLAG_STORAGE_KEY, '0');
    assert.equal(isFlowerWelcomeEnabled({ storage, search: '' }), false);
  });

  it('Day1 / absence / ordinary', () => {
    const storage = memoryStorage();
    const now = () => new Date(2026, 7, 6, 12);
    assert.deepEqual(
      resolveFlowerWelcomeForce({ storage, now }),
      { force: true, reason: 'day1', bilingual: true }
    );
    touchFlowerWelcomeLastOpen(storage, { now });
    markFlowerWelcomeBubbleShown(storage);
    assert.equal(readFlowerWelcomeState(storage).firstBubbleDone, true);

    const mid = memoryStorage();
    mid.setItem(
      'focus-tiger.flower-welcome.v1',
      JSON.stringify({
        lastOpenDateKey: '2026-08-05',
        firstBubbleDone: true
      })
    );
    assert.equal(
      resolveFlowerWelcomeForce({ storage: mid, now }).force,
      false
    );

    const away = memoryStorage();
    away.setItem(
      'focus-tiger.flower-welcome.v1',
      JSON.stringify({
        lastOpenDateKey: '2026-08-02',
        firstBubbleDone: true
      })
    );
    const r = resolveFlowerWelcomeForce({ storage: away, now });
    assert.equal(r.force, true);
    assert.equal(r.reason, 'absence');
    assert.ok(FLOWER_WELCOME_ABSENCE_DAYS === 3);
  });

  it('Day1 / absence flower beats wellness cloak skip', () => {
    assert.equal(
      shouldPreferFlowerWelcomeOverWellness({ force: true, reason: 'day1' }),
      true
    );
    assert.equal(
      shouldPreferFlowerWelcomeOverWellness({ force: false, reason: 'ordinary' }),
      false
    );
    assert.equal(shouldPreferFlowerWelcomeOverWellness(null), false);
  });

  it('records lastCopyKey for rotation accounting', () => {
    const storage = memoryStorage();
    touchFlowerWelcomeLastOpen(storage, {
      now: () => new Date(2026, 7, 6, 12)
    });
    markFlowerWelcomeBubbleShown(storage, {
      copyKey: 'FLOWER_BLOW_WELCOME_2'
    });
    assert.equal(
      readFlowerWelcomeState(storage).lastCopyKey,
      'FLOWER_BLOW_WELCOME_2'
    );
  });
});
