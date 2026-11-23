/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Manual menu favorites (My Favorites / 我的常用) — local only, backup v8.
 */

export const MENU_FAVORITES_STORAGE_KEY = 'focus-tiger.menu-favorites.v1';
export const MENU_FAVORITES_MAX = 8;

/**
 * @typedef {{ itemIds: string[] }} MenuFavoritesV1
 */

/**
 * @returns {MenuFavoritesV1}
 */
export function defaultMenuFavoritesState() {
  return { itemIds: [] };
}

/**
 * @param {unknown} raw
 * @returns {MenuFavoritesV1}
 */
export function normalizeMenuFavoritesState(raw) {
  const base = defaultMenuFavoritesState();
  if (!raw || typeof raw !== 'object') return base;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const ids = o.itemIds;
  if (!Array.isArray(ids)) return base;
  const seen = new Set();
  /** @type {string[]} */
  const itemIds = [];
  for (const id of ids) {
    if (typeof id !== 'string' || !id.trim()) continue;
    const key = id.trim();
    if (seen.has(key)) continue;
    seen.add(key);
    itemIds.push(key);
    if (itemIds.length >= MENU_FAVORITES_MAX) break;
  }
  return { itemIds };
}

/**
 * @param {Storage | null | undefined} [storage]
 * @returns {MenuFavoritesV1}
 */
export function readMenuFavoritesState(storage = getDefaultStorage()) {
  if (!storage) return defaultMenuFavoritesState();
  try {
    const raw = storage.getItem(MENU_FAVORITES_STORAGE_KEY);
    if (!raw) return defaultMenuFavoritesState();
    return normalizeMenuFavoritesState(JSON.parse(raw));
  } catch {
    return defaultMenuFavoritesState();
  }
}

/**
 * @param {MenuFavoritesV1} state
 * @param {Storage | null | undefined} [storage]
 */
export function writeMenuFavoritesState(state, storage = getDefaultStorage()) {
  if (!storage) return;
  const normalized = normalizeMenuFavoritesState(state);
  storage.setItem(MENU_FAVORITES_STORAGE_KEY, JSON.stringify(normalized));
}

/**
 * @param {string} proxy
 * @param {Storage | null | undefined} [storage]
 */
export function isMenuFavorite(proxy, storage = getDefaultStorage()) {
  if (!proxy) return false;
  return readMenuFavoritesState(storage).itemIds.includes(proxy);
}

/**
 * @param {string} proxy
 * @param {Storage | null | undefined} [storage]
 * @returns {{ favorited: boolean, added?: boolean, removed?: boolean, full?: boolean }}
 */
export function toggleMenuFavorite(proxy, storage = getDefaultStorage()) {
  if (!proxy || !storage) return { favorited: false };
  const state = readMenuFavoritesState(storage);
  const idx = state.itemIds.indexOf(proxy);
  if (idx >= 0) {
    const next = {
      itemIds: state.itemIds.filter((id) => id !== proxy)
    };
    writeMenuFavoritesState(next, storage);
    return { favorited: false, removed: true };
  }
  if (state.itemIds.length >= MENU_FAVORITES_MAX) {
    return { favorited: false, full: true };
  }
  const next = { itemIds: [...state.itemIds, proxy] };
  writeMenuFavoritesState(next, storage);
  return { favorited: true, added: true };
}

/**
 * @returns {Storage | null}
 */
function getDefaultStorage() {
  return typeof localStorage !== 'undefined' ? localStorage : null;
}

/**
 * @param {import('./idleChromeOrchestration.js').SecondaryChromeEntry[]} entries
 * @param {string[]} favoriteIds
 * @returns {import('./idleChromeOrchestration.js').SecondaryChromeEntry[]}
 */
/**
 * @param {import('./idleChromeOrchestration.js').SecondaryChromeEntry[]} entries
 * @param {Storage | null | undefined} [storage]
 * @returns {import('./idleChromeOrchestration.js').SecondaryChromeEntry[]}
 */
export function injectMenuFavoritesSection(entries, storage) {
  const { itemIds } = readMenuFavoritesState(storage);
  if (!itemIds.length) return entries;
  const favoriteRows = resolveMenuFavoriteEntries(entries, itemIds);
  if (!favoriteRows.length) return entries;
  return [
    { kind: 'group-label', labelKey: 'MENU_GROUP_MY_FAVORITES' },
    ...favoriteRows,
    ...entries
  ];
}

export function resolveMenuFavoriteEntries(entries, favoriteIds) {
  if (!favoriteIds.length) return [];
  const byProxy = new Map();
  for (const entry of entries) {
    if (!entry.proxy) continue;
    byProxy.set(entry.proxy, entry);
  }
  /** @type {import('./idleChromeOrchestration.js').SecondaryChromeEntry[]} */
  const out = [];
  for (const id of favoriteIds) {
    const entry = byProxy.get(id);
    if (entry) out.push({ ...entry });
  }
  return out;
}