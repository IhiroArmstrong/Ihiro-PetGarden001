/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { emptyYinPersonalMemoryState } from './yinPersonalMemorySchema.js';
import {
  applyYinMemoryConsent,
  canRememberYinPersonalMemory,
  hasYinMemoryConsentDecision,
  shouldOfferYinMemoryConsent,
  yinMemoryPanelEmptyCopyKey
} from './yinPersonalMemoryConsent.js';

test('consent offer only before decision', () => {
  const fresh = emptyYinPersonalMemoryState();
  assert.equal(shouldOfferYinMemoryConsent(fresh), true);
  assert.equal(hasYinMemoryConsentDecision(fresh), false);
  assert.equal(canRememberYinPersonalMemory(fresh), false);
});

test('denied blocks remember but is a decision', () => {
  const denied = applyYinMemoryConsent(emptyYinPersonalMemoryState(), false, 't');
  assert.equal(denied.consent, 'denied');
  assert.equal(shouldOfferYinMemoryConsent(denied), false);
  assert.equal(canRememberYinPersonalMemory(denied), false);
});

test('granted enables remember gate', () => {
  const granted = applyYinMemoryConsent(emptyYinPersonalMemoryState(), true, 't');
  assert.equal(granted.consent, 'granted');
  assert.equal(granted.consentedAt, 't');
  assert.equal(canRememberYinPersonalMemory(granted), true);
});

test('granted empty panel copy does not ask to allow again', () => {
  assert.equal(yinMemoryPanelEmptyCopyKey(null), 'YIN_MEMORY_PANEL_EMPTY');
  assert.equal(yinMemoryPanelEmptyCopyKey('denied'), 'YIN_MEMORY_PANEL_EMPTY');
  assert.equal(yinMemoryPanelEmptyCopyKey('granted'), 'YIN_MEMORY_PANEL_EMPTY_GRANTED');
});
