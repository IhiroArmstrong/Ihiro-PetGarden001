/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { journeyDailyCardFilename } from './journeyDailyCard.js';
import { mustardSeedSealExportFilename } from './saveMustardSeedSealImage.js';
import {
  digitalWallpaperFilename,
  findDigitalWallpaperById
} from './digitalWallpapersCatalog.js';
import {
  getPracticeExperience,
  getPracticeSaveImageArtifact,
  listPracticeExperiences,
  listPracticeSaveImageArtifacts,
  PRACTICE_RITUAL_FLOW_VARIANT_IDS
} from './practiceExperienceRegistry.js';
import { RITUAL_IDS } from './RitualFlow.js';

const REQUIRED_EXPERIENCE_KEYS = [
  'practiceKindId',
  'baselineWriteSourceId',
  'endVoiceMode',
  'endVoiceLocaleKey',
  'endVoiceLocaleSource',
  'endVoiceWiringRelativePath',
  'endVoiceWiringMarkers',
  'ceremonySaveArtifactId'
];

const REQUIRED_SAVE_KEYS = [
  'artifactId',
  'filenamePrefix',
  'collisionPolicy',
  'builderModule',
  'builderExport',
  'builderSourceMarkers'
];

describe('practiceExperienceRegistry (A9 slice 2)', () => {
  it('every practice row declares all registry fields', () => {
    for (const row of listPracticeExperiences()) {
      for (const key of REQUIRED_EXPERIENCE_KEYS) {
        assert.ok(
          Object.prototype.hasOwnProperty.call(row, key),
          `${row.practiceKindId} missing ${key}`
        );
      }
      assert.ok(row.endVoiceWiringMarkers.length > 0);
      if (row.ceremonySaveArtifactId) {
        getPracticeSaveImageArtifact(row.ceremonySaveArtifactId);
      }
      if (row.endVoiceLocaleSource === 'fixed' && row.endVoiceMode !== 'breath-phase-only') {
        assert.ok(
          row.endVoiceLocaleKey,
          `${row.practiceKindId} needs endVoiceLocaleKey`
        );
      }
    }
  });

  it('every save-image row declares all registry fields', () => {
    for (const row of listPracticeSaveImageArtifacts()) {
      for (const key of REQUIRED_SAVE_KEYS) {
        assert.ok(
          Object.prototype.hasOwnProperty.call(row, key),
          `${row.artifactId} missing ${key}`
        );
      }
      assert.ok(row.filenamePrefix.endsWith('-'));
      assert.ok(row.builderSourceMarkers.length > 0);
    }
  });

  it('breath and timed sit share the focus-end locale (regression #1143 / #1149)', () => {
    const sit = getPracticeExperience('sit-timed');
    const breath = getPracticeExperience('breath-micro-ritual');
    assert.equal(sit.endVoiceLocaleKey, 'system_tts.focus_end');
    assert.equal(breath.endVoiceLocaleKey, 'system_tts.focus_end');
  });

  it('journey daily card uses time-stamp suffix (regression #1128)', () => {
    const row = getPracticeSaveImageArtifact('journey-daily-card');
    assert.equal(row.collisionPolicy, 'time-stamp-suffix');
    const a = journeyDailyCardFilename({
      dateKey: '2026-10-16',
      at: '2026-10-16T10:00:00.000Z'
    });
    const b = journeyDailyCardFilename({
      dateKey: '2026-10-16',
      at: '2026-10-16T10:05:00.000Z'
    });
    assert.notEqual(a, b);
    assert.match(a, /^focus-tiger-daily-card-2026-10-16-/);
  });

  it('filename helpers honor registered prefixes', () => {
    assert.match(
      mustardSeedSealExportFilename('mustard-seed-sumeru'),
      /^focus-tiger-mustard-seed-/
    );
    const still = findDigitalWallpaperById('idle-breath-still');
    assert.ok(still);
    assert.match(digitalWallpaperFilename(still), /^focus-tiger-wallpaper-/);
  });

  it('ritual-flow variant ids track RITUAL_IDS', () => {
    assert.deepEqual(
      [...PRACTICE_RITUAL_FLOW_VARIANT_IDS].sort(),
      Object.values(RITUAL_IDS).sort()
    );
  });
});
