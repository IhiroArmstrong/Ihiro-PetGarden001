/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shadow review after a catalog or near-neighbor hit.
 * Brief: task-confide-kb-catalog-near-misfire.md stage one.
 * Logs whether the sentence looks like a mood aside. Does not change the reply.
 */

import { hashConfidePrivateText } from './confidePrivacy.js';

export const KB_CATALOG_NEAR_REVIEW_SHADOW_KIND = 'kb_catalog_near_review_shadow';

/**
 * Known leaks the mood veto cannot see, because a hit returns first.
 * Plus the badge sentence (not a mood aside) and true product asks.
 * @type {readonly { role: 'leak' | 'badge' | 'control', lang: 'zh' | 'en', text: string }[]}
 */
export const KB_CATALOG_NEAR_REVIEW_LAB_ROWS = Object.freeze([
  { role: 'leak', lang: 'en', text: "I'm just sitting here for a bit." },
  { role: 'leak', lang: 'en', text: 'I just want something sweet to escape for a bit' },
  { role: 'leak', lang: 'en', text: "I can't sit still today and I want to quit" },
  { role: 'leak', lang: 'en', text: 'I want to order a pizza and forget about everything' },
  { role: 'leak', lang: 'en', text: 'Practice felt pointless today' },
  { role: 'leak', lang: 'en', text: 'I keep replaying a conversation from years ago' },
  { role: 'leak', lang: 'zh', text: '不想再被各种会员推销缠着' },
  { role: 'badge', lang: 'zh', text: '徽章 是否 可以 做 focus coin 来 使用？' },
  { role: 'control', lang: 'zh', text: '接地练习在哪' },
  { role: 'control', lang: 'en', text: 'A Quiet Line 在哪' },
  { role: 'control', lang: 'en', text: 'I need to practice focus.' }
]);

/**
 * @param {unknown} value
 * @returns {number | null}
 */
function finiteOrNull(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Stage-one signal only: the mood library already outranks Library C.
 * Not a locked rule for changing replies.
 * @param {{
 *   action: 'skip' | 'hit' | 'honesty',
 *   moodOutranksProduct?: boolean | null
 * }} input
 * @returns {{ applies: boolean, moodKnown: boolean, wouldRelease: boolean, replyUnchanged: true }}
 */
export function reviewCatalogNearHitForMoodAside(input) {
  const applies = input.action === 'hit';
  const moodKnown = input.moodOutranksProduct === true || input.moodOutranksProduct === false;
  return {
    applies,
    moodKnown: applies && moodKnown,
    wouldRelease: applies && input.moodOutranksProduct === true,
    replyUnchanged: true
  };
}

/**
 * Privacy-safe row. Null when this send did not show a catalog or near short answer.
 * @param {{
 *   text: string,
 *   locale?: string,
 *   hitKind: 'catalog' | 'near',
 *   kbId?: string | null,
 *   moodScore?: number | null,
 *   moodOutranksProduct?: boolean | null,
 *   action: 'skip' | 'hit' | 'honesty',
 *   now?: () => Date
 * }} payload
 * @returns {object | null}
 */
export function buildKbCatalogNearReviewShadowTurnLog(payload) {
  const review = reviewCatalogNearHitForMoodAside({
    action: payload.action,
    moodOutranksProduct: payload.moodOutranksProduct
  });
  if (!review.applies) return null;
  const raw = typeof payload.text === 'string' ? payload.text : '';
  const now = payload.now ? payload.now() : new Date();
  const moodScore = finiteOrNull(payload.moodScore);
  return {
    at: now.toISOString(),
    kind: KB_CATALOG_NEAR_REVIEW_SHADOW_KIND,
    locale: payload.locale || 'en',
    queryHash: hashConfidePrivateText(raw),
    textLength: raw.length,
    hitKind: payload.hitKind === 'near' ? 'near' : 'catalog',
    kbId: typeof payload.kbId === 'string' ? payload.kbId : null,
    moodScore,
    moodOutranks: review.moodKnown ? payload.moodOutranksProduct === true : null,
    wouldRelease: review.wouldRelease,
    replyUnchanged: true
  };
}

/**
 * Lab table only. Does not authorize changing replies.
 * @param {readonly {
 *   role: 'leak' | 'badge' | 'control',
 *   text: string,
 *   baseline: string,
 *   wouldRelease: boolean
 * }[]} rows
 */
export function summarizeKbCatalogNearReviewLab(rows) {
  const leaks = rows.filter((r) => r.role === 'leak');
  const controls = rows.filter((r) => r.role === 'control');
  const badges = rows.filter((r) => r.role === 'badge');
  return {
    leak: {
      n: leaks.length,
      baselineHit: leaks.filter((r) => r.baseline === 'hit').length,
      wouldRelease: leaks.filter((r) => r.wouldRelease).length,
      stillHit: leaks.filter((r) => r.baseline === 'hit' && !r.wouldRelease).map((r) => r.text),
      notHit: leaks.filter((r) => r.baseline !== 'hit').map((r) => r.text)
    },
    control: {
      n: controls.length,
      baselineHit: controls.filter((r) => r.baseline === 'hit').length,
      falseRelease: controls.filter((r) => r.wouldRelease).map((r) => r.text)
    },
    badge: {
      n: badges.length,
      moodReviewWouldRelease: badges.filter((r) => r.wouldRelease).map((r) => r.text),
      moodReviewCoversBadge: false
    },
    stageTwoNotAuthorized: true
  };
}
