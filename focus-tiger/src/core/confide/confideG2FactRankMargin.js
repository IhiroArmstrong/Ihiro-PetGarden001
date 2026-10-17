/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * G2 rank+margin diagnostic (counts only). Does not change the send path.
 * Voided unseen v1/v2 may be replayed; never print utterance text.
 */

import {
  DEFAULT_KB_NEAR_FAR_MAX,
  DEFAULT_KB_NEAR_HIT_MIN
} from './kbNearMatch.js';

export const G2_FACT_RANK_MARGIN_MARGINS = Object.freeze([0.01, 0.02, 0.05]);

/**
 * @param {number[]} values
 * @returns {{ n: number, min: number | null, p25: number | null, median: number | null, p75: number | null, max: number | null, mean: number | null }}
 */
export function numericDistribution(values) {
  const nums = (values || []).filter((n) => Number.isFinite(n)).slice().sort((a, b) => a - b);
  if (nums.length === 0) {
    return { n: 0, min: null, p25: null, median: null, p75: null, max: null, mean: null };
  }
  const at = (p) => {
    const idx = Math.min(nums.length - 1, Math.max(0, Math.ceil(p * nums.length) - 1));
    return nums[idx];
  };
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return {
    n: nums.length,
    min: nums[0],
    p25: at(0.25),
    median: at(0.5),
    p75: at(0.75),
    max: nums[nums.length - 1],
    mean: sum / nums.length
  };
}

/**
 * @param {Map<string, number> | Record<string, number>} scoreByCard
 * @param {string | null | undefined} expectedId
 * @returns {{
 *   rank: number | null,
 *   expectedScore: number | null,
 *   nearestWrongId: string | null,
 *   nearestWrongScore: number | null,
 *   margin: number | null,
 *   topId: string | null,
 *   topScore: number | null,
 *   expectedIsTop: boolean
 * }}
 */
export function rankExpectedCard(scoreByCard, expectedId) {
  const entries =
    scoreByCard instanceof Map
      ? [...scoreByCard.entries()]
      : Object.entries(scoreByCard || {});
  const ranked = entries
    .filter(([, score]) => Number.isFinite(score))
    .sort((a, b) => b[1] - a[1]);
  const top = ranked[0] || null;
  const want = String(expectedId || '').trim();
  const expectedRow = want ? ranked.find(([id]) => id === want) : null;
  const wrong = ranked.find(([id]) => id !== want) || null;
  const expectedScore = expectedRow ? expectedRow[1] : null;
  const nearestWrongScore = wrong ? wrong[1] : null;
  const second = ranked[1] || null;
  return {
    rank: expectedRow ? ranked.indexOf(expectedRow) + 1 : null,
    expectedScore,
    nearestWrongId: wrong ? wrong[0] : null,
    nearestWrongScore,
    margin:
      expectedScore != null && nearestWrongScore != null
        ? expectedScore - nearestWrongScore
        : null,
    leadMargin: top && second ? top[1] - second[1] : null,
    topId: top ? top[0] : null,
    topScore: top ? top[1] : null,
    expectedIsTop: Boolean(want && top && top[0] === want)
  };
}

/**
 * @param {number | null | undefined} topScore
 * @param {{ hitMin?: number, farMax?: number }} [opts]
 * @returns {'hit' | 'honesty' | 'skip'}
 */
export function decideScoreBand(topScore, opts = {}) {
  const hitMin = Number.isFinite(opts.hitMin) ? opts.hitMin : DEFAULT_KB_NEAR_HIT_MIN;
  const farMax = Number.isFinite(opts.farMax) ? opts.farMax : DEFAULT_KB_NEAR_FAR_MAX;
  const score = Number(topScore);
  if (!Number.isFinite(score)) return 'skip';
  if (score >= hitMin) return 'hit';
  if (score >= farMax) return 'honesty';
  return 'skip';
}

/**
 * Accept only when the expected (or top) card is rank-1 with enough margin.
 * @param {{ rank: number | null, margin: number | null, expectedIsTop: boolean }} row
 * @param {number} minMargin
 * @returns {boolean}
 */
export function decideRankMarginHit(row, minMargin) {
  const floor = Number(minMargin);
  if (!Number.isFinite(floor)) return false;
  return Boolean(row?.expectedIsTop) && Number(row?.margin) >= floor;
}

/**
 * Rank+margin would pick whichever card is top, even if it is the wrong card.
 * @param {{ margin: number | null, topScore: number | null }} row
 * @param {number} minMargin
 * @param {number | null} [scoreFloor]
 * @returns {boolean}
 */
export function decideRankMarginWouldPickTop(row, minMargin, scoreFloor = null) {
  const floor = Number(minMargin);
  const lead = Number.isFinite(row?.leadMargin) ? row.leadMargin : row?.margin;
  if (!Number.isFinite(floor) || !Number.isFinite(lead) || lead < floor) return false;
  if (scoreFloor != null && Number.isFinite(scoreFloor)) {
    if (!Number.isFinite(row?.topScore) || row.topScore < scoreFloor) return false;
  }
  return true;
}

/**
 * @param {Array<{
 *   classId: string,
 *   expectedKind: string,
 *   expectedCardId: string | null,
 *   rank: number | null,
 *   expectedScore: number | null,
 *   nearestWrongScore: number | null,
 *   margin: number | null,
 *   expectedIsTop: boolean,
 *   topScore: number | null,
 *   band080: string
 * }>} rows
 */
