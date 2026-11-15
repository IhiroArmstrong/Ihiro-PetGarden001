/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONFIDE_CONSENT_INCOMPLETE,
  CONFIDE_CONSENT_REQUIRED,
  CONFIDE_CONSENT_STORAGE_KEY,
  CONFIDE_CONSENT_VERSION,
  canonicalConfideConsentText,
  hasValidConfideConsent,
  hashCanonicalConfideConsentText,
  recordConfideConsent,
  requireConfideConsent,
  revokeConfideConsent
} from './confideConsent.js';

function memoryStore(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

describe('confideConsent', () => {
  /** @type {ReturnType<typeof memoryStore>} */
  let storage;

  beforeEach(() => {
    storage = memoryStore();
  });

  it('blocks chat without a record', () => {
    assert.equal(hasValidConfideConsent(storage), false);
    assert.deepEqual(requireConfideConsent(storage), {
      ok: false,
      code: CONFIDE_CONSENT_REQUIRED
    });
  });

  it('rejects incomplete checkboxes and does not write', () => {
    const result = recordConfideConsent({
      item1: true,
      item2: false,
      age: true,
      storage
    });
    assert.equal(result.ok, false);
    assert.equal(result.code, CONFIDE_CONSENT_INCOMPLETE);
    assert.equal(storage.getItem(CONFIDE_CONSENT_STORAGE_KEY), null);
  });

  it('requires age confirmation', () => {
    const result = recordConfideConsent({
      item1: true,
      item2: true,
      age: false,
      storage
    });
    assert.equal(result.ok, false);
    assert.equal(hasValidConfideConsent(storage), false);
  });

  it('accepts all three and then allows chat', () => {
    const result = recordConfideConsent({
      item1: true,
      item2: true,
      age: true,
      locale: 'en',
      platform: 'web',
      storage
    });
    assert.equal(result.ok, true);
    assert.equal(hasValidConfideConsent(storage), true);
    assert.equal(requireConfideConsent(storage).ok, true);
    assert.match(result.record.textHash, /^[0-9a-f]{8}$/);
    assert.equal(result.record.consentVersion, CONFIDE_CONSENT_VERSION);
  });

  it('old versions and revoked rows fail', () => {
    storage.setItem(
      CONFIDE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        consentVersion: 'confide_consent_v0',
        item1Accepted: true,
        item2Accepted: true,
        ageConfirmed: true,
        locale: 'en',
        textHash: 'x',
        acceptedAt: '2026-01-01T00:00:00.000Z',
        revokedAt: null
      })
    );
    assert.equal(hasValidConfideConsent(storage), false);
    recordConfideConsent({
      item1: true,
      item2: true,
      age: true,
      locale: 'ja',
      storage
    });
    assert.equal(hasValidConfideConsent(storage), true);
    revokeConfideConsent(storage);
    assert.equal(hasValidConfideConsent(storage), false);
    assert.equal(requireConfideConsent(storage).code, CONFIDE_CONSENT_REQUIRED);
  });

  it('hashes canonical ja copy independently of DOM', () => {
    const ja = canonicalConfideConsentText('ja');
    assert.match(ja, /寅と話す/);
    assert.doesNotMatch(ja, /988|0120-279-338|911/);
    assert.notEqual(
      hashCanonicalConfideConsentText('en'),
      hashCanonicalConfideConsentText('ja')
    );
  });
});
