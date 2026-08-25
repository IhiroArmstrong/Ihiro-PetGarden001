/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hasSeenPresenceSignalsDisclosure,
  markPresenceSignalsDisclosureSeen,
  shouldShowPresenceSignalsDisclosure
} from './presenceSignalsDisclosureGate.js';

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

describe('presenceSignalsDisclosureGate', () => {
  it('shows once per device then never again', () => {
    const storage = mockStorage();
    assert.equal(shouldShowPresenceSignalsDisclosure(storage), true);
    markPresenceSignalsDisclosureSeen(storage);
    assert.equal(hasSeenPresenceSignalsDisclosure(storage), true);
    assert.equal(shouldShowPresenceSignalsDisclosure(storage), false);
  });
});
