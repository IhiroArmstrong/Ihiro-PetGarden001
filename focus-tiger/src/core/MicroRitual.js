/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Idle 呼吸练习（原「一分钟呼吸」微仪式）常量与时长解析。
 * 权威方案：docs/MICRO_RITUAL_PLAN.md
 *
 * 记账：recordCompletion(所选分钟) + PracticeDaysStore.markToday(所选分钟)；
 * 不走 Celebrating / noteSessionComplete；反馈直接 sessionComplete + 浅接 Reflection。
 */

/** 可选练习时长（分钟）；chip 点选即开。 */
export const MICRO_RITUAL_DURATION_OPTIONS_MINUTES = Object.freeze([
  1, 3, 5, 10, 20
]);

/** 产品默认墙钟时长（ms）= 1 分钟。 */
export const MICRO_RITUAL_MS_DEFAULT = 60_000;

/** 最长可选时长（ms）= 20 分钟。 */
export const MICRO_RITUAL_MS_MAX =
  MICRO_RITUAL_DURATION_OPTIONS_MINUTES[
    MICRO_RITUAL_DURATION_OPTIONS_MINUTES.length - 1
  ] * 60_000;

/** 吸/呼文案相位（与 Arrival Breath 同拍）。 */
export const MICRO_RITUAL_BREATH_PHASE_MS = 2_500;

/**
 * @deprecated 默认分钟仍为 1；完成记账请用本次所选分钟（见 MicroRitualUI.getDurationMinutes）。
 */
export const MICRO_RITUAL_DURATION_MINUTES = 1;

/** e2e / 调试最短时长（ms）；过短会让相位几乎看不见。 */
export const MICRO_RITUAL_MS_MIN = 500;

/**
 * @param {number} minutes
 * @returns {number}
 */
export function microRitualMinutesToMs(minutes) {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return MICRO_RITUAL_MS_DEFAULT;
  return Math.round(m * 60_000);
}

/**
 * 合法选项分钟；非法 → 默认 1。
 * @param {unknown} minutes
 * @returns {number}
 */
export function normalizeMicroRitualMinutes(minutes) {
  const m = Number(minutes);
  if (
    Number.isFinite(m) &&
    MICRO_RITUAL_DURATION_OPTIONS_MINUTES.includes(m)
  ) {
    return m;
  }
  return MICRO_RITUAL_DURATION_MINUTES;
}

/**
 * 文案相位：偶数段 = Inhale，奇数段 = Exhale（与 UI 文案键一致）。
 * @param {number} elapsedMs
 * @param {number} [phaseMs]
 * @returns {boolean}
 */
export function isInhalePhase(
  elapsedMs,
  phaseMs = MICRO_RITUAL_BREATH_PHASE_MS
) {
  const phase = Math.max(1, Number(phaseMs) || MICRO_RITUAL_BREATH_PHASE_MS);
  const t = Math.max(0, Number(elapsedMs) || 0);
  return Math.floor(t / phase) % 2 === 0;
}

/**
 * 回前台 / 定时器共用的墙钟完成判定。
 * @param {number | null | undefined} startedAtMs
 * @param {number} durationMs
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function shouldCompleteMicroRitualByWallClock(
  startedAtMs,
  durationMs,
  nowMs = Date.now()
) {
  if (startedAtMs == null || !Number.isFinite(startedAtMs)) return false;
  const dur = Number(durationMs);
  if (!(dur > 0)) return false;
  return nowMs - startedAtMs >= dur;
}

/**
 * `?microRitualMs=` → e2e 缩短墙钟；缺省/非法 → 60s；夹在 MIN–MAX（20 分钟）。
 * @param {string} [search]
 * @returns {number}
 */
export function resolveMicroRitualMs(search = '') {
  const raw = new URLSearchParams(search).get('microRitualMs');
  if (raw == null || raw === '') return MICRO_RITUAL_MS_DEFAULT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return MICRO_RITUAL_MS_DEFAULT;
  return Math.min(
    MICRO_RITUAL_MS_MAX,
    Math.max(MICRO_RITUAL_MS_MIN, Math.round(n))
  );
}

/**
 * URL 是否带 e2e 缩短参数（有则开练时用 resolveMicroRitualMs，仍按 chip 分钟记账）。
 * @param {string} [search]
 * @returns {boolean}
 */
export function hasMicroRitualMsOverride(search = '') {
  const raw = new URLSearchParams(search).get('microRitualMs');
  return raw != null && raw !== '';
}
