/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shadow-only routing arbitration helpers. Not on the send path.
 * Brief: task-confide-routing-arbitration-v1.md
 *
 * Function A margin is **frozen** at 0.01 (PO 2026-10-14). Blind runs must not
 * retune it. Live mood-veto margin and the send path stay unchanged until a
 * separate live-cutover nod.
 */

/** Frozen function-A margin. Alias kept for older lab imports. */
export const PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE = 0.01;

/** Frozen: clause max (product − mood) must exceed this to take the product path. */
export const PRODUCT_MINUS_MOOD_MARGIN = 0.01;

/**
 * Live-cutover gate (R-0 companion): function-A product-path hot TTFT vs today's
 * same-sentence path. Measured 2026-10-14: short-answer +1 ms; 3-clause mixed
 * hot median +63 ms (max +65 ms). Locked at 100 ms (existing L0 generation
 * fail is 3000 ms; this is embedding routing only). Fill Brief field
 * `product_path_ttft_hot_delta_ms`.
 */
export const PRODUCT_PATH_TTFT_HOT_DELTA_MS = 100;

export const PRODUCT_MINUS_MOOD_MARGIN_SWEEP = Object.freeze([
  0, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1
]);

/** Prompt 18 hit line. Not a new keyword list. */
export const ROUTING_NEAR_HIT_MIN = 0.8;

/**
 * Same number as live Library C min (`DEFAULT_CONFIDE_PRODUCT_KNOWLEDGE_MIN_SCORE`).
 * Candidate floor for function B; not frozen.
 */
export const PRODUCT_SCORE_FLOOR_CANDIDATE = 0.42;

/**
 * sealed-b-v3 eight classes. Pass line is existing R-0 85%
 * (`CONFIDE_ROUTING_HOLDOUT_PASS_RATE`) plus n≥60; all eight must pass
 * together; AE catalog anchors 100%. Blind scoring is another session.
 */
export const CONFIDE_ARBITRATION_CLASS_IDS = Object.freeze([
  'life-emotion',
  'product-short-answer',
  'product-honest-empty',
  'badge-yin-coin',
  'chitchat',
  'mixed',
  'product-over-emotion',
  'mixed-emotion-dominant'
]);

/**
 * Split on punctuation only. Not a product/mood keyword list.
 * @param {string} text
 * @returns {string[]}
 */
export function splitUtteranceByPunctuation(text) {
  const raw = String(text || '').trim();
  if (!raw) return [];
  const parts = raw
    .split(/[。．.！!？?；;：:\n\r，,、]+/u)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length ? parts : [raw];
}

/**
 * @param {readonly { productScore?: number, moodScore?: number }[]} clauses
 * @returns {number}
 */
export function maxClauseProductMinusMood(clauses) {
  let max = Number.NEGATIVE_INFINITY;
  for (const clause of clauses || []) {
    const product = Number(clause.productScore);
    const mood = Number(clause.moodScore);
    if (!Number.isFinite(product) || !Number.isFinite(mood)) continue;
    const delta = product - mood;
    if (delta > max) max = delta;
  }
  return max;
}

/**
 * Function A: product path iff max clause (product − mood) > margin.
 * @param {{ maxDelta: number, margin: number }} input
 * @returns {boolean}
 */
export function decideShadowProductPathA(input) {
  const maxDelta = Number(input.maxDelta);
  const margin = Number(input.margin);
  if (!Number.isFinite(maxDelta) || !Number.isFinite(margin)) return false;
  return maxDelta > margin;
}

/**
 * True catalog or Prompt-18 near-hit, and product score at/above the floor.
 * @param {{
 *   productScore?: number,
 *   catalogHit?: boolean,
 *   nearestScore?: number | null
 * }} clause
 * @param {number} [floor]
 * @param {number} [nearMin]
 * @returns {boolean}
 */
export function clauseHasTrustedProductHit(
  clause,
  floor = PRODUCT_SCORE_FLOOR_CANDIDATE,
  nearMin = ROUTING_NEAR_HIT_MIN
) {
  const product = Number(clause?.productScore);
  if (!Number.isFinite(product) || product < Number(floor)) return false;
  if (clause?.catalogHit === true) return true;
  return Number(clause?.nearestScore) >= Number(nearMin);
}

/**
 * Function B: trusted catalog/near hit bypasses margin; else same as A.
 * @param {{
 *   clauses: readonly object[],
 *   margin: number,
 *   floor?: number,
 *   nearMin?: number
 * }} input
 * @returns {{ productPath: boolean, via: 'trusted_hit' | 'margin' | 'mood' }}
 */
export function decideShadowProductPathB(input) {
  const floor = input.floor ?? PRODUCT_SCORE_FLOOR_CANDIDATE;
  const nearMin = input.nearMin ?? ROUTING_NEAR_HIT_MIN;
  const clauses = Array.isArray(input.clauses) ? input.clauses : [];
  if (clauses.some((clause) => clauseHasTrustedProductHit(clause, floor, nearMin))) {
    return { productPath: true, via: 'trusted_hit' };
  }
  const maxDelta = maxClauseProductMinusMood(clauses);
  if (decideShadowProductPathA({ maxDelta, margin: input.margin })) {
    return { productPath: true, via: 'margin' };
  }
  return { productPath: false, via: 'mood' };
}

