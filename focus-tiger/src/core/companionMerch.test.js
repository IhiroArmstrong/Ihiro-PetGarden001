/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COMPANION_MERCH_CASE_2_ID,
  companionMerchPracticeMet,
  describeCompanionMerch,
  registerCompanionMerch
} from './companionMerch.js';

function memoryStorage() {
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

test('practice gate is minutes, score, or case 2 plus 30 days', () => {
  assert.equal(companionMerchPracticeMet({ lifetimeMinutes: 5999, score: 83 }), false);
  assert.equal(companionMerchPracticeMet({ lifetimeMinutes: 6000, score: 0 }), true);
  assert.equal(companionMerchPracticeMet({ lifetimeMinutes: 0, score: 84 }), true);
  assert.equal(
    companionMerchPracticeMet({
      revealedCaseIds: [COMPANION_MERCH_CASE_2_ID],
      practiceDayCount: 29
    }),
    false
  );
  assert.equal(
    companionMerchPracticeMet({
      revealedCaseIds: [COMPANION_MERCH_CASE_2_ID],
      practiceDayCount: 30
    }),
    true
  );
});

test('email is required before a met practice can register', () => {
  const storage = memoryStorage();
  const met = { storage, lifetimeMinutes: 6000, email: '' };
  assert.equal(describeCompanionMerch(met).status, 'need-email');
  assert.equal(registerCompanionMerch(storage, met).ok, false);
});

test('eligible registration writes once and skips an identical rewrite', () => {
  const storage = memoryStorage();
  const input = {
    storage,
    lifetimeMinutes: 6000,
    email: 'yin@example.com',
    contactLater: true,
    now: new Date('2026-10-01T00:00:00.000Z')
  };
  const first = registerCompanionMerch(storage, input);
  assert.equal(first.ok, true);
  assert.equal(describeCompanionMerch(input).status, 'registered');
  const second = registerCompanionMerch(storage, input);
  assert.equal(second.unchanged, true);
});
