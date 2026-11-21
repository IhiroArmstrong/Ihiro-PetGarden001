/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLASS_CARD_FACTORY_EXEMPT_IDS } from './glass-card-factory-exemptions.js';
import {
  evaluateGlassCardFactory,
  runGlassCardFactoryCheck,
  sourceUsesGlassFactory
} from './check-glass-card-factory.js';

const here = dirname(fileURLToPath(import.meta.url));

test('missing createGlassCard fails unless grandfathered', () => {
  const result = evaluateGlassCardFactory({
    ids: ['guided-meditation'],
    keepStylesheetZ: new Set(),
    exemptIds: [],
    files: [
      {
        rel: 'src/ui/GuidedMeditationUI.js',
        src: "this.root.id = 'guided-meditation';",
        id: 'x'
      }
    ]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((err) => /must call createGlassCard/.test(err)));
});

test('createGlassCard plus leftover exemption fails (list only shrinks)', () => {
  const result = evaluateGlassCardFactory({
    ids: ['guided-meditation'],
    keepStylesheetZ: new Set(),
    exemptIds: ['guided-meditation'],
    files: [
      {
        rel: 'src/ui/GuidedMeditationUI.js',
        src: "createGlassCard({ id: 'guided-meditation', deck: true })",
        id: 'x'
      }
    ]
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((err) => /still on the exemption list/.test(err)));
});

test('Support keep-stylesheet-z is not required to use the factory', () => {
  const result = evaluateGlassCardFactory({
    ids: ['yin-support-modal'],
    keepStylesheetZ: new Set(['yin-support-modal']),
    exemptIds: [],
    files: [
      {
        rel: 'src/ui/SupportYinModalUI.js',
        src: "this.root.id = 'yin-support-modal';",
        id: 'x'
      }
    ]
  });
  assert.equal(result.ok, true, result.errors.join('; '));
});

test('live tree: factory check green; GM is not grandfathered', () => {
  assert.equal(runGlassCardFactoryCheck(), true);
  assert.equal(GLASS_CARD_FACTORY_EXEMPT_IDS.includes('guided-meditation'), false);
  const src = readFileSync(
    join(here, '../src/ui/GuidedMeditationUI.js'),
    'utf8'
  );
  assert.equal(sourceUsesGlassFactory(src), true);
  assert.match(src, /deck: true/);
  assert.doesNotMatch(src, /rgba\(255,\s*252,\s*245,\s*0\.92\)/);
});

test('live tree: remaining deck cards use the factory; exemption list is empty', () => {
  assert.equal(GLASS_CARD_FACTORY_EXEMPT_IDS.length, 0);
  const files = [
    'DailyZenQuoteCardUI.js',
    'MustardSeedSealCardUI.js',
    'PracticeImprintCardUI.js',
    'DigitalWallpapersCardUI.js',
    'ArtCollectionPanelUI.js',
    'SanctuaryUnlockUI.js',
    'MembershipUnlockUI.js',
    'TipJarUI.js',
    'NewsletterCaptureUI.js',
    'ConfideToYinUI.js',
    'ZenCinemaCardUI.js',
    'GroundExerciseChoiceUI.js',
    'FiveMomentsCompassUI.js',
    'ColdStartGoalCardUI.js',
    'JourneyLogUI.js',
    'HelpCenterUI.js',
    'GrowthJourneyDetailUI.js',
    'FocusCoinsPanelUI.js',
    'LocalPracticeDataPanelUI.js',
    'CoPracticeContractPanelUI.js',
    'EmailJourneyRestorePanelUI.js',
    'PracticeStudyConsentPanelUI.js',
    'QuietTogetherPanelUI.js',
    'FocusCirclePanelUI.js',
    'ReminderPreferenceUI.js',
    'WorkEndPreferenceUI.js'
  ];
  assert.equal(files.length, 26);
  for (const name of files) {
    const src = readFileSync(join(here, '../src/ui', name), 'utf8');
    assert.equal(sourceUsesGlassFactory(src), true, name);
    assert.match(src, /deck: true/, name);
  }
  const membership = readFileSync(
    join(here, '../src/ui/MembershipUnlockUI.js'),
    'utf8'
  );
  assert.match(membership, /id: 'yin-membership-card'/);
  const support = readFileSync(
    join(here, '../src/ui/SupportYinModalUI.js'),
    'utf8'
  );
  assert.equal(sourceUsesGlassFactory(support), false);
});
