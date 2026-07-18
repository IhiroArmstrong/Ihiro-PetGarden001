/**
 * Session Intention / Choose 本地存储 —— 仅保存非空意图，最近 5 条。
 * Notice 状态点选严禁写入本存储。
 */

import { getStorage, setStorage } from '../utils/Storage.js';

export const INTENTION_STORAGE_KEY = 'focus-tiger.intentions.v1';
export const INTENTION_MAX_SAVED = 5;

/**
 * @param {unknown} text
 * @returns {string}
 */
export function normalizeIntentionText(text) {
  return String(text ?? '').trim();
}

/**
 * @param {unknown} source
 * @returns {'icon' | 'typed'}
 */
export function normalizeIntentionSource(source) {
  return source === 'icon' ? 'icon' : 'typed';
}

/**
 * @param {unknown} existing
 * @param {{ text: string, source?: 'icon' | 'typed', timestamp: number }} entry
 * @param {number} [maxEntries]
 */
export function trimIntentions(
  existing,
  entry,
  maxEntries = INTENTION_MAX_SAVED
) {
  const list = Array.isArray(existing) ? existing : [];
  return [...list, entry].slice(-maxEntries);
}

/**
 * @param {string} template
 * @param {string} text
 * @returns {string}
 */
export function formatIntentionEcho(template, text) {
  return String(template).replaceAll('{text}', text);
}

/**
 * @param {'icon' | 'typed' | string | null | undefined} source
 * @returns {'SESSION_INTENTION_ECHO_ICON' | 'SESSION_INTENTION_ECHO_TYPED'}
 */
export function intentionEchoKey(source) {
  return source === 'icon'
    ? 'SESSION_INTENTION_ECHO_ICON'
    : 'SESSION_INTENTION_ECHO_TYPED';
}

/**
 * 非空才写入；空字符串返回 null 且不触碰存储。
 * @param {unknown} text
 * @param {object} [options]
 * @param {'icon' | 'typed'} [options.source]
 * @param {() => number} [options.now]
 * @returns {{ text: string, source: 'icon' | 'typed', timestamp: number } | null}
 */
export function recordIntention(text, options = {}) {
  const now =
    typeof options.now === 'function' ? options.now : () => Date.now();
  const normalized = normalizeIntentionText(text);
  if (!normalized) return null;
  const entry = {
    text: normalized,
    source: normalizeIntentionSource(options.source),
    timestamp: now()
  };
  const saved = trimIntentions(getStorage(INTENTION_STORAGE_KEY, []), entry);
  setStorage(INTENTION_STORAGE_KEY, saved);
  return entry;
}
