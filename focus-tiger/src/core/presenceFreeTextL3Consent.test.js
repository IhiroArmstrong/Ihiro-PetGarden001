/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appendPresenceSignal } from './presenceSignalsGate.js';
import {
  canReadPresenceFreeTextForL3,
  listPresenceFreeTextForL3,
  PRESENCE_FREETEXT_L3_READ_ENABLED,
  writePresenceFreeTextL3Consent
} from './presenceFreeTextL3Consent.js';

function mockStorage() {
  /** @type {Record<string, string>} */
  const data = {};
  return {
    getItem(k) {
      return data[k] ?? null;
    },
    setItem(k, v) {
      data[k] = v;
    }
  };
}

describe('presenceFreeTextL3Consent', () => {
  it('blocks L3 freeText read while product flag is off', () => {
    assert.equal(PRESENCE_FREETEXT_L3_READ_ENABLED, false);
    const storage = mockStorage();
    writePresenceFreeTextL3Consent(storage, 'granted');
    appendPresenceSignal(storage, {
      source: 'arrival_choose',
      freeText: 'quiet desk'
    });
    assert.equal(canReadPresenceFreeTextForL3(storage), false);
    assert.deepEqual(listPresenceFreeTextForL3(storage), []);
  });
});
