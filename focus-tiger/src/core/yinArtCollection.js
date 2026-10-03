/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Yin's Art Collection — five digital artworks, separate from Focus Coins and tea.
 * Local storage is a cache. A piece is shown as owned only while this browser
 * session is signed in as the email the server confirmed.
 */

export const YIN_ART_SESSION_KEY = 'focus-tiger.yin-art-session.v1';
export const YIN_ART_CACHE_KEY = 'focus-tiger.yin-art-ownership.v1';
export const YIN_ART_NOTICE_KEY = 'focus-tiger.yin-art-notice.v1';

export const YIN_ART_WORKS = Object.freeze([
  Object.freeze({
    id: 'moonlit-celadon-jar',
    unitAmount: 299,
    src: '/ui/art-collection/celadon-square-dragon-jar.png',
    nameKey: 'YIN_ART_MOONLIT_JAR',
    noteKey: 'YIN_ART_MOONLIT_JAR_NOTE'
  }),
  Object.freeze({
    id: 'amber-phoenix-ewer',
    unitAmount: 299,
    src: '/ui/art-collection/amber-glaze-phoenix-ewer.png',
    nameKey: 'YIN_ART_AMBER_EWER',
    noteKey: 'YIN_ART_AMBER_EWER_NOTE'
  }),
  Object.freeze({
    id: 'amber-hu-vase',
    unitAmount: 199,
    src: '/ui/art-collection/amber-glaze-hu-vase.png',
    nameKey: 'YIN_ART_AMBER_HU',
    noteKey: 'YIN_ART_AMBER_HU_NOTE'
  }),
  Object.freeze({
    id: 'gold-inlaid-ge',
    unitAmount: 199,
    src: '/ui/art-collection/gold-inlaid-silver-ge.png',
    nameKey: 'YIN_ART_GOLD_GE',
    noteKey: 'YIN_ART_GOLD_GE_NOTE'
  }),
  Object.freeze({
    id: 'pale-jade-ding',
    unitAmount: 99,
    src: '/ui/art-collection/celadon-jade-taotie-ding.png',
    nameKey: 'YIN_ART_PALE_DING',
    noteKey: 'YIN_ART_PALE_DING_NOTE'
  })
]);

/** Still in the folder, not on this shelf. */
export const YIN_ART_SHELF_EXCLUDED = Object.freeze([
  '/ui/art-collection/amber-glaze-dragon-handled-he.png',
  '/ui/art-collection/amber-glaze-elephant-vessel.png',
  '/ui/art-collection/amber-glaze-taotie-gui.png',
  '/ui/art-collection/tixi-lacquer-elephant-vessel.png'
]);

/** @type {Set<(reason: string) => void>} */
const ownershipListeners = new Set();

/**
 * @param {(reason: string) => void} listener
 * @returns {() => void}
 */
export function subscribeYinArtOwnership(listener) {
  ownershipListeners.add(listener);
  return () => ownershipListeners.delete(listener);
}

/**
 * @param {string} reason
 */
export function notifyYinArtOwnership(reason) {
  for (const listener of ownershipListeners) {
    try {
      listener(reason);
    } catch {
      // ignore listener faults
    }
  }
}

/**
 * @param {number} unitAmount
 * @returns {string}
 */
