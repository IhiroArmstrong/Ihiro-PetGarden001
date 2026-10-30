/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FOCUS_TIGER_LOCAL_STORAGE_KEYS, clearAllFocusTigerLocalState } from './localStateKeys.js';
import { T54_RESEARCH_RECEIVE_FIELDS } from './t54ResearchReceive.js';
import { PRACTICE_BACKUP_EXPORT_KEYS } from './practiceBackup/localBackupStorageRegistry.js';
import {
  PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS,
  PRACTICE_BACKUP_V1_STORE_KEYS
} from './practiceBackup/practiceBackupSnapshot.js';
import {
  CO_PRACTICE_GIFT_ART_CEREMONY_ORDER,
  CO_PRACTICE_GIFT_ART_PIECES,
  CO_PRACTICE_GIFT_ART_STORAGE_KEY,
  CO_PRACTICE_GIFT_ART_SURFACE_ENABLED,
  listForSaleArtIds,
  listGiftArtIds
} from './coPracticeGiftArtCatalog.js';
import {
  readCoPracticeGiftArtState,
  recordCoPracticeGiftArtBDay,
  writeCoPracticeGiftArtState
} from './coPracticeGiftArtStore.js';
import {
  cumulativeBSatisfied,
  evaluateCoPracticeGiftArtGrant
} from './coPracticeGiftArtGrant.js';
import {
  CO_PRACTICE_GIFT_ART_EXPOSURE_PASS,
  alwaysRefuseDeepPractitionerExposure,
  deepWeeklyExposure,
  steadyLightExposure
} from './coPracticeGiftArtExposure.js';
import { TEA_GIFT_ART } from './artEditionCatalog.js';

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

function withMockLocalStorage(run) {
  const storage = mockStorage();
  const original = globalThis.localStorage;
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage
  });
  try {
    run(storage);
  } finally {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: original
    });
  }
}

const passingC = {
  available: true,
  sampleCount: 10,
  hitCount: 8,
  hitRatio: 0.8
};

