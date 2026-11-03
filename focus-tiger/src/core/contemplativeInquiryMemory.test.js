/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { FOCUS_DURATION_OPTIONS_MINUTES } from './focusDuration.js';
import {
  CONTEMPLATIVE_INQUIRY_SIT_MS,
  CONTEMPLATIVE_INQUIRY_STORAGE_KEY,
  contemplativeInquirySideKey,
  disableContemplativeInquiryMenu,
  incrementContemplativeInquiryVisit,
  isContemplativeInquiryMenuVisible,
  markContemplativeInquiryFirewallSeen,
  readContemplativeInquiryMemory
} from './contemplativeInquiryMemory.js';

const here = dirname(fileURLToPath(import.meta.url));

function memoryStorage() {
  /** @type {Record<string, string>} */
  const data = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    }
  };
}

describe('contemplativeInquiryMemory', () => {
  it('shows the menu until globally disabled', () => {
    const storage = memoryStorage();
    assert.equal(isContemplativeInquiryMenuVisible(storage), true);
    markContemplativeInquiryFirewallSeen(storage);
    assert.equal(isContemplativeInquiryMenuVisible(storage), true);
    disableContemplativeInquiryMenu(storage);
    assert.equal(isContemplativeInquiryMenuVisible(storage), false);
    assert.equal(readContemplativeInquiryMemory(storage).firewallSeen, true);
  });

  it('skips identical localStorage writes', () => {
    const storage = memoryStorage();
    let writes = 0;
    const orig = storage.setItem.bind(storage);
    storage.setItem = (key, value) => {
      writes += 1;
      orig(key, value);
    };
    markContemplativeInquiryFirewallSeen(storage);
    markContemplativeInquiryFirewallSeen(storage);
    assert.equal(writes, 1);
    assert.ok(storage.getItem(CONTEMPLATIVE_INQUIRY_STORAGE_KEY));
  });

  it('side prompts cover visits 2–5 only', () => {
    assert.equal(contemplativeInquirySideKey(0), null);
    assert.equal(contemplativeInquirySideKey(1), 'CI_EX1_SIDE_2');
    assert.equal(contemplativeInquirySideKey(4), 'CI_EX1_SIDE_5');
    assert.equal(contemplativeInquirySideKey(5), null);
    const storage = memoryStorage();
    incrementContemplativeInquiryVisit(storage);
    assert.equal(readContemplativeInquiryMemory(storage).visitCount, 1);
  });

  it('does not add 5 minutes to Focus chips or Quiet Line pools', () => {
    assert.deepEqual([...FOCUS_DURATION_OPTIONS_MINUTES], [10, 15, 25, 45]);
    assert.equal(CONTEMPLATIVE_INQUIRY_SIT_MS, 300000);
    const daily = readFileSync(join(here, 'dailyZenQuote.js'), 'utf8');
    assert.equal(daily.includes('CI_EX1_'), false);
  });
});
