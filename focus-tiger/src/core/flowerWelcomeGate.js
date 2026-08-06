/**
 * Day1 / 久别吹花门闩 + feature flag（Phase 2b）。
 * SSOT：`FLOWER_BLOW_WELCOME_DESIGN.md` 策略 C；调度仍走 WELCOME_APP。
 */

import { getLocalDateKey } from '../utils/localDate.js';
import { calendarDaysBetween } from './RetentionTelemetry.js';

export const FLOWER_WELCOME_STORAGE_KEY = 'focus-tiger.flower-welcome.v1';
/** Kill / force via `?flowerWelcome=0|1` or this key (`0`/`1`). */
export const FLOWER_WELCOME_FLAG_STORAGE_KEY =
  'focus-tiger.flower-welcome-flag.v1';

/** 久别：≥ 该自然日差未打开 → 强制吹花 */
export const FLOWER_WELCOME_ABSENCE_DAYS = 3;

export const FLOWER_WELCOME_EMOTION_KEY = 'conjureFlowersBlowAway';

/**
 * @typedef {{
 *   lastOpenDateKey: string | null,
 *   firstBubbleDone: boolean,
 *   lastCopyKey: string | null
 * }} FlowerWelcomeState
 */

/**
 * @param {unknown} raw
 * @returns {FlowerWelcomeState}
 */
export function normalizeFlowerWelcomeState(raw) {
  if (!raw || typeof raw !== 'object') {
    return { lastOpenDateKey: null, firstBubbleDone: false, lastCopyKey: null };
  }
  const o = /** @type {{
    lastOpenDateKey?: unknown,
    firstBubbleDone?: unknown,
    lastCopyKey?: unknown
  }} */ (raw);
  return {
    lastOpenDateKey:
      typeof o.lastOpenDateKey === 'string' && o.lastOpenDateKey
        ? o.lastOpenDateKey
        : null,
    firstBubbleDone: Boolean(o.firstBubbleDone),
    lastCopyKey:
      typeof o.lastCopyKey === 'string' && o.lastCopyKey ? o.lastCopyKey : null
  };
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {FlowerWelcomeState}
 */
export function readFlowerWelcomeState(storage) {
  if (!storage) return normalizeFlowerWelcomeState(null);
  try {
    const raw = storage.getItem(FLOWER_WELCOME_STORAGE_KEY);
    if (!raw) return normalizeFlowerWelcomeState(null);
    return normalizeFlowerWelcomeState(JSON.parse(raw));
  } catch {
    return normalizeFlowerWelcomeState(null);
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {FlowerWelcomeState} state
 */
export function writeFlowerWelcomeState(storage, state) {
  if (!storage) return;
  try {
    storage.setItem(
      FLOWER_WELCOME_STORAGE_KEY,
      JSON.stringify({
        lastOpenDateKey: state.lastOpenDateKey,
        firstBubbleDone: Boolean(state.firstBubbleDone),
        lastCopyKey: state.lastCopyKey || null
      })
    );
  } catch {
    // ignore
  }
}

/**
 * Feature flag：默认 **开**（Phase 2b 产品接线）；可用 URL / storage 关闭。
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {string} [opts.search] location.search
 * @returns {boolean}
 */
export function isFlowerWelcomeEnabled({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  search = typeof location !== 'undefined' ? location.search : ''
} = {}) {
  const q = String(search || '');
  if (/(?:^|[?&])flowerWelcome=0(?:&|$)/.test(q)) return false;
  if (/(?:^|[?&])flowerWelcome=1(?:&|$)/.test(q)) return true;
  if (storage) {
    try {
      const v = storage.getItem(FLOWER_WELCOME_FLAG_STORAGE_KEY);
      if (v === '0' || v === 'false') return false;
      if (v === '1' || v === 'true') return true;
    } catch {
      // ignore
    }
  }
  return true;
}

/**
 * Day1（从未记过 lastOpen）或久别（≥ ABSENCE_DAYS）→ 强制吹花。
 * 须在 touch 之前调用（读的是上一趟的 lastOpen）。
 *
 * @param {object} opts
 * @param {Storage | null | undefined} [opts.storage]
 * @param {() => Date} [opts.now]
 * @param {boolean} [opts.enabled]
 * @returns {{ force: boolean, reason: string, bilingual: boolean }}
 */
export function resolveFlowerWelcomeForce({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date(),
  enabled = isFlowerWelcomeEnabled({ storage })
} = {}) {
  if (!enabled) {
    return { force: false, reason: 'flag-off', bilingual: false };
  }
  const state = readFlowerWelcomeState(storage);
  const today = getLocalDateKey(now());
  const bilingual = !state.firstBubbleDone;

  if (!state.lastOpenDateKey) {
    return { force: true, reason: 'day1', bilingual };
  }
  const days = calendarDaysBetween(state.lastOpenDateKey, today);
  if (days >= FLOWER_WELCOME_ABSENCE_DAYS) {
    return { force: true, reason: 'absence', bilingual };
  }
  return { force: false, reason: 'ordinary', bilingual: false };
}

/**
 * Day1 / 久别吹花是否压过 wellness 斗篷/清晨苏醒（用户 2026-08-06 纠正）。
 * @param {{ force?: boolean } | null | undefined} flowerForce
 * @returns {boolean}
 */
export function shouldPreferFlowerWelcomeOverWellness(flowerForce) {
  return flowerForce?.force === true;
}

/**
 * 每次冷启动评估欢迎后调用：推进 lastOpen（勿在此标记气泡已见）。
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {() => Date} [opts.now]
 */
export function touchFlowerWelcomeLastOpen(
  storage,
  { now = () => new Date() } = {}
) {
  const prev = readFlowerWelcomeState(storage);
  writeFlowerWelcomeState(storage, {
    lastOpenDateKey: getLocalDateKey(now()),
    firstBubbleDone: prev.firstBubbleDone,
    lastCopyKey: prev.lastCopyKey
  });
}

/**
 * 产品路径实际弹出鼓励气泡后调用（首次 → 之后跟 locale）。
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {string | null} [opts.copyKey] 本次播出文案键（轮换记账）
 */
export function markFlowerWelcomeBubbleShown(storage, opts = {}) {
  const prev = readFlowerWelcomeState(storage);
  const copyKey =
    typeof opts.copyKey === 'string' && opts.copyKey
      ? opts.copyKey
      : prev.lastCopyKey;
  writeFlowerWelcomeState(storage, {
    lastOpenDateKey: prev.lastOpenDateKey,
    firstBubbleDone: true,
    lastCopyKey: copyKey
  });
}
