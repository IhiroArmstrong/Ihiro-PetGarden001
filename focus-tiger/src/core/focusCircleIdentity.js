/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Focus Circle identity — optional nickname + preset badge; local hide list.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import {
  FOCUS_CIRCLE_PATH,
  FOCUS_CIRCLE_SCHEMA_VERSION,
  isFocusCircleClientEnabled,
  readFocusCircleMembership
} from './focusCircleMembership.js';

export const FOCUS_CIRCLE_IDENTITY_QUERY_PARAM = 'focusCircleIdentity';
export const FOCUS_CIRCLE_IDENTITY_DRAFT_STORAGE_KEY =
  'focus-tiger.focus-circle-identity.v1';
export const FOCUS_CIRCLE_IDENTITY_HIDDEN_STORAGE_KEY =
  'focus-tiger.focus-circle-identity-hidden.v1';
export const FOCUS_CIRCLE_IDENTITY_CHANGE_EVENT =
  'focus-tiger:focus-circle-identity-change';
export const FOCUS_CIRCLE_NICKNAME_MAX_LEN = 16;
export const FOCUS_CIRCLE_BADGE_KEYS = Object.freeze(['tiger', 'yin']);

/** @type {Record<string, { nickname?: string, badgeKey?: string }>} */
let identityPeekMap = {};

/**
 * @param {string} [search]
 * @returns {'0' | null}
 */
export function readFocusCircleIdentityQueryFlag(search = '') {
  const raw = String(search || '');
  const q = raw.startsWith('?') ? raw.slice(1) : raw;
  try {
    const value = new URLSearchParams(q).get(FOCUS_CIRCLE_IDENTITY_QUERY_PARAM);
    if (value === '0' || value === 'false') return '0';
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {{ search?: string, storage?: Storage | null, cloudBaseUrl?: string }} [opts]
 */
export function isFocusCircleIdentityClientEnabled({
  search = '',
  storage = globalThis.localStorage,
  cloudBaseUrl = getCloudApiBaseUrl()
} = {}) {
  if (readFocusCircleIdentityQueryFlag(search) === '0') return false;
  if (!isFocusCircleClientEnabled({ search, cloudBaseUrl })) return false;
  return Boolean(readFocusCircleMembership(storage));
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeFocusCircleNickname(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/[\u0000-\u001f\u007f]/g, '');
  if (!trimmed || trimmed.length > FOCUS_CIRCLE_NICKNAME_MAX_LEN) return null;
  return trimmed;
}

/**
 * @param {unknown} value
 * @returns {'tiger' | 'yin' | null}
 */
export function normalizeFocusCircleBadgeKey(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === 'tiger' || trimmed === 'yin') return trimmed;
  return null;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ nickname: string, badgeKey: 'tiger' | 'yin' | null }}
 */
export function readFocusCircleIdentityDraft(storage) {
  const store = storage ?? globalThis.localStorage ?? null;
  if (!store) return { nickname: '', badgeKey: null };
  try {
    const raw = store.getItem(FOCUS_CIRCLE_IDENTITY_DRAFT_STORAGE_KEY);
    if (!raw) return { nickname: '', badgeKey: null };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { nickname: '', badgeKey: null };
    const nickname =
      typeof parsed.nickname === 'string'
        ? normalizeFocusCircleNickname(parsed.nickname) ?? ''
        : '';
    const badgeKey = normalizeFocusCircleBadgeKey(parsed.badgeKey);
    return { nickname, badgeKey };
  } catch {
    return { nickname: '', badgeKey: null };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ nickname?: string, badgeKey?: 'tiger' | 'yin' | null }} draft
 */