export function formatYinArtPrice(unitAmount) {
  const cents = Number(unitAmount);
  if (!Number.isFinite(cents)) return '';
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * @param {string} artId
 * @returns {(typeof YIN_ART_WORKS)[number] | null}
 */
export function findYinArtWork(artId) {
  return YIN_ART_WORKS.find((work) => work.id === artId) || null;
}

/**
 * @param {string} iso
 * @param {string} [locale]
 * @returns {string}
 */
export function formatYinArtOwnedDate(iso, locale = 'en') {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch {
    return '';
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ email: string } | null}
 */
export function readYinArtSession(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(YIN_ART_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const email =
      parsed && typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : '';
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {string} email
 */
export function writeYinArtSession(storage, email) {
  if (!storage) return;
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return;
  try {
    storage.setItem(YIN_ART_SESSION_KEY, JSON.stringify({ email: normalized }));
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearYinArtSession(storage) {
  if (!storage) return;
  try {
    storage.removeItem(YIN_ART_SESSION_KEY);
  } catch {
    // ignore
  }
}

/**
 * @param {unknown} raw
 * @returns {Record<string, { ownedAt: string, receiptId: string }>}
 */
function normalizeItems(raw) {
  if (!raw || typeof raw !== 'object') return {};
  /** @type {Record<string, { ownedAt: string, receiptId: string }>} */
  const items = {};
  for (const [id, value] of Object.entries(raw)) {
    if (!findYinArtWork(id)) continue;
    if (!value || typeof value !== 'object') continue;
    const ownedAt =
      typeof value.ownedAt === 'string' && value.ownedAt ? value.ownedAt : '';
    const receiptId =
      typeof value.receiptId === 'string' && value.receiptId ? value.receiptId : '';
    if (!ownedAt || !receiptId) continue;
    items[id] = { ownedAt, receiptId };
  }
  return items;
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ email: string, items: Record<string, { ownedAt: string, receiptId: string }> }}
 */
export function readYinArtCache(storage) {
  if (!storage) return { email: '', items: {} };
  try {
    const raw = storage.getItem(YIN_ART_CACHE_KEY);
    if (!raw) return { email: '', items: {} };
    const parsed = JSON.parse(raw);
    const email =
      parsed && typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : '';
    return { email, items: normalizeItems(parsed?.items) };
  } catch {
    return { email: '', items: {} };
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ email: string, items: Record<string, { ownedAt: string, receiptId: string }> }} cache
 */
function writeCache(storage, cache) {
  if (!storage) return;
  try {
    storage.setItem(
      YIN_ART_CACHE_KEY,
      JSON.stringify({
        email: cache.email,
        items: cache.items
      })
    );
  } catch {
    // ignore
  }
}

/**
 * Replace the cache from a server payload. Does not sign the browser in.
 *
 * @param {Storage | null | undefined} storage
 * @param {{ email?: string, items?: unknown }} payload
 */
export function writeYinArtCacheFromServer(storage, payload) {
  const email = String(payload?.email || '').trim().toLowerCase();
  if (!email) return;
  writeCache(storage, {
    email,
    items: normalizeItems(payload?.items)
  });
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ email: string, artId: string, ownedAt: string, receiptId: string }} piece
 */
export function mergeYinArtOwnedPiece(storage, piece) {
  const email = String(piece?.email || '').trim().toLowerCase();
  const artId = String(piece?.artId || '');
  const ownedAt = String(piece?.ownedAt || '');
  const receiptId = String(piece?.receiptId || '');
  if (!email || !findYinArtWork(artId) || !ownedAt || !receiptId) return;
  const cache = readYinArtCache(storage);
  const items = cache.email === email ? { ...cache.items } : {};
  if (!items[artId]) {
    items[artId] = { ownedAt, receiptId };
  }
  writeCache(storage, { email, items });
}

/**
 * Owned pieces for the signed-in email only. A cache without a session is hidden.
 *
 * @param {Storage | null | undefined} localStorage
 * @param {Storage | null | undefined} sessionStorage
 * @returns {Record<string, { ownedAt: string, receiptId: string }>}
 */
export function visibleYinArtOwnership(localStorage, sessionStorage) {
  const session = readYinArtSession(sessionStorage);
  if (!session) return {};
  const cache = readYinArtCache(localStorage);
  if (cache.email !== session.email) return {};
  return cache.items;
}

/**
 * @param {Storage | null | undefined} storage
 * @param {{ kind: string, artId?: string }} notice
 */
export function writeYinArtNotice(storage, notice) {
  if (!storage) return;
  const kind = String(notice?.kind || '');
  if (!kind) return;
  try {
    storage.setItem(
      YIN_ART_NOTICE_KEY,
      JSON.stringify({
        kind,
        artId: typeof notice.artId === 'string' ? notice.artId : ''
      })
    );
  } catch {
    // ignore
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {{ kind: string, artId: string } | null}
 */
export function readYinArtNotice(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(YIN_ART_NOTICE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const kind = parsed && typeof parsed.kind === 'string' ? parsed.kind : '';
    if (!kind) return null;
    return {
      kind,
      artId: typeof parsed.artId === 'string' ? parsed.artId : ''
    };
  } catch {
    return null;
  }
}

/**
 * @param {Storage | null | undefined} storage
 */
export function clearYinArtNotice(storage) {
  if (!storage) return;
  try {
    storage.removeItem(YIN_ART_NOTICE_KEY);
  } catch {
    // ignore
  }
}
