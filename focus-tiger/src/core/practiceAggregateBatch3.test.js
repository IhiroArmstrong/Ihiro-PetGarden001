/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const mainSrc = readFileSync(join(here, '../main.js'), 'utf8');

describe('practiceAggregate Batch 3 — mustard ceremony wiring', () => {
  it('shared helper gates mustard/archive before post-session continuation', () => {
    assert.match(
      mainSrc,
      /function maybeOfferGrowthSealAfterBaselineCeremony\(/
    );
    assert.match(mainSrc, /shouldOfferMustardSeedSealAfterCeremony\(/);
    assert.match(mainSrc, /shouldOfferContemplativeArchiveSealAfterCeremony\(/);
  });

  it('timed Sit finish uses shared helper', () => {
    const start = mainSrc.indexOf('function finishCompletedSession()');
    const end = mainSrc.indexOf(
      'const moodController = new MoodController',
      start
    );
    assert.ok(start >= 0 && end > start);
    const body = mainSrc.slice(start, end);
    assert.match(body, /maybeOfferGrowthSealAfterBaselineCeremony\(/);
    assert.equal(
      body.includes('mustardSeedSealCardUI.open({ mode: \'auto\' })'),
      false,
      'finishCompletedSession must not inline mustard open'
    );
  });

  it('Breath micro-ritual complete uses shared helper before Reflection', () => {
    const start = mainSrc.indexOf('function completeMicroRitual()');
    const end = mainSrc.indexOf('function leaveMicroRitualQuietly()');
    assert.ok(start >= 0 && end > start);
    const body = mainSrc.slice(start, end);
    assert.match(body, /maybeOfferGrowthSealAfterBaselineCeremony\(/);
    assert.equal(
      body.includes('sessionEndFlow.onSessionEnded({ completed: true })'),
      false,
      'completeMicroRitual must route Reflection through helper'
    );
  });

  it('Honesty check-in ceremony uses shared helper before bridge', () => {
    const start = mainSrc.indexOf('onCheckInComplete:');
    const end = mainSrc.indexOf('onPracticeDay:', start);
    assert.ok(start >= 0 && end > start);
    const body = mainSrc.slice(start, end);
    assert.match(body, /maybeOfferGrowthSealAfterBaselineCeremony\(/);
    assert.match(body, /onContinue: revealBridge/);
    assert.match(body, /afterHonestyCeremony/);
  });

  it('mustard card onClose resumes session or custom continuation', () => {
    assert.match(mainSrc, /pendingAfterMustardSeed/);
    assert.match(mainSrc, /pending\?\.sessionEndOpts/);
    assert.match(mainSrc, /pending\?\.onContinue/);
  });
});
