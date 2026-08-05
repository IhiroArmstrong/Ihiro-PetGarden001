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
 * @param {object} opts
 * @param {boolean} [opts.bilingual] 首次造访：EN+JA 叠显
 * @param {string} [opts.locale] 非双语时跟用户 locale（默认 en）
 * @param {string} [opts.copyKey] 可注入固定键（Lab 复测）
 * @param {() => number} [opts.random]
 * @param {(locale: string, key: string) => string} opts.tInLocale
 * @returns {{ copyKey: string, lines: string[], bilingual: boolean }}
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
  if (bilingual) {
    const enLine = tInLocale('en', key);
    const jaLine = tInLocale('ja', key);
    return {
      copyKey: key,
      bilingual: true,
      lines: [enLine, jaLine].filter(Boolean)
    };
  }
  const loc = locale === 'ja' ? 'ja' : 'en';
  return {
    copyKey: key,
    bilingual: false,
    lines: [tInLocale(loc, key)]
  };
}
