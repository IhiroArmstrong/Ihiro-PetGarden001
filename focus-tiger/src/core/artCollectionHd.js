/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * High-resolution bytes arrive only from a server grant URL.
 * A local "owned" flag is not an input here.
 */

const DB_NAME = 'focus-tiger-art-hd';
const DB_VERSION = 1;
const STORE = 'sheets';

/**
 * @param {IDBRequest} req
 */
function idbReq(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('idb_error'));
  });
}

export function createMemoryArtHdCache() {
  /** @type {Map<string, { artId: string, receiptId: string, blob: Blob }>} */
  const map = new Map();
  return {
    async get(artId) {
      return map.get(artId) || null;
    },
    async put(record) {
      const prev = map.get(record.artId);
      if (prev && prev.receiptId === record.receiptId && prev.blob.size === record.blob.size) {
        return false;
      }
      map.set(record.artId, record);
      return true;
    }
  };
}

/**
 * @param {IDBDatabase} db
 */
export function createIdbArtHdCache(db) {
  const store = (mode) => db.transaction(STORE, mode).objectStore(STORE);
  return {
    async get(artId) {
      return (await idbReq(store('readonly').get(artId))) || null;
    },
    async put(record) {
      const prev = await idbReq(store('readonly').get(record.artId));
      if (
        prev &&
        prev.receiptId === record.receiptId &&
        prev.blob?.size === record.blob.size
      ) {
        return false;
      }
      await idbReq(store('readwrite').put(record));
      return true;
    }
  };
}

let defaultCachePromise = null;

export function openArtHdCache(factory = globalThis.indexedDB) {
  if (!factory?.open) return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = factory.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'artId' });
      }
    };
    req.onsuccess = () => resolve(createIdbArtHdCache(req.result));
    req.onerror = () => resolve(null);
  });
}

async function defaultCache() {
  if (!defaultCachePromise) defaultCachePromise = openArtHdCache();
  return defaultCachePromise;
}

/**
 * @param {string} artId
 * @param {{ get: (id: string) => Promise<any> } | null} [cache]
 */
export async function readArtHd(artId, cache) {
  const store = cache || (await defaultCache());
  if (!store) return null;
  try {
    return await store.get(artId);
  } catch {
    return null;
  }
}

/**
 * @param {{
 *   artId?: string,
 *   receiptId?: string,
 *   url?: string,
 *   fetchImpl?: typeof fetch,
 *   cache?: { get: Function, put: Function } | null,
 *   resolveUrl?: (url: string) => string
 * }} input
 */
export async function cacheIssuedArtHd(input = {}) {
  const artId = String(input.artId || '');
  const receiptId = String(input.receiptId || '');
  const url = String(input.url || '');
  if (!artId || !receiptId || !url) return { ok: false, reason: 'missing_grant' };
  const fetchImpl = input.fetchImpl || globalThis.fetch;
  const store = input.cache || (await defaultCache());
  if (typeof fetchImpl !== 'function' || !store) return { ok: false, reason: 'unavailable' };
  const href = input.resolveUrl ? input.resolveUrl(url) : url;
  let response;
  try {
    response = await fetchImpl(href);
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
  if (!response || response.ok !== true) return { ok: false, reason: 'denied' };
  const blob = await response.blob();
  if (!blob || blob.size < 8) return { ok: false, reason: 'empty' };
  const wrote = await store.put({ artId, receiptId, blob });
  return { ok: true, wrote };
}