export function writeFocusCircleIdentityDraft(storage, draft) {
  const store = storage ?? globalThis.localStorage ?? null;
  if (!store) return;
  const nickname =
    typeof draft.nickname === 'string'
      ? normalizeFocusCircleNickname(draft.nickname) ?? ''
      : '';
  const badgeKey = normalizeFocusCircleBadgeKey(draft.badgeKey);
  try {
    if (!nickname && !badgeKey) {
      store.removeItem(FOCUS_CIRCLE_IDENTITY_DRAFT_STORAGE_KEY);
    } else {
      store.setItem(
        FOCUS_CIRCLE_IDENTITY_DRAFT_STORAGE_KEY,
        JSON.stringify({
          ...(nickname ? { nickname } : {}),
          ...(badgeKey ? { badgeKey } : {})
        })
      );
    }
  } catch {
    // quota / private mode
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} circleId
 * @returns {Set<string>}
 */
export function readHiddenMemberIds(storage, circleId) {
  const store = storage ?? globalThis.localStorage ?? null;
  if (!store || !circleId) return new Set();
  try {
    const raw = store.getItem(FOCUS_CIRCLE_IDENTITY_HIDDEN_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return new Set();
    const rows = parsed[circleId];
    if (!Array.isArray(rows)) return new Set();
    return new Set(rows.filter((id) => typeof id === 'string' && id));
  } catch {
    return new Set();
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} circleId
 * @param {string} memberId
 */
export function hideFocusCircleMemberLocally(storage, circleId, memberId) {
  const store = storage ?? globalThis.localStorage ?? null;
  if (!store || !circleId || !memberId) return;
  const hidden = readHiddenMemberIds(store, circleId);
  if (hidden.has(memberId)) return;
  hidden.add(memberId);
  let all = {};
  try {
    const raw = store.getItem(FOCUS_CIRCLE_IDENTITY_HIDDEN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') all = parsed;
    }
  } catch {
    all = {};
  }
  all[circleId] = [...hidden].slice(-FOCUS_CIRCLE_MAX_HIDDEN);
  try {
    store.setItem(FOCUS_CIRCLE_IDENTITY_HIDDEN_STORAGE_KEY, JSON.stringify(all));
    dispatchFocusCircleIdentityChange();
  } catch {
    // quota / private mode
  }
}

export const FOCUS_CIRCLE_MAX_HIDDEN = 32;

/**
 * @returns {typeof identityPeekMap}
 */
export function getFocusCircleIdentityPeekMap() {
  return identityPeekMap;
}

/**
 * @param {unknown} raw
 */
export function rememberFocusCircleIdentityPeekMap(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    identityPeekMap = {};
    return;
  }
  const o = /** @type {Record<string, unknown>} */ (raw);
  const next = {};
  for (const [memberId, row] of Object.entries(o)) {
    if (!row || typeof row !== 'object') continue;
    const r = /** @type {Record<string, unknown>} */ (row);
    const nickname = normalizeFocusCircleNickname(r.nickname);
    const badgeKey = normalizeFocusCircleBadgeKey(r.badgeKey);
    if (!nickname && !badgeKey) continue;
    next[memberId] = {
      ...(nickname ? { nickname } : {}),
      ...(badgeKey ? { badgeKey } : {})
    };
  }
  identityPeekMap = next;
}

export function resetFocusCircleIdentityForTests() {
  identityPeekMap = {};
}

function dispatchFocusCircleIdentityChange() {
  try {
    globalThis.dispatchEvent?.(
      new CustomEvent(FOCUS_CIRCLE_IDENTITY_CHANGE_EVENT)
    );
  } catch {
    // non-DOM tests
  }
}

/**
 * @param {object} opts
 * @param {string} opts.anonLabel
 * @param {string} [opts.memberId]
 * @param {Record<string, { nickname?: string, badgeKey?: string }>} [opts.identities]
 * @param {Set<string>} [opts.hiddenMemberIds]
 * @param {(key: string) => string} [opts.t]
 */
export function resolveFocusCircleDisplayName({
  anonLabel,
  memberId = '',
  identities = identityPeekMap,
  hiddenMemberIds = new Set(),
  t = (key) => key
}) {
  if (!memberId || hiddenMemberIds.has(memberId)) {
    return anonLabel;
  }
  const row = identities[memberId];
  const nickname = normalizeFocusCircleNickname(row?.nickname);
  if (nickname) {
    const badgeKey = normalizeFocusCircleBadgeKey(row?.badgeKey);
    if (badgeKey) {
      const prefix = t(`FOCUS_CIRCLE_IDENTITY_BADGE_${badgeKey.toUpperCase()}_PREFIX`);
      return `${prefix}${nickname}`;
    }
    return nickname;
  }
  return anonLabel;
}

/**
 * @param {object} [opts]
 * @param {typeof postCloudJson} [opts.postJson]
 */
export async function postFocusCircleIdentitySet({
  postJson = postCloudJson,
  getBaseUrl = getCloudApiBaseUrl,
  circleId = '',
  memberId = '',
  nickname = null,
  badgeKey = null
} = {}) {
  const base = getBaseUrl();
  if (!base || !circleId || !memberId) {
    return { ok: false, reason: 'missing_config' };
  }
  const body = {
    schemaVersion: FOCUS_CIRCLE_SCHEMA_VERSION,
    action: 'identity_set',
    circleId,
    memberId,
    nickname: nickname ?? null,
    badgeKey: badgeKey ?? null
  };
  const res = await postJson(`${base}${FOCUS_CIRCLE_PATH}`, body);
  if (!res.ok) {
    return { ok: false, reason: res.error ?? 'network' };
  }
  const data = res.data;
  if (!data || data.schemaVersion !== FOCUS_CIRCLE_SCHEMA_VERSION || data.ok !== true) {
    return { ok: false, reason: 'bad_response' };
  }
  return { ok: true };
}
