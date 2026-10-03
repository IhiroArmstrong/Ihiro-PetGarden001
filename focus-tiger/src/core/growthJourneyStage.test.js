/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolvePersonaScoreEligibleMinutes } from './scoreDailyCap.js';
import {
  LOTUS_POND_STORAGE_KEY
} from './LotusPondStore.js';
import {
  serializePracticeBackupSnapshot,
  writePracticeBackupStoresRaw
} from './practiceBackup/practiceBackupSnapshot.js';
import {
  GROWTH_JOURNEY_STAGE_FLOOR_FIELD,
  GROWTH_JOURNEY_STAGE_FLOOR_KEY,
  displayGrowthJourneyStage,
  growthJourneyTrackPosition,
  noteGrowthJourneyEligibleMinutes,
  readGrowthJourneyStageFloor,
  stageForEligibleMinutes
} from './growthJourneyStage.js';

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

describe('growthJourneyStage', () => {
  it('lands the locked persona minutes without reading practice day count', () => {
    assert.equal(stageForEligibleMinutes(5), 'begin');
    assert.equal(stageForEligibleMinutes(35), 'notice');
    assert.equal(stageForEligibleMinutes(105), 'notice');
    assert.equal(stageForEligibleMinutes(180), 'notice');
    assert.equal(stageForEligibleMinutes(360), 'practice');
    assert.equal(stageForEligibleMinutes(720), 'steady');
    assert.equal(stageForEligibleMinutes(2160), 'integrated');
    assert.equal(stageForEligibleMinutes(5000), 'integrated');
  });

  it('keeps the stage when day count changes and lotus minutes stay fixed', () => {
    const lotusMinutes = 5000;
    const stage = stageForEligibleMinutes(lotusMinutes);
    assert.equal(stage, 'integrated');
    const shrunk = resolvePersonaScoreEligibleMinutes({
      practiceDayCount: 3,
      lifetimeMinutes: lotusMinutes
    });
    assert.equal(shrunk, 3 * 180);
    assert.equal(stageForEligibleMinutes(lotusMinutes), stage);
    assert.equal(stageForEligibleMinutes(shrunk), 'practice');
  });

  it('does not display a stage behind the stored floor', () => {
    assert.equal(displayGrowthJourneyStage('begin', 'steady'), 'steady');
    assert.equal(displayGrowthJourneyStage('integrated', 'notice'), 'integrated');
    assert.equal(growthJourneyTrackPosition(0, 'steady'), 0.75);
    assert.equal(growthJourneyTrackPosition(0, 'integrated'), 1);
    assert.ok(growthJourneyTrackPosition(105, null) > 0.25);
    assert.ok(growthJourneyTrackPosition(105, null) < 0.5);
  });

  it('raises the local floor and never lowers it', () => {
    const storage = memStorage();
    assert.equal(noteGrowthJourneyEligibleMinutes(storage, 105), 'notice');
    assert.equal(noteGrowthJourneyEligibleMinutes(storage, 10), 'notice');
    assert.equal(readGrowthJourneyStageFloor(storage), 'notice');
    assert.equal(noteGrowthJourneyEligibleMinutes(storage, 720), 'steady');
  });

  it('exports the floor on the lotus object and import keeps the higher one', () => {
    const home = memStorage({
      [LOTUS_POND_STORAGE_KEY]: JSON.stringify({
        lifetimeMinutes: 720,
        scoreEligibleLifetimeMinutes: 720
      }),
      [GROWTH_JOURNEY_STAGE_FLOOR_KEY]: JSON.stringify({
        highestStage: 'steady'
      })
    });
    const snap = serializePracticeBackupSnapshot(home);
    const lotus = snap.stores[LOTUS_POND_STORAGE_KEY];
    assert.equal(lotus[GROWTH_JOURNEY_STAGE_FLOOR_FIELD], 'steady');
    assert.equal(lotus.scoreEligibleLifetimeMinutes, 720);

    const older = structuredClone(snap);
    older.stores[LOTUS_POND_STORAGE_KEY] = {
      lifetimeMinutes: 100,
      scoreEligibleLifetimeMinutes: 100,
      [GROWTH_JOURNEY_STAGE_FLOOR_FIELD]: 'notice'
    };
    writePracticeBackupStoresRaw(home, older);
    assert.equal(readGrowthJourneyStageFloor(home), 'steady');
    const written = JSON.parse(home.getItem(LOTUS_POND_STORAGE_KEY));
    assert.equal(GROWTH_JOURNEY_STAGE_FLOOR_FIELD in written, false);
    assert.equal(written.scoreEligibleLifetimeMinutes, 100);

    const phone = memStorage();
    writePracticeBackupStoresRaw(phone, snap);
    assert.equal(readGrowthJourneyStageFloor(phone), 'steady');
    assert.equal(
      JSON.parse(phone.getItem(LOTUS_POND_STORAGE_KEY)).scoreEligibleLifetimeMinutes,
      720
    );
  });
});