/**
 * Function C: keep today's product detection as the default.
 * Literal / catalog short answers need a second check: neighbor ≥ 0.80
 * **or** clause (product − mood) above margin; whole-utterance product
 * score must also clear the floor. No new keyword list.
 * @param {{
 *   liveProduct: boolean,
 *   catalogHit: boolean,
 *   clauses: readonly object[],
 *   wholeProductScore?: number,
 *   margin: number,
 *   floor?: number,
 *   nearMin?: number
 * }} input
 * @returns {{
 *   productPath: boolean,
 *   via:
 *     | 'live_skip'
 *     | 'live_semantic'
 *     | 'near_confirm'
 *     | 'margin_confirm'
 *     | 'below_floor'
 *     | 'catalog_unconfirmed'
 * }}
 */
export function decideShadowProductPathC(input) {
  if (input.liveProduct !== true) return { productPath: false, via: 'live_skip' };
  if (input.catalogHit !== true) return { productPath: true, via: 'live_semantic' };

  const floor = input.floor ?? PRODUCT_SCORE_FLOOR_CANDIDATE;
  const nearMin = input.nearMin ?? ROUTING_NEAR_HIT_MIN;
  const clauses = Array.isArray(input.clauses) ? input.clauses : [];
  const whole = Number(input.wholeProductScore);
  const productForFloor = Number.isFinite(whole)
    ? whole
    : Math.max(
        ...clauses.map((clause) => Number(clause.productScore)).filter((n) => Number.isFinite(n)),
        Number.NEGATIVE_INFINITY
      );
  if (!Number.isFinite(productForFloor) || productForFloor < Number(floor)) {
    return { productPath: false, via: 'below_floor' };
  }
  const nearOk = clauses.some((clause) => Number(clause.nearestScore) >= Number(nearMin));
  if (nearOk) return { productPath: true, via: 'near_confirm' };
  const maxDelta = maxClauseProductMinusMood(clauses);
  if (decideShadowProductPathA({ maxDelta, margin: input.margin })) {
    return { productPath: true, via: 'margin_confirm' };
  }
  return { productPath: false, via: 'catalog_unconfirmed' };
}

/**
 * Next C (not locked): live product detection as default; **any** short
 * answer (literal catalog **or** near) must still beat mood by the frozen
 * margin. Neighbor ≥ 0.80 is **not** a pass. No new keyword list.
 * @param {{
 *   liveProduct: boolean,
 *   shortAnswerHit: boolean,
 *   clauses: readonly object[],
 *   margin: number
 * }} input
 * @returns {{
 *   productPath: boolean,
 *   via: 'live_skip' | 'live_semantic' | 'margin_confirm' | 'short_answer_unconfirmed'
 * }}
 */
export function decideShadowProductPathCNext(input) {
  if (input.liveProduct !== true) return { productPath: false, via: 'live_skip' };
  if (input.shortAnswerHit !== true) return { productPath: true, via: 'live_semantic' };
  const maxDelta = maxClauseProductMinusMood(input.clauses);
  if (decideShadowProductPathA({ maxDelta, margin: input.margin })) {
    return { productPath: true, via: 'margin_confirm' };
  }
  return { productPath: false, via: 'short_answer_unconfirmed' };
}

/**
 * @param {'skip' | 'hit' | 'honesty'} action
 * @returns {'product_short' | 'product_honesty' | 'mood_or_generate'}
 */
export function todayGateLayer(action) {
  if (action === 'hit') return 'product_short';
  if (action === 'honesty') return 'product_honesty';
  return 'mood_or_generate';
}

/**
 * New shadow function: product path only when product clearly outranks mood.
 * Catalog / near hits still have to pass this score (Brief §1).
 * @param {boolean} productPath
 * @returns {'product' | 'mood'}
 */
export function arbitrationLayer(productPath) {
  return productPath === true ? 'product' : 'mood';
}

/**
 * Cold-start degrade: never wait for vectors. Uses the existing literal probe.
 * @param {{ text: string, catalogHit?: boolean, embeddingState?: 'not_ready' | 'error' }} input
 * @param {(args: object) => 'skip' | 'hit' | 'honesty'} resolveGate
 * @returns {{ action: 'skip' | 'hit' | 'honesty', embed_not_ready: true }}
 */
export function simulateEmbedNotReadyDegrade(input, resolveGate) {
  const action = resolveGate({
    text: input.text,
    embeddingState: input.embeddingState || 'not_ready',
    catalogHit: Boolean(input.catalogHit),
    nearAction: null
  });
  return { action, embed_not_ready: true };
}

/**
 * Product path wins only when product score is clearly above mood score.
 * Insufficient gap → not product path.
 * @param {number} productScore
 * @param {number} moodScore
 * @param {number} [margin]
 * @returns {boolean}
 */
export function productClearlyOutranksMood(
  productScore,
  moodScore,
  margin = PRODUCT_MINUS_MOOD_MARGIN
) {
  const product = Number(productScore);
  const mood = Number(moodScore);
  const gap = Number(margin);
  if (!Number.isFinite(product) || !Number.isFinite(mood) || !Number.isFinite(gap)) {
    return false;
  }
  return product > mood + gap;
}
