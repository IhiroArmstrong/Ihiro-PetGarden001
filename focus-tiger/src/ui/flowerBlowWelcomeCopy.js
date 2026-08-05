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
 * @param {() => number} [random]
 * @returns {string}
 */
export function pickFlowerBlowWelcomeCopyKey(random = Math.random) {
  const i = Math.min(
    FLOWER_BLOW_WELCOME_COPY_KEYS.length - 1,
    Math.floor(random() * FLOWER_BLOW_WELCOME_COPY_KEYS.length)
  );
  return FLOWER_BLOW_WELCOME_COPY_KEYS[i];
}

/**
 * @param {string} [locale]
 * @returns {'en' | 'ja'}
 */
export function normalizeFlowerBlowLocale(locale) {
  return locale === 'ja' ? 'ja' : 'en';
}

/**
 * @param {object} opts
 * @param {boolean} [opts.bilingual] 首次造访：双语文叠显（当前 locale 为主字）
 * @param {string} [opts.locale] 用户 locale（默认 en）
 * @param {string} [opts.copyKey] 可注入固定键（Lab 复测）
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
  random = Math.random,
  tInLocale
} = {}) {
  if (typeof tInLocale !== 'function') {
    throw new Error('resolveFlowerBlowWelcomeMessage: tInLocale required');
  }
  const key =
    typeof copyKey === 'string' && copyKey
      ? copyKey
      : pickFlowerBlowWelcomeCopyKey(random);
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
