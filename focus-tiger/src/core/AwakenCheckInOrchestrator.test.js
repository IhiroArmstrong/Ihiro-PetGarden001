/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AWAKEN_CHECKIN_MID_DAILY_MAX,
  awakenCheckInCopyIsForbidden,
  decideAwakenEndCheckIn,
  decideAwakenMidCheckIn
} from './AwakenCheckInOrchestrator.js';

describe('AwakenCheckInOrchestrator', () => {
  it('mid check-in respects daily cap and invite mutex', () => {
    const base = {
      focusing: true,
      inviteVisible: false,
      checkInVisible: false,
      yieldBusy: false,
      mutationCandidate: true,
      midCountToday: AWAKEN_CHECKIN_MID_DAILY_MAX
    };
    assert.equal(decideAwakenMidCheckIn(base).show, false);
    assert.equal(
      decideAwakenMidCheckIn({ ...base, midCountToday: 3 }).show,
      true
    );
    assert.equal(
      decideAwakenMidCheckIn({ ...base, midCountToday: 3, inviteVisible: true })
        .show,
      false
    );
  });

  it('end check-in allows once per session when reflection is open', () => {
    assert.equal(
      decideAwakenEndCheckIn({
        reflectionOpen: true,
        endOfferedForSession: false,
        checkInVisible: false
      }).show,
      true
    );
    assert.equal(
      decideAwakenEndCheckIn({
        reflectionOpen: true,
        endOfferedForSession: true,
        checkInVisible: false
      }).show,
      false
    );
    assert.equal(
      decideAwakenEndCheckIn({
        reflectionOpen: false,
        endOfferedForSession: false,
        checkInVisible: false
      }).show,
      false
    );
  });

  it('locale slice avoids forbidden diagnostic copy', () => {
    const slice = JSON.parse(
      readFileSync(
        join(
          dirname(fileURLToPath(import.meta.url)),
          '../locales/slices/awaken-check-in.json'
        ),
        'utf8'
      )
    );
    for (const locale of Object.values(slice)) {
      for (const line of Object.values(locale)) {
        assert.equal(awakenCheckInCopyIsForbidden(line), false, line);
      }
    }
  });
});
