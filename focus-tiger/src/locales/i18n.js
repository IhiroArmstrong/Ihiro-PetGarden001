/**
 * 多语言文案骨架（EMOTION_BIBLE.md 第七部分）。
 *
 * 业务逻辑只引用标识符（如 MINDFUL_FOCUS_MILESTONE_1），
 * 禁止把面向用户的句子硬编码在触发逻辑里。
 */

import zh from './zh.json';
import en from './en.json';

/** @type {Record<string, Record<string, string>>} */
const DICTIONARIES = {
  zh,
  en
};

/** 默认语言：英文（产品面向海外市场）；中文作为可切换备选保留。 @type {'zh' | 'en'} */
let currentLocale = 'en';

/** locale 变更监听器（UI 模块借此在语言切换时刷新已渲染文案） @type {Set<(locale: 'zh' | 'en') => void>} */
const localeListeners = new Set();

/** 轮换文案池：场景键 → 具体条目标识符列表 */
export const COPY_POOLS = Object.freeze({
  MINDFUL_FOCUS_MILESTONE: [
    'MINDFUL_FOCUS_MILESTONE_1',
    'MINDFUL_FOCUS_MILESTONE_2',
    'MINDFUL_FOCUS_MILESTONE_3',
    'MINDFUL_FOCUS_MILESTONE_4'
  ],
  STRETCH_REMINDER: [
    'STRETCH_REMINDER_1',
    'STRETCH_REMINDER_2',
    'STRETCH_REMINDER_3'
  ]
});

/**
 * @param {'zh' | 'en'} locale
 */
export function setLocale(locale) {
  if (!DICTIONARIES[locale]) {
    console.warn(`[i18n] 未知语言 "${locale}"，保持 ${currentLocale}`);
    return;
  }
  if (currentLocale === locale) return;
  currentLocale = locale;
  localeListeners.forEach((fn) => fn(locale));
}

/**
 * 注册语言切换回调（返回取消函数）。
 * @param {(locale: 'zh' | 'en') => void} fn
 * @returns {() => void}
 */
export function onLocaleChange(fn) {
  localeListeners.add(fn);
  return () => localeListeners.delete(fn);
}

/** @returns {'zh' | 'en'} */
export function getLocale() {
  return currentLocale;
}

/**
 * 按标识符取文案；缺键时回退默认语言 en，再缺则返回标识符本身。
 * @param {string} key
 * @returns {string}
 */
export function t(key) {
  const dict = DICTIONARIES[currentLocale] || {};
  if (dict[key]) return dict[key];
  if (currentLocale !== 'en' && en[key]) return en[key];
  console.warn(`[i18n] 缺少文案键 "${key}"（locale=${currentLocale}）`);
  return key;
}

/**
 * 从文案池随机取一句。
 * @param {keyof typeof COPY_POOLS} poolKey
 * @returns {string}
 */
export function tPool(poolKey) {
  const keys = COPY_POOLS[poolKey];
  if (!keys || keys.length === 0) {
    console.warn(`[i18n] 空文案池 "${poolKey}"`);
    return poolKey;
  }
  const pick = keys[Math.floor(Math.random() * keys.length)];
  return t(pick);
}
