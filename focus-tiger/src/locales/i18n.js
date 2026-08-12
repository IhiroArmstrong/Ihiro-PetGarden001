/**
 * 多语言文案骨架（EMOTION_BIBLE.md 第七部分）。
 *
 * 业务逻辑只引用标识符（如 MINDFUL_FOCUS_MILESTONE_1），
 * 禁止把面向用户的句子硬编码在触发逻辑里。
 *
 * Picker policy: only `ready` locales (see localeRegistry.js / COVERAGE_GAP_AUDIT §9.6).
 */

import zh from './zh.json' with { type: 'json' };
import en from './en.json' with { type: 'json' };
import ja from './ja.json' with { type: 'json' };
import {
  DEFAULT_LOCALE,
  isReadyLocale
} from './localeRegistry.js';
import {
  readLocalePreference,
  writeLocalePreference
} from './localePreference.js';

/** @type {Record<string, Record<string, string>>} */
const DICTIONARIES = {
  zh,
  en,
  ja
};

/** @type {import('./localeRegistry.js').LocaleId} */
let currentLocale = DEFAULT_LOCALE;

/** @type {Set<(locale: import('./localeRegistry.js').LocaleId) => void>} */
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
  ],
  REFOCUS_ACKNOWLEDGE: [
    'REFOCUS_ACKNOWLEDGE_1',
    'REFOCUS_ACKNOWLEDGE_2',
    'REFOCUS_ACKNOWLEDGE_3'
  ],
  ACTIVE_RECOVER: [
    'ACTIVE_RECOVER_1',
    'ACTIVE_RECOVER_2',
    'ACTIVE_RECOVER_3'
  ],
  FLOWER_BLOW_WELCOME: [
    'FLOWER_BLOW_WELCOME_1',
    'FLOWER_BLOW_WELCOME_2',
    'FLOWER_BLOW_WELCOME_3'
  ],
  ACROSS_TOOLS_IDLE: ['ACROSS_TOOLS_IDLE_1', 'ACROSS_TOOLS_IDLE_2'],
  /** Growth ③ · quiet line of the day (deterministic by localDate; en+ja product). */
  DAILY_ZEN_QUOTE: [
    'DAILY_ZEN_QUOTE_1',
    'DAILY_ZEN_QUOTE_2',
    'DAILY_ZEN_QUOTE_3',
    'DAILY_ZEN_QUOTE_4',
    'DAILY_ZEN_QUOTE_5',
    'DAILY_ZEN_QUOTE_6',
    'DAILY_ZEN_QUOTE_7'
  ],
  /** Mid-session awareness card (repeatable; not Moment Whisper). */
  FOCUS_AWARENESS: [
    'FOCUS_AWARENESS_1',
    'FOCUS_AWARENESS_2',
    'FOCUS_AWARENESS_3'
  ]
});

/**
 * Apply stored preference once at boot (before UI mounts).
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./localeRegistry.js').LocaleId}
 */
export function bootLocaleFromPreference(storage = globalThis.localStorage) {
  const preferred = readLocalePreference(storage);
  currentLocale = preferred;
  return currentLocale;
}

/**
 * @param {string} locale
 * @param {{ persist?: boolean, storage?: Storage | null }} [opts]
 */
export function setLocale(locale, opts = {}) {
  const persist = opts.persist !== false;
  const storage = opts.storage === undefined ? globalThis.localStorage : opts.storage;

  if (!isReadyLocale(locale) || !DICTIONARIES[locale]) {
    console.warn(`[i18n] 未知或未就绪语言 "${locale}"，保持 ${currentLocale}`);
    return;
  }
  if (currentLocale === locale) {
    if (persist) writeLocalePreference(locale, storage);
    return;
  }
  currentLocale = /** @type {import('./localeRegistry.js').LocaleId} */ (locale);
  if (persist) writeLocalePreference(currentLocale, storage);
  localeListeners.forEach((fn) => fn(currentLocale));
}

/**
 * @param {(locale: import('./localeRegistry.js').LocaleId) => void} fn
 * @returns {() => void}
 */
export function onLocaleChange(fn) {
  localeListeners.add(fn);
  return () => localeListeners.delete(fn);
}

/** @returns {import('./localeRegistry.js').LocaleId} */
export function getLocale() {
  return currentLocale;
}

/**
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
 * Look up a key in an explicit locale (bilingual stacks / Lab previews).
 * @param {string} locale
 * @param {string} key
 * @returns {string}
 */
export function tInLocale(locale, key) {
  const dict = DICTIONARIES[locale] || {};
  if (dict[key]) return dict[key];
  if (locale !== 'en' && en[key]) return en[key];
  console.warn(`[i18n] 缺少文案键 "${key}"（locale=${locale}）`);
  return key;
}

/**
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

/**
 * Dictionary key sets for parity tests (ready locales with loaded dicts only).
 * @returns {Record<string, string[]>}
 */
export function listLoadedDictionaryKeys() {
  /** @type {Record<string, string[]>} */
  const out = {};
  for (const [id, dict] of Object.entries(DICTIONARIES)) {
    out[id] = Object.keys(dict).sort();
  }
  return out;
}
