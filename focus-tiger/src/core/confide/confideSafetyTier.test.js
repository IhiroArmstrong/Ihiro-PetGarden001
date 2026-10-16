/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  CONFIDE_SAFETY_TIER,
  buildConfideSafetyCareReplyText,
  resolveConfideSafetyTierBand
} from './confideSafetyTier.js';

describe('confide safety tier skeleton (CR-46)', () => {
  it('literal safety always maps to high / safety_redirect', () => {
    const band = resolveConfideSafetyTierBand({ literalSafetyHit: true, score: 0.99 });
    assert.equal(band.tier, CONFIDE_SAFETY_TIER.HIGH);
    assert.equal(band.route, CONFIDE_ROUTE.SAFETY_REDIRECT);
  });

  it('mid tier stays off until live mode and thresholds are set', () => {
    const off = resolveConfideSafetyTierBand({
      score: 0.82,
      embeddingOk: true,
      env: { FT_CONFIDE_SAFETY_CARE: 'off' }
    });
    assert.equal(off.tier, CONFIDE_SAFETY_TIER.NONE);

    const liveNoThreshold = resolveConfideSafetyTierBand({
      score: 0.82,
      embeddingOk: true,
      env: { FT_CONFIDE_SAFETY_CARE: 'live' }
    });
    assert.equal(liveNoThreshold.tier, CONFIDE_SAFETY_TIER.NONE);

    const mid = resolveConfideSafetyTierBand({
      score: 0.72,
      embeddingOk: true,
      env: {
        FT_CONFIDE_SAFETY_CARE: 'live',
        FT_CONFIDE_SAFETY_T_HIGH: '0.85',
        FT_CONFIDE_SAFETY_T_MID: '0.7'
      }
    });
    assert.equal(mid.tier, CONFIDE_SAFETY_TIER.MID);
    assert.equal(mid.route, CONFIDE_ROUTE.SAFETY_CARE);
  });

  it('care reply uses placeholder key plus safety resources', () => {
    const text = buildConfideSafetyCareReplyText('en', (key) =>
      key === 'CONFIDE_SAFETY_CARE_PLACEHOLDER' ? '[PLACEHOLDER_MID_CARE]' : ''
    );
    assert.match(text, /PLACEHOLDER_MID_CARE/);
    assert.match(text, /crisis line/i);
  });
});
