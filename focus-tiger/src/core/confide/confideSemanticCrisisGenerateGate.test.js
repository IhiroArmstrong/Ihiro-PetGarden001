/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  confideSemanticCrisisBlocksL3Generate,
  createConfideSemanticCrisisGenerateAttestation
} from './confideSemanticCrisisGenerateGate.js';

describe('confideSemanticCrisisGenerateGate T90', () => {
  it('blocks fallback generate when crisis layer must score but did not', () => {
    assert.equal(
      confideSemanticCrisisBlocksL3Generate({
        route: CONFIDE_ROUTE.FALLBACK,
        text: 'I feel empty inside',
        wideViewport: true,
        scored: false,
        embeddingOk: false
      }),
      true
    );
  });

  it('blocks fallback generate when scored but embedding not ready', () => {
    assert.equal(
      confideSemanticCrisisBlocksL3Generate({
        route: CONFIDE_ROUTE.FALLBACK,
        text: 'I feel empty inside',
        wideViewport: true,
        scored: true,
        embeddingOk: false
      }),
      true
    );
  });

  it('allows fallback generate when scored and embedding ok', () => {
    assert.equal(
      confideSemanticCrisisBlocksL3Generate({
        route: CONFIDE_ROUTE.FALLBACK,
        text: 'I feel empty inside',
        wideViewport: true,
        scored: true,
        embeddingOk: true
      }),
      false
    );
  });

  it('does not force-block narrow fallback when embeddings are absent', () => {
    assert.equal(
      confideSemanticCrisisBlocksL3Generate({
        route: CONFIDE_ROUTE.FALLBACK,
        text: 'I feel empty inside',
        wideViewport: false,
        embeddingReady: false,
        scored: false
      }),
      false
    );
  });

  it('blocks narrow fallback generate when vectors are ready but unscored', () => {
    assert.equal(
      confideSemanticCrisisBlocksL3Generate({
        route: CONFIDE_ROUTE.FALLBACK,
        text: 'I feel empty inside',
        wideViewport: false,
        embeddingReady: true,
        scored: false
      }),
      true
    );
  });

  it('does not block non-fallback routes', () => {
    assert.equal(
      confideSemanticCrisisBlocksL3Generate({
        route: CONFIDE_ROUTE.SAD,
        text: 'I feel empty inside',
        wideViewport: true,
        scored: false
      }),
      false
    );
  });

  it('attestation factory starts unscored', () => {
    const a = createConfideSemanticCrisisGenerateAttestation();
    assert.equal(a.scored, false);
    assert.equal(a.embeddingOk, false);
  });
});
