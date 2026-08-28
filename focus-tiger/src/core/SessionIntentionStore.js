/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Session Intention / Choose 本地存储 —— 仅保存非空意图，最近 5 条。
 * 非空 Choose 同时双写 presence-signals.v1（`arrival_choose` · freeText）。
 * Notice 状态点选写入 presence-signals.v1（`arrival_notice`），严禁写入本存储。
 */

import { getStorage, setStorage } from '../utils/Storage.js';
import { appendIntentionPresenceSignal } from './intentionPresenceBridge.js';

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
 * 合并本场 Choose → 会话意图闩（供 Reflection 回显）。
 * - pending 非空：覆盖
 * - pending 空且 `clearIfEmpty`：清空（Arrival Skip / 未选）
 * - pending 空且不清空：**保留**现闩（防止二次 `beginFocus` 把已记下的意图抹成 ''）
 *
 * @param {{ text?: string, source?: string } | null | undefined} current
 * @param {{ text?: string, source?: string } | null | undefined} pending
 * @param {{ clearIfEmpty?: boolean }} [options]
 * @returns {{ text: string, source: 'icon' | 'typed' }}
 */
export function resolveSessionIntentionLatch(
  current,
  pending,
  { clearIfEmpty = false } = {}
) {
  const pendingText = normalizeIntentionText(pending?.text);
  if (pendingText) {
    return {
      text: pendingText,
      source: normalizeIntentionSource(pending?.source)
    };
  }
  if (clearIfEmpty) {
    return { text: '', source: 'typed' };
  }
  const keep = normalizeIntentionText(current?.text);
  return {
    text: keep,
    source: keep ? normalizeIntentionSource(current?.source) : 'typed'
  };
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
  const storage = globalThis.localStorage ?? null;
  appendIntentionPresenceSignal(storage, entry.text, {
    now: () => new Date(entry.timestamp),
    at: new Date(entry.timestamp).toISOString()
  });
  return entry;
}
