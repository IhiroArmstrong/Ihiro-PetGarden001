/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  YPE_CLOUD_PERSONALIZATION_CONSENT_STORAGE_KEY,
  createYpeProfileId,
  getActiveYpeProfileId,
  isYpeCloudPersonalizationConsentEnabled,
  normalizeYpeCloudPersonalizationConsentState,
  readYpeCloudPersonalizationConsentState,
  setYpeCloudPersonalizationConsent
} from './ypeCloudPersonalizationConsent.js';

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
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

describe('ypeCloudPersonalizationConsent', () => {
  it('defaults off', () => {
    const storage = memoryStorage();
    assert.equal(isYpeCloudPersonalizationConsentEnabled(storage), false);
    assert.equal(
      normalizeYpeCloudPersonalizationConsentState(null).enabled,
      false
    );
  });

  it('enabling mints ypeProfileId and consentedAt', () => {
    const storage = memoryStorage();
    const next = setYpeCloudPersonalizationConsent(
      storage,
      true,
      () => new Date('2026-08-26T03:00:00Z')
    );
    assert.equal(next.enabled, true);
    assert.ok(next.ypeProfileId);
    assert.equal(next.consentedAt, '2026-08-26T03:00:00.000Z');
    assert.ok(storage.getItem(YPE_CLOUD_PERSONALIZATION_CONSENT_STORAGE_KEY));
    assert.equal(getActiveYpeProfileId(storage), next.ypeProfileId);
  });

  it('disabling queues delete and clears active profile id', () => {
    const storage = memoryStorage();
    const on = setYpeCloudPersonalizationConsent(
      storage,
      true,
      () => new Date('2026-08-26T03:00:00Z')
    );
    const off = setYpeCloudPersonalizationConsent(
      storage,
      false,
      () => new Date('2026-08-26T03:01:00Z')
    );
    assert.equal(off.enabled, false);
    assert.equal(off.ypeProfileId, null);
    assert.equal(off.pendingDeleteProfileId, on.ypeProfileId);
    assert.equal(off.deleteQueuedAt, '2026-08-26T03:01:00.000Z');
    assert.equal(getActiveYpeProfileId(storage), null);
  });

  it('re-enabling mints a new ypeProfileId', () => {
    const storage = memoryStorage();
    const first = setYpeCloudPersonalizationConsent(storage, true);
    setYpeCloudPersonalizationConsent(storage, false);
    const second = setYpeCloudPersonalizationConsent(storage, true);
    assert.notEqual(second.ypeProfileId, first.ypeProfileId);
  });

  it('createYpeProfileId returns opaque string', () => {
    const id = createYpeProfileId();
    assert.match(id, /^(?:[0-9a-f-]{36}|ype-)/i);
  });

  it('read normalizes corrupt storage', () => {
    const storage = memoryStorage({
      [YPE_CLOUD_PERSONALIZATION_CONSENT_STORAGE_KEY]: '{bad'
    });
    assert.equal(
      readYpeCloudPersonalizationConsentState(storage).enabled,
      false
    );
  });
});