export function summarizeRankMarginRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const withCard = list.filter((r) => r.expectedKind === 'product_card' && r.expectedCardId);
  const noCard = list.filter((r) => r.expectedKind === 'no_product_card');
  const byClass = {};
  for (const row of list) {
    const key = row.classId || '_';
    if (!byClass[key]) {
      byClass[key] = { n: 0, rank1: 0, with_card: 0 };
    }
    byClass[key].n += 1;
    if (row.expectedKind === 'product_card' && row.expectedCardId) {
      byClass[key].with_card += 1;
      if (row.expectedIsTop) byClass[key].rank1 += 1;
    }
  }

  const rankPlus = {};
  for (const m of G2_FACT_RANK_MARGIN_MARGINS) {
    const key = m.toFixed(2);
    rankPlus[key] = {
      expected_rank1_and_margin: withCard.filter((r) => decideRankMarginHit(r, m)).length,
      would_pick_top: list.filter((r) => decideRankMarginWouldPickTop(r, m)).length,
      would_pick_top_and_ge_062: list.filter((r) =>
        decideRankMarginWouldPickTop(r, m, DEFAULT_KB_NEAR_FAR_MAX)
      ).length,
      would_pick_top_and_ge_080: list.filter((r) =>
        decideRankMarginWouldPickTop(r, m, DEFAULT_KB_NEAR_HIT_MIN)
      ).length,
      no_card_false_accept: noCard.filter((r) => decideRankMarginWouldPickTop(r, m)).length,
      no_card_false_accept_ge_062: noCard.filter((r) =>
        decideRankMarginWouldPickTop(r, m, DEFAULT_KB_NEAR_FAR_MAX)
      ).length,
      no_card_false_accept_ge_080: noCard.filter((r) =>
        decideRankMarginWouldPickTop(r, m, DEFAULT_KB_NEAR_HIT_MIN)
      ).length
    };
  }

  const hit080 = list.filter((r) => r.band080 === 'hit');
  const hit080Correct = withCard.filter(
    (r) => r.band080 === 'hit' && r.expectedIsTop
  );
  const hit080Wrong = list.filter(
    (r) => r.band080 === 'hit' && r.expectedKind === 'product_card' && !r.expectedIsTop
  );
  const noCardHit080 = noCard.filter((r) => r.band080 === 'hit');

  return {
    n: list.length,
    with_expected_card: withCard.length,
    no_product_card: noCard.length,
    rank1: withCard.filter((r) => r.expectedIsTop).length,
    rank1_rate: withCard.length ? withCard.filter((r) => r.expectedIsTop).length / withCard.length : null,
    rank_le_3: withCard.filter((r) => r.rank != null && r.rank <= 3).length,
    expected_score: numericDistribution(withCard.map((r) => r.expectedScore)),
    nearest_wrong_score: numericDistribution(withCard.map((r) => r.nearestWrongScore)),
    margin: numericDistribution(withCard.map((r) => r.margin)),
    top_score_all: numericDistribution(list.map((r) => r.topScore)),
    band_0_80: {
      hit: hit080.length,
      honesty: list.filter((r) => r.band080 === 'honesty').length,
      skip: list.filter((r) => r.band080 === 'skip').length,
      hit_and_correct: hit080Correct.length,
      hit_and_wrong_card: hit080Wrong.length,
      no_card_false_accept: noCardHit080.length,
      miss_expected:
        withCard.filter((r) => r.band080 !== 'hit' || !r.expectedIsTop).length
    },
    rank_plus_margin: rankPlus,
    by_class: byClass
  };
}

/**
 * @param {object} summary
 * @param {string} label
 * @returns {string}
 */
export function formatRankMarginStdout(label, summary) {
  const pct = (num, den) =>
    den ? `${num}/${den} (${((100 * num) / den).toFixed(1)}%)` : `${num}/0`;
  const dist = (d) =>
    !d || d.n === 0
      ? 'n=0'
      : `n=${d.n} min=${d.min.toFixed(3)} p25=${d.p25.toFixed(3)} med=${d.median.toFixed(3)} p75=${d.p75.toFixed(3)} max=${d.max.toFixed(3)} mean=${d.mean.toFixed(3)}`;
  const lines = [
    `[g2-rank-margin] ${label} 作废卷回放或可见开发集，非过关证据`,
    `n=${summary.n} 有正确卡=${summary.with_expected_card} 无卡=${summary.no_product_card}`,
    `正确卡排名第一 ${pct(summary.rank1, summary.with_expected_card)} 前三 ${pct(summary.rank_le_3, summary.with_expected_card)}`,
    `正确卡分数 ${dist(summary.expected_score)}`,
    `最近错卡分数 ${dist(summary.nearest_wrong_score)}`,
    `余量(正确-最近错) ${dist(summary.margin)}`,
    `0.80/0.62 判定 hit=${summary.band_0_80.hit} honesty=${summary.band_0_80.honesty} skip=${summary.band_0_80.skip}`,
    `0.80 hit且正确卡 ${pct(summary.band_0_80.hit_and_correct, summary.with_expected_card)} hit却错卡=${summary.band_0_80.hit_and_wrong_card} 无卡误命中=${summary.band_0_80.no_card_false_accept}`
  ];
  for (const [m, row] of Object.entries(summary.rank_plus_margin || {})) {
    lines.push(
      `排名+余量≥${m} 正确且够余量 ${pct(row.expected_rank1_and_margin, summary.with_expected_card)} 会挑第一名=${row.would_pick_top} ∧≥0.62=${row.would_pick_top_and_ge_062} ∧≥0.80=${row.would_pick_top_and_ge_080} 无卡误接=${row.no_card_false_accept}/${row.no_card_false_accept_ge_062}/${row.no_card_false_accept_ge_080}`
    );
  }
  for (const [cls, row] of Object.entries(summary.by_class || {})) {
    lines.push(`类 ${cls} n=${row.n} 有卡=${row.with_card} 第一名=${row.rank1}`);
  }
  return `${lines.join('\n')}\n`;
}
