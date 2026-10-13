/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashConfidePrivateText } from './confidePrivacy.js';
import { resolveProductKnowledgeGateAction } from './confideProductKnowledgeSemantic.js';
import { CONFIDE_TURNS_SHADOW_AUDIT_KINDS } from './confideTurnsJsonlRetention.js';
import { CONFIDE_RENDERER_TURN_LOG_KINDS } from '../../../desktop/companion/confideRendererTurnLogAllowlist.js';
import {
  KB_CATALOG_NEAR_REVIEW_LAB_ROWS,
  KB_CATALOG_NEAR_REVIEW_SHADOW_KIND,
  buildKbCatalogNearReviewShadowTurnLog,
  reviewCatalogNearHitForMoodAside,
  summarizeKbCatalogNearReviewLab
} from './confideKbCatalogNearReview.js';

describe('catalog near-hit mood review (shadow only)', () => {
  it('a catalog hit still answers even when the review would release it', () => {
    assert.equal(
      resolveProductKnowledgeGateAction({
        text: 'Practice felt pointless today',
        embeddingState: 'ready',
        semanticIsProduct: true,
        catalogHit: true,
        moodOutranksProduct: true
      }),
      'hit'
    );
    const review = reviewCatalogNearHitForMoodAside({
      action: 'hit',
      moodOutranksProduct: true
    });
    assert.equal(review.wouldRelease, true);
    assert.equal(review.replyUnchanged, true);
  });

  it('does not release a hit when mood does not outrank', () => {
    const review = reviewCatalogNearHitForMoodAside({
      action: 'hit',
      moodOutranksProduct: false
    });
    assert.equal(review.applies, true);
    assert.equal(review.moodKnown, true);
    assert.equal(review.wouldRelease, false);
  });

  it('does not apply on honesty or skip', () => {
    assert.equal(
      reviewCatalogNearHitForMoodAside({ action: 'honesty', moodOutranksProduct: true })
        .applies,
      false
    );
    assert.equal(
      buildKbCatalogNearReviewShadowTurnLog({
        text: '观察翼是什么',
        hitKind: 'catalog',
        action: 'honesty',
        moodOutranksProduct: true
      }),
      null
    );
  });

  it('logs a hash-only row and keeps the kind on the shadow allowlists', () => {
    const text = 'Practice felt pointless today';
    const row = buildKbCatalogNearReviewShadowTurnLog({
      text,
      locale: 'en',
      hitKind: 'near',
      kbId: 'KB-FUNC-0001',
      moodScore: 0.7,
      moodOutranksProduct: true,
      action: 'hit',
      now: () => new Date('2026-10-13T00:00:00.000Z')
    });
    assert.equal(row.kind, KB_CATALOG_NEAR_REVIEW_SHADOW_KIND);
    assert.equal(row.hitKind, 'near');
    assert.equal(row.kbId, 'KB-FUNC-0001');
    assert.equal(row.wouldRelease, true);
    assert.equal(row.replyUnchanged, true);
    assert.equal(row.queryHash, hashConfidePrivateText(text));
    assert.equal(Object.prototype.hasOwnProperty.call(row, 'text'), false);
    assert.equal(JSON.stringify(row).includes('pointless'), false);
    assert.equal(CONFIDE_RENDERER_TURN_LOG_KINDS.includes(row.kind), true);
    assert.equal(CONFIDE_TURNS_SHADOW_AUDIT_KINDS.includes(row.kind), true);
  });

  it('leaves mood unknown when the gate had no mood score', () => {
    const row = buildKbCatalogNearReviewShadowTurnLog({
      text: '接地练习在哪',
      hitKind: 'catalog',
      kbId: 'KB-FUNC-0001',
      action: 'hit'
    });
    assert.equal(row.moodScore, null);
    assert.equal(row.moodOutranks, null);
    assert.equal(row.wouldRelease, false);
  });

  it('summarizes leaks, controls, and the badge sentence without authorizing stage two', () => {
    const summary = summarizeKbCatalogNearReviewLab([
      { role: 'leak', text: 'a', baseline: 'hit', wouldRelease: true },
      { role: 'leak', text: 'b', baseline: 'hit', wouldRelease: false },
      { role: 'leak', text: 'c', baseline: 'honesty', wouldRelease: false },
      { role: 'control', text: '接地练习在哪', baseline: 'hit', wouldRelease: false },
      { role: 'control', text: 'bad control', baseline: 'hit', wouldRelease: true },
      {
        role: 'badge',
        text: '徽章 是否 可以 做 focus coin 来 使用？',
        baseline: 'hit',
        wouldRelease: false
      }
    ]);
    assert.equal(summary.leak.n, 3);
    assert.equal(summary.leak.wouldRelease, 1);
    assert.deepEqual(summary.leak.stillHit, ['b']);
    assert.deepEqual(summary.leak.notHit, ['c']);
    assert.deepEqual(summary.control.falseRelease, ['bad control']);
    assert.deepEqual(summary.badge.moodReviewWouldRelease, []);
    assert.equal(summary.badge.moodReviewCoversBadge, false);
    assert.equal(summary.stageTwoNotAuthorized, true);
    assert.equal(KB_CATALOG_NEAR_REVIEW_LAB_ROWS.filter((r) => r.role === 'leak').length, 7);
    assert.equal(KB_CATALOG_NEAR_REVIEW_LAB_ROWS.filter((r) => r.role === 'badge').length, 1);
  });
});
