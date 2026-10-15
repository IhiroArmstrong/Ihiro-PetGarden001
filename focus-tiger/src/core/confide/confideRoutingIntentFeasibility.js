/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Research-only helpers: ask-feature vs vent metrics and leave-one-template-out.
 * Not wired to the send path. Margin 0.01 stays frozen.
 */

export const ROUTING_INTENT_ASK_FEATURE = 'ask_feature';
export const ROUTING_INTENT_VENT = 'vent';

const ASK_CLASSES = new Set([
  'product-short-answer',
  'product-honest-empty',
  'mixed',
  'product-over-emotion',
  'badge-yin-coin'
]);

const VENT_CLASSES = new Set(['life-emotion', 'mixed-emotion-dominant', 'chitchat']);

export const ROUTING_INTENT_MARGIN_GRID = Object.freeze([
  0, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1
]);

/**
 * @param {string} classId
 * @returns {'ask_feature' | 'vent' | null}
 */
export function goldIntentFromClass(classId) {
  const id = String(classId || '').trim();
  if (ASK_CLASSES.has(id)) return ROUTING_INTENT_ASK_FEATURE;
  if (VENT_CLASSES.has(id)) return ROUTING_INTENT_VENT;
  return null;
}

/**
 * @param {unknown} item
 * @returns {string}
 */
export function templateGroupOf(item) {
  const row = item && typeof item === 'object' ? item : {};
  const dim = String(row.dim || '').trim();
  if (dim) return dim;
  const klass = String(row.class_id || row.classId || row.class || '').trim();
  return klass || 'ungrouped';
}

/**
 * @param {number} productScore
 * @param {number} moodScore
 * @param {number} margin
 * @returns {'ask_feature' | 'vent'}
 */
export function intentFromProductMinusMood(productScore, moodScore, margin) {
  const product = Number(productScore);
  const mood = Number(moodScore);
  const gap = Number(margin);
  if (!Number.isFinite(product) || !Number.isFinite(mood) || !Number.isFinite(gap)) {
    return ROUTING_INTENT_VENT;
  }
  return product > mood + gap ? ROUTING_INTENT_ASK_FEATURE : ROUTING_INTENT_VENT;
}

/**
 * @param {boolean} productPath
 * @returns {'ask_feature' | 'vent'}
 */
export function intentFromProductPath(productPath) {
  return productPath === true ? ROUTING_INTENT_ASK_FEATURE : ROUTING_INTENT_VENT;
}

/**
 * @param {readonly string[]} yTrue
 * @param {readonly string[]} yPred
 * @param {string} positive
 */
export function binaryClassMetrics(yTrue, yPred, positive) {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  const n = Math.min(yTrue.length, yPred.length);
  for (let i = 0; i < n; i += 1) {
    const gold = yTrue[i] === positive;
    const pred = yPred[i] === positive;
    if (gold && pred) tp += 1;
    else if (!gold && pred) fp += 1;
    else if (gold && !pred) fn += 1;
    else tn += 1;
  }
  const precision = tp + fp === 0 ? null : tp / (tp + fp);
  const recall = tp + fn === 0 ? null : tp / (tp + fn);
  const f1 =
    precision == null || recall == null || precision + recall === 0
      ? null
      : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1, support: tp + fn, tp, fp, fn, tn };
}

function round4(value) {
  return value == null ? null : Math.round(value * 10000) / 10000;
}

/**
 * @param {readonly string[]} yTrue
 * @param {readonly string[]} yPred
 */
export function bothIntentMetrics(yTrue, yPred) {
  const n = Math.min(yTrue.length, yPred.length);
  let correct = 0;
  for (let i = 0; i < n; i += 1) {
    if (yTrue[i] === yPred[i]) correct += 1;
  }
  const ask = binaryClassMetrics(yTrue, yPred, ROUTING_INTENT_ASK_FEATURE);
  const vent = binaryClassMetrics(yTrue, yPred, ROUTING_INTENT_VENT);
  const f1s = [ask.f1, vent.f1].filter((v) => v != null);
  const macroF1 = f1s.length === 0 ? null : f1s.reduce((a, b) => a + b, 0) / f1s.length;
  return {
    n,
    accuracy: n === 0 ? null : round4(correct / n),
    macro_f1: round4(macroF1),
    ask_feature: {
      precision: round4(ask.precision),
      recall: round4(ask.recall),
      f1: round4(ask.f1),
      support: ask.support
    },
    vent: {
      precision: round4(vent.precision),
      recall: round4(vent.recall),
      f1: round4(vent.f1),
      support: vent.support
    }
  };
}

/**
 * @param {readonly number[]} values
 * @param {number} p
 */
export function percentileSorted(values, p) {
  const nums = values.filter((v) => Number.isFinite(v)).slice().sort((a, b) => a - b);
  if (nums.length === 0) return null;
  const clamped = Math.min(1, Math.max(0, Number(p)));
  const idx = (nums.length - 1) * clamped;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return nums[lo];
  const w = idx - lo;
  return nums[lo] * (1 - w) + nums[hi] * w;
}

/**
 * @param {readonly { gold: string, product: number, mood: number }[]} train
 * @param {readonly number[]} grid
 */
export function pickMarginOnTrain(train, grid = ROUTING_INTENT_MARGIN_GRID) {
  let bestMargin = 0;
  let bestF1 = -1;
  for (const margin of grid) {
    const gold = train.map((row) => row.gold);
    const pred = train.map((row) =>
      intentFromProductMinusMood(row.product, row.mood, margin)
    );
    const metrics = bothIntentMetrics(gold, pred);
    const score = metrics.macro_f1 == null ? -1 : metrics.macro_f1;
    if (score > bestF1) {
      bestF1 = score;
      bestMargin = margin;
    }
  }
  return { margin: bestMargin, macro_f1: bestF1 < 0 ? null : bestF1 };
}

/**
 * @param {readonly { group: string, gold: string, product: number, mood: number }[]} rows
 * @param {readonly number[]} [grid]
 */
export function leaveOneTemplateOutMargin(rows, grid = ROUTING_INTENT_MARGIN_GRID) {
  const groups = [...new Set(rows.map((row) => row.group))];
  const yTrue = [];
  const yPred = [];
  const folds = [];
  for (const held of groups) {
    const train = rows.filter((row) => row.group !== held);
    const test = rows.filter((row) => row.group === held);
    if (train.length === 0 || test.length === 0) continue;
    const picked = pickMarginOnTrain(train, grid);
    const gold = test.map((row) => row.gold);
    const pred = test.map((row) =>
      intentFromProductMinusMood(row.product, row.mood, picked.margin)
    );
    yTrue.push(...gold);
    yPred.push(...pred);
    folds.push({
      group: held,
      n: test.length,
      margin: picked.margin,
      metrics: bothIntentMetrics(gold, pred)
    });
  }
  return {
    n: yTrue.length,
    groups: groups.length,
    pooled: bothIntentMetrics(yTrue, yPred),
    folds
  };
}

/**
 * @param {{ moodScore?: number, emotionBucket?: string | null, moodFloor: number, emotionBuckets: readonly string[] }} input
 */
export function emotionHalfMayMerge(input) {
  const mood = Number(input.moodScore);
  const floor = Number(input.moodFloor);
  if (!Number.isFinite(mood) || !Number.isFinite(floor) || mood < floor) return false;
  const bucket = String(input.emotionBucket || '');
  return input.emotionBuckets.includes(bucket);
}
