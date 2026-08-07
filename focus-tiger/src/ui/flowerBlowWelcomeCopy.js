/**
 * Day1 / 久别吹花鼓励 · 观察式文案解析（Phase 2a）。
 * 产品策略 C 见 `FLOWER_BLOW_WELCOME_DESIGN.md`；本模块不触 Dispatcher。
 */

/** 维度 B 调性（无催促、无 missed-you） */
export const FLOWER_BLOW_WELCOME_COPY_KEYS = Object.freeze([
  'FLOWER_BLOW_WELCOME_1',
  'FLOWER_BLOW_WELCOME_2',
  'FLOWER_BLOW_WELCOME_3'
]);

export const FLOWER_BLOW_BUBBLE_HOLD_MS = 3500;
export const FLOWER_BLOW_BUBBLE_FADE_MS = 600;

/**
 * @param {() => number | { random?: () => number, avoidKey?: string | null }} [randomOrOpts]
 * @returns {string}
 */
export function pickFlowerBlowWelcomeCopyKey(randomOrOpts = Math.random) {
  const opts =
    typeof randomOrOpts === 'function'
      ? { random: randomOrOpts }
      : randomOrOpts && typeof randomOrOpts === 'object'
        ? randomOrOpts
        : {};
  const random =
    typeof opts.random === 'function' ? opts.random : Math.random;
  const avoidKey =
    typeof opts.avoidKey === 'string' && opts.avoidKey ? opts.avoidKey : null;

  const pool =
    avoidKey && FLOWER_BLOW_WELCOME_COPY_KEYS.length > 1
      ? FLOWER_BLOW_WELCOME_COPY_KEYS.filter((k) => k !== avoidKey)
      : FLOWER_BLOW_WELCOME_COPY_KEYS;
  const i = Math.min(pool.length - 1, Math.floor(random() * pool.length));
  return pool[i];
}

/**
 * @param {string} [locale]
 * @returns {'en' | 'ja'}
 */
export function normalizeFlowerBlowLocale(locale) {
  return locale === 'ja' ? 'ja' : 'en';
}

/**
 * 气泡内按句换行：英文/日文在 `.` / `。`（及 !?！？）后断行，
 * 避免窄宽下第二行只剩一两个词的孤儿换行。
 * @param {string} text
 * @returns {string[]}
 */
export function splitFlowerBlowBubbleSentences(text) {
  const s = String(text || '').trim();
  if (!s) return [];
  // 日文：。！？后即可断（常无空格）；英文：.!?\s 后断
  const parts = s
    .split(/(?<=[。！？])|(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length ? parts : [s];
}

/**
 * @param {object} opts
 * @param {boolean} [opts.bilingual] 首次造访：双语文叠显（当前 locale 为主字）
 * @param {string} [opts.locale] 用户 locale（默认 en）
 * @param {string} [opts.copyKey] 可注入固定键（Lab 复测）
 * @param {string | null} [opts.avoidCopyKey] 轮换：尽量避开上次键
 * @param {() => number} [opts.random]
 * @param {(locale: string, key: string) => string} opts.tInLocale
 * @returns {{
 *   copyKey: string,
 *   bilingual: boolean,
 *   primaryLocale: 'en' | 'ja',
 *   lines: Array<{ text: string, role: 'primary' | 'secondary' }>
 * }}
 */
export function resolveFlowerBlowWelcomeMessage({
  bilingual = false,
  locale = 'en',
  copyKey,
  avoidCopyKey = null,
  random = Math.random,
  tInLocale
} = {}) {
  if (typeof tInLocale !== 'function') {
    throw new Error('resolveFlowerBlowWelcomeMessage: tInLocale required');
  }
  const key =
    typeof copyKey === 'string' && copyKey
      ? copyKey
      : pickFlowerBlowWelcomeCopyKey({ random, avoidKey: avoidCopyKey });
  const primaryLocale = normalizeFlowerBlowLocale(locale);

  if (bilingual) {
    const secondaryLocale = primaryLocale === 'ja' ? 'en' : 'ja';
    const primaryText = tInLocale(primaryLocale, key);
    const secondaryText = tInLocale(secondaryLocale, key);
    /** @type {Array<{ text: string, role: 'primary' | 'secondary' }>} */
    const lines = [];
    if (primaryText) lines.push({ text: primaryText, role: 'primary' });
    if (secondaryText) lines.push({ text: secondaryText, role: 'secondary' });
    return {
      copyKey: key,
      bilingual: true,
      primaryLocale,
      lines
    };
  }

  const text = tInLocale(primaryLocale, key);
  return {
    copyKey: key,
    bilingual: false,
    primaryLocale,
    lines: text ? [{ text, role: 'primary' }] : []
  };
}
