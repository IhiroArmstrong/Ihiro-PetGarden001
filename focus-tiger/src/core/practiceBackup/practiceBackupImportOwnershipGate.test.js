/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  IMPORT_GATED_OWNERSHIP_FEATURE_KEYS,
  filterOwnershipForLocalImport,
  hasImportRecipientVerifiedPaid,
  isImportGatedOwnershipFeatureKey
} from './practiceBackupImportOwnershipGate.js';
import { applyEntitlementPatch } from '../entitlement/entitlementGate.js';
import { readOwnershipState } from '../entitlement/entitlementOwnership.js';
import {
  importPracticeSnapshotAtomic,
  createPracticeExportPayload
} from './practiceBackupLocalIo.js';
import {
  applyPracticeBackupSnapshot,
  normalizeSnapshotStoresForApply
} from './practiceBackupSync.js';

function memStorage(initial = {}) {
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

const PAID_IMPORT_OWNED = {
  'ritual.morning.memento': { at: '2026-01-01T00:00:00.000Z', meta: null },
  'ritual.morning.history': { at: '2026-01-02T00:00:00.000Z', meta: null },
  'journey.log': { at: '2026-01-03T00:00:00.000Z', meta: null },
  'milestone.glow.played': { at: '2026-01-04T00:00:00.000Z', meta: null }
};

describe('practiceBackupImportOwnershipGate', () => {
  it('lists twelve subscription persistent ritual ownership keys', () => {
    assert.equal(IMPORT_GATED_OWNERSHIP_FEATURE_KEYS.length, 12);
    assert.equal(isImportGatedOwnershipFeatureKey('ritual.morning.memento'), true);
    assert.equal(isImportGatedOwnershipFeatureKey('journey.log'), false);
    assert.equal(isImportGatedOwnershipFeatureKey('milestone.glow.played'), false);
  });

  it('strips paid persistent ownership when recipient is unpaid', () => {
    const storage = memStorage();
    const filtered = filterOwnershipForLocalImport(
      { owned: PAID_IMPORT_OWNED },
      storage
    );
    assert.deepEqual(Object.keys(filtered.owned).sort(), [
      'journey.log',
      'milestone.glow.played'
    ]);
    assert.equal(hasImportRecipientVerifiedPaid(storage), false);
  });

  it('keeps paid persistent ownership when recipient is verified paid', () => {
    const storage = memStorage();
    applyEntitlementPatch(
      {
        subscription: {
          active: true,
          periodEndsAt: '2027-01-01T00:00:00.000Z',
          planId: 'mock',
          via: 'mock'
        }
      },
      { storage, notify: false }
    );
    const filtered = filterOwnershipForLocalImport(
      { owned: PAID_IMPORT_OWNED },
      storage
    );
    assert.equal(
      Object.keys(filtered.owned).length,
      Object.keys(PAID_IMPORT_OWNED).length
    );
    assert.equal(hasImportRecipientVerifiedPaid(storage), true);
  });
});

describe('practiceBackup local import ownership gate integration', () => {
  it('unpaid recipient: import skips ritual memento ownership but keeps practice data', async () => {
    const storage = memStorage();
    const snapshot = (await createPracticeExportPayload(storage)).snapshot;
    snapshot.stores['focus-tiger.entitlement-ownership.v1'] = {
      owned: PAID_IMPORT_OWNED
    };
    snapshot.stores['focus-tiger.journey-log.v1'] = {
      entries: [
        {
          at: '2026-02-01T00:00:00.000Z',
          minutes: 15,
          arrive: false,
          reflect: true
        }
      ]
    };

    const result = await importPracticeSnapshotAtomic(storage, snapshot);
    assert.equal(result.ok, true);

    const owned = readOwnershipState(storage).owned;
    assert.equal(Object.prototype.hasOwnProperty.call(owned, 'ritual.morning.memento'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(owned, 'journey.log'), true);
    assert.ok(
      storage.getItem('focus-tiger.journey-log.v1')?.includes('"minutes":15')
    );
  });

  it('verified paid recipient: import writes ritual memento ownership', async () => {
    const storage = memStorage();
    applyEntitlementPatch(
      {
        lifetime: {
          active: true,
          unlockedAt: '2026-08-01T00:00:00.000Z',
          itemId: 'mock-lifetime',
          via: 'mock'
        }
      },
      { storage, notify: false, markVerified: false }
    );
    const snapshot = (await createPracticeExportPayload(storage)).snapshot;
    snapshot.stores['focus-tiger.entitlement-ownership.v1'] = {
      owned: PAID_IMPORT_OWNED
    };

    const result = await importPracticeSnapshotAtomic(storage, snapshot);
    assert.equal(result.ok, true);
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        readOwnershipState(storage).owned,
        'ritual.morning.memento'
      ),
      true
    );
  });

  it('cloud restore path does not strip ownership for unpaid recipient', () => {
    const storage = memStorage();
    const snapshot = {
      schemaVersion: 2,
      savedAt: '2026-01-01T00:00:00.000Z',
      stores: {
        'focus-tiger.entitlement-ownership.v1': { owned: PAID_IMPORT_OWNED }
      }
    };
    for (const key of [
      'focus-tiger.journey-log.v1',
      'focus-tiger.practice-days.v1',
      'focus-tiger.milestone-glow.v1',
      'focus-tiger.ritual-completions.v1',
      'focus-tiger.mustard-seed-seal.v1',
      'focus-tiger.presence-signals.v1',
      'focus-tiger.presence-freetext-l3-consent.v1',
      'focus-tiger.reflections.v1',
      'focus-tiger.locale.v1',
      'focus-tiger.reminder-preference.v1',
      'focus-tiger.companion-mode.v1',
      'focus-tiger.ambient-pref.v1',
      'focus-tiger.session-cues.v1',
      'focus-tiger.contemplative-archive-seals.v1'
    ]) {
      snapshot.stores[key] = null;
    }

    applyPracticeBackupSnapshot(storage, snapshot);
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        readOwnershipState(storage).owned,
        'ritual.morning.memento'
      ),
      true
    );

    const localFiltered = normalizeSnapshotStoresForApply(snapshot, {
      filterOwnershipForLocalImport: true,
      storage
    });
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        localFiltered.stores['focus-tiger.entitlement-ownership.v1'].owned,
        'ritual.morning.memento'
      ),
      false
    );
  });
});
