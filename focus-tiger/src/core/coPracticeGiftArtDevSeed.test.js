/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  fourScenesAllPass,
  runCoPracticeGiftArtJoinFourScenes
} from './coPracticeGiftArtDevSeed.js';
import { endCoPracticeTimedSessionActive } from './coPracticeSessionJoinLedger.js';

function mockStorage() {
  /** @type {Record<string, string>} */
  const data = {};
  return {
    getItem(k) {
      return data[k] ?? null;
    },
    setItem(k, v) {
      data[k] = v;
    },
    removeItem(k) {
      delete data[k];
    }
  };
}

describe('T68 2a four join scenes', () => {
  it('accepted+complete increments B; unfinished accepted and adaptation-off C fail closed', () => {
    const storage = mockStorage();
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: storage
    });
    try {
      const result = runCoPracticeGiftArtJoinFourScenes();
      assert.equal(fourScenesAllPass(result), true, JSON.stringify(result));
    } finally {
      endCoPracticeTimedSessionActive();
      Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: original
      });
    }
  });
});
