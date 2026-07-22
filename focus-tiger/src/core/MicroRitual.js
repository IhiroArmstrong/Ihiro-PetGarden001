/**
 * 「一分钟呼吸」微仪式常量与时长解析。
 * 权威方案：docs/MICRO_RITUAL_PLAN.md
 *
 * 记账：recordCompletion(1) + PracticeDaysStore.markToday(1)；
 * 不走 Celebrating / noteSessionComplete；反馈直接 sessionComplete。
 */

/** 产品默认墙钟时长（ms）。 */
export const MICRO_RITUAL_MS_DEFAULT = 60_000;

/** 吸/呼文案相位（与 Arrival Breath 同拍）。 */
export const MICRO_RITUAL_BREATH_PHASE_MS = 2_500;

/** 完成后写入 DailyCompletion / PracticeDays 的分钟数。 */
export const MICRO_RITUAL_DURATION_MINUTES = 1;

/** e2e / 调试最短时长（ms）；过短会让相位几乎看不见。 */
export const MICRO_RITUAL_MS_MIN = 500;

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
 * `?microRitualMs=1500` → 1.5s（e2e）；缺省/非法 → 60s；夹在 MIN–DEFAULT。
 * @param {string} [search]
 * @returns {number}
 */
export function resolveMicroRitualMs(search = '') {
  const raw = new URLSearchParams(search).get('microRitualMs');
  if (raw == null || raw === '') return MICRO_RITUAL_MS_DEFAULT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return MICRO_RITUAL_MS_DEFAULT;
  return Math.min(
    MICRO_RITUAL_MS_DEFAULT,
    Math.max(MICRO_RITUAL_MS_MIN, Math.round(n))
  );
}
