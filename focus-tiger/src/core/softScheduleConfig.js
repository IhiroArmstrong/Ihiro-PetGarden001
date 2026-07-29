/**
 * Soft-schedule config SSOT（路径 B · 本地真相源）。
 *
 * 契约见 docs/CLOUD_CONFIG_V1.md（原则 1–6、A1–A6）。
 * 云端启用前：本文件 = 发版行为；CloudConfigClient 默认 mode:local 读此表。
 */

/** @typedef {{ id: string, weight: number }} WeightedVariant */

export const SOFT_SCHEDULE_SCHEMA_VERSION = 1;

/** Celebrating 两套舞：发版默认 50/50（原则 6 / A3）。 */
export const DEFAULT_CELEBRATE_DANCE_WEIGHTS = Object.freeze([
  Object.freeze({ id: 'celebrateDance', weight: 0.5 }),
  Object.freeze({ id: 'celebrateDanceV2', weight: 0.5 })
]);

/** @deprecated 等权列表；优先用 DEFAULT_CELEBRATE_DANCE_WEIGHTS */
export const CELEBRATE_DANCE_VARIANTS = Object.freeze(
  DEFAULT_CELEBRATE_DANCE_WEIGHTS.map((v) => v.id)
);

/**
 * 技术验证用每日 messageKey 池（A1）：借用已有 locale 键，**不**表示产品「今日一炷香」文案。
 * 正式场景另排文案任务后再换池。
 */
export const DAILY_MESSAGE_TECH_VERIFY_KEYS = Object.freeze([
  'MINDFUL_FOCUS_MILESTONE_1',
  'MINDFUL_FOCUS_MILESTONE_2',
  'MINDFUL_FOCUS_MILESTONE_3'
]);

/**
 * @param {string} emotionKey
 * @returns {ReadonlyArray<WeightedVariant> | null} null = 未配置，调用方用默认行为
 */
export function getLocalEmotionWeightTable(emotionKey) {
  const key = String(emotionKey || '')
    .trim()
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
  if (key === 'celebrating') {
    return DEFAULT_CELEBRATE_DANCE_WEIGHTS;
  }
  return null;
}

/**
 * 加权随机；有效权重全 ≤0 时回退 fallback（A6）。
 * @param {ReadonlyArray<WeightedVariant>|null|undefined} variants
 * @param {() => number} [random]
 * @param {ReadonlyArray<WeightedVariant>} [fallback]
 * @returns {string}
 */
export function pickWeightedVariantId(
  variants,
  random = Math.random,
  fallback = DEFAULT_CELEBRATE_DANCE_WEIGHTS
) {
  const table = normalizeWeightTable(variants);
  const positive = table.filter((v) => v.weight > 0);
  const pool =
    positive.length > 0 ? positive : normalizeWeightTable(fallback).filter((v) => v.weight > 0);

  if (pool.length === 0) {
    return fallback[0]?.id ?? CELEBRATE_DANCE_VARIANTS[0];
  }

  const total = pool.reduce((sum, v) => sum + v.weight, 0);
  let r = Math.max(0, Math.min(0.999999999, Number(random()) || 0)) * total;
  for (const v of pool) {
    if (r < v.weight) return v.id;
    r -= v.weight;
  }
  return pool[pool.length - 1].id;
}

/**
 * Celebrating 变体挑选（发版行为 = 50/50；可注入权重表）。
 * @param {() => number} [random]
 * @param {ReadonlyArray<WeightedVariant>|null|undefined} [weights]
 * @returns {'celebrateDance' | 'celebrateDanceV2' | string}
 */
export function pickCelebrateDanceVariant(
  random = Math.random,
  weights = DEFAULT_CELEBRATE_DANCE_WEIGHTS
) {
  return pickWeightedVariantId(weights, random, DEFAULT_CELEBRATE_DANCE_WEIGHTS);
}

/**
 * 按自然日稳定选取 messageKey（同 locale+date+slot → 同键）。
 * @param {{ locale?: string, localDate: string, slot?: string, keys?: ReadonlyArray<string> }} opts
 * @returns {{ messageKey: string, variantSeed: string, schemaVersion: number }}
 */
export function pickDailyMessageKey({
  locale = 'en',
  localDate,
  slot = 'tech_verify',
  keys = DAILY_MESSAGE_TECH_VERIFY_KEYS
} = {}) {
  const list = Array.isArray(keys) && keys.length > 0 ? keys : DAILY_MESSAGE_TECH_VERIFY_KEYS;
  const date = String(localDate || '').trim();
  const loc = String(locale || 'en').trim() || 'en';
  const slotKey = String(slot || 'tech_verify').trim() || 'tech_verify';
  const seed = `${date}:${loc}:${slotKey}`;
  const idx = list.length === 0 ? 0 : stableIndex(seed, list.length);
  const messageKey = list[idx] ?? list[0];
  return {
    schemaVersion: SOFT_SCHEDULE_SCHEMA_VERSION,
    messageKey,
    variantSeed: seed
  };
}

/**
 * @param {ReadonlyArray<WeightedVariant>|null|undefined} variants
 * @returns {WeightedVariant[]}
 */
function normalizeWeightTable(variants) {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((v) => ({
      id: String(v?.id || '').trim(),
      weight: Number(v?.weight)
    }))
    .filter((v) => v.id && Number.isFinite(v.weight));
}

/**
 * @param {string} seed
 * @param {number} modulo
 */
function stableIndex(seed, modulo) {
  if (modulo <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % modulo;
}