describe('T68 co-practice gift art', () => {
  it('gift ids do not intersect for-sale art ids (would fail if a shelf id was reused)', () => {
    const sale = new Set(listForSaleArtIds());
    for (const id of listGiftArtIds()) {
      assert.equal(sale.has(id), false, id);
    }
    assert.equal(sale.has(TEA_GIFT_ART.id), true);
    assert.equal(listGiftArtIds().length, 3);
  });

  it('ceremony queue is mustard then imprint then gift art', () => {
    assert.deepEqual(CO_PRACTICE_GIFT_ART_CEREMONY_ORDER, [
      'mustard-seed',
      'practice-imprint',
      'co-practice-gift-art'
    ]);
  });

  it('only piece 1 is grant-enabled; 2 and 3 are provisional', () => {
    assert.equal(CO_PRACTICE_GIFT_ART_PIECES[0].grantEnabled, true);
    assert.equal(CO_PRACTICE_GIFT_ART_PIECES[0].aMinutes, 150);
    assert.equal(CO_PRACTICE_GIFT_ART_PIECES[1].grantEnabled, false);
    assert.equal(CO_PRACTICE_GIFT_ART_PIECES[1].aProvisional, true);
    assert.equal(CO_PRACTICE_GIFT_ART_PIECES[2].grantEnabled, false);
    assert.equal(CO_PRACTICE_GIFT_ART_SURFACE_ENABLED, false);
  });

  it('grants only when A∧B∧C and this sit newly recorded a B day', () => {
    const bDays = ['2026-01-01', '2026-01-12', '2026-01-22'];
    const ok = evaluateCoPracticeGiftArtGrant({
      lifetimeMinutes: 150,
      bDays,
      grants: [],
      rhythmProxy: passingC,
      bDayAddedThisSession: true,
      surfaceEnabled: true
    });
    assert.equal(ok.grant, true);
    assert.equal(ok.pieceId, 'mountain-boat-tray');
  });

  it('does not grant without B (would fail if minutes-only grant shipped)', () => {
    const miss = evaluateCoPracticeGiftArtGrant({
      lifetimeMinutes: 1500,
      bDays: [],
      grants: [],
      rhythmProxy: passingC,
      bDayAddedThisSession: true,
      surfaceEnabled: true
    });
    assert.equal(miss.grant, false);
    assert.equal(miss.reason, 'b_short');
  });

  it('does not evaluate grant on a non-B session even if A and C are met', () => {
    const miss = evaluateCoPracticeGiftArtGrant({
      lifetimeMinutes: 150,
      bDays: ['2026-01-01', '2026-01-12', '2026-01-22'],
      grants: [],
      rhythmProxy: passingC,
      bDayAddedThisSession: false,
      surfaceEnabled: true
    });
    assert.equal(miss.grant, false);
    assert.equal(miss.reason, 'not_b_join_session');
  });

  it('three B days inside 10 days still fail span, and later non-B sits do not grant', () => {
    const packed = ['2026-01-01', '2026-01-05', '2026-01-10'];
    assert.equal(cumulativeBSatisfied(packed, 3, 21), false);
    const onThirdB = evaluateCoPracticeGiftArtGrant({
      lifetimeMinutes: 150,
      bDays: packed,
      grants: [],
      rhythmProxy: passingC,
      bDayAddedThisSession: true,
      surfaceEnabled: true
    });
    assert.equal(onThirdB.grant, false);
    assert.equal(onThirdB.reason, 'b_short');
    const laterNonB = evaluateCoPracticeGiftArtGrant({
      lifetimeMinutes: 150,
      bDays: packed,
      grants: [],
      rhythmProxy: passingC,
      bDayAddedThisSession: false,
      nowDayKey: '2026-02-01',
      surfaceEnabled: true
    });
    assert.equal(laterNonB.grant, false);
    assert.equal(laterNonB.reason, 'not_b_join_session');
  });

  it('does not grant when C is unavailable (adaptation off)', () => {
    const miss = evaluateCoPracticeGiftArtGrant({
      lifetimeMinutes: 150,
      bDays: ['2026-01-01', '2026-01-12', '2026-01-22'],
      grants: [],
      rhythmProxy: { available: false, reason: 'adaptation_off' },
      bDayAddedThisSession: true,
      surfaceEnabled: true
    });
    assert.equal(miss.grant, false);
    assert.equal(miss.reason, 'c_short');
  });

  it('does not persist piece 2 while grantEnabled is false', () => {
    const miss = evaluateCoPracticeGiftArtGrant({
      lifetimeMinutes: 2000,
      bDays: ['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01'],
      grants: [{ id: 'mountain-boat-tray' }],
      rhythmProxy: passingC,
      bDayAddedThisSession: true,
      surfaceEnabled: true
    });
    assert.equal(miss.grant, false);
    assert.equal(miss.reason, 'no_enabled_piece');
  });

  it('storage key is on the delete whitelist and not on T54 or backup lists', () => {
    assert.ok(FOCUS_TIGER_LOCAL_STORAGE_KEYS.includes(CO_PRACTICE_GIFT_ART_STORAGE_KEY));
    assert.equal(T54_RESEARCH_RECEIVE_FIELDS.includes(CO_PRACTICE_GIFT_ART_STORAGE_KEY), false);
    assert.equal(PRACTICE_BACKUP_EXPORT_KEYS.includes(CO_PRACTICE_GIFT_ART_STORAGE_KEY), false);
    assert.equal(
      PRACTICE_BACKUP_CLOUD_V2_STORE_KEYS.includes(CO_PRACTICE_GIFT_ART_STORAGE_KEY),
      false
    );
    assert.equal(
      PRACTICE_BACKUP_V1_STORE_KEYS.includes(CO_PRACTICE_GIFT_ART_STORAGE_KEY),
      false
    );
  });

  it('clearAllFocusTigerLocalState empties the gift-art key', () => {
    withMockLocalStorage(() => {
      recordCoPracticeGiftArtBDay('2026-01-01');
      assert.equal(readCoPracticeGiftArtState().bDays.length, 1);
      clearAllFocusTigerLocalState();
      assert.deepEqual(readCoPracticeGiftArtState(), { bDays: [], grants: [] });
    });
  });

  it('B days only grow; T58-style rewrite of other keys does not shrink them', () => {
    withMockLocalStorage(() => {
      recordCoPracticeGiftArtBDay('2026-01-01');
      recordCoPracticeGiftArtBDay('2026-01-01');
      recordCoPracticeGiftArtBDay('2026-01-08');
      assert.deepEqual(readCoPracticeGiftArtState().bDays, [
        '2026-01-01',
        '2026-01-08'
      ]);
      writeCoPracticeGiftArtState({
        bDays: ['2026-01-01', '2026-01-08'],
        grants: []
      });
      assert.equal(readCoPracticeGiftArtState().bDays.length, 2);
    });
  });
});

describe('T68 exposure fixtures (gate 2b)', () => {
  it('steady-light at 55% accept is within 14 weeks', () => {
    const row = steadyLightExposure(0.55);
    assert.ok(row.weeks != null);
    assert.ok(row.weeks <= CO_PRACTICE_GIFT_ART_EXPOSURE_PASS.steadyLight55MaxWeeks);
  });

  it('steady-light at 25% accept is within about 30 weeks', () => {
    const row = steadyLightExposure(0.25);
    assert.ok(row.weeks != null);
    assert.ok(row.weeks <= CO_PRACTICE_GIFT_ART_EXPOSURE_PASS.steadyLight25MaxWeeks);
  });

  it('deep-weekly lands in 3–6 weeks', () => {
    const row = deepWeeklyExposure();
    assert.ok(row.weeks != null);
    assert.ok(row.weeks >= CO_PRACTICE_GIFT_ART_EXPOSURE_PASS.deepWeeklyMinWeeks);
    assert.ok(row.weeks <= CO_PRACTICE_GIFT_ART_EXPOSURE_PASS.deepWeeklyMaxWeeks);
  });

  it('always-refuse deep practitioner never earns B', () => {
    const row = alwaysRefuseDeepPractitionerExposure();
    assert.equal(row.weeks, null);
    assert.equal(row.bDays, 0);
  });
});
