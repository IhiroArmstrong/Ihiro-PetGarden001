/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Separate Stripe Checkout for Yin's Art Collection.
 * Ownership is written only after the server says the payment is paid.
 */

import { getCloudApiBaseUrl, postCloudJson } from './cloudApiClient.js';
import { cacheIssuedArtHd } from './artCollectionHd.js';
import { openCheckoutUrl } from './desktopShell.js';
import { buildCheckoutSessionBody } from './desktopCheckoutReturn.js';
import { noteDesktopCheckoutOpened } from './desktopCheckoutPending.js';

function artHdUrl(path) {
  const value = String(path || '');
  if (/^https?:\/\//.test(value)) return value;
  const base = String(getCloudApiBaseUrl() || '').replace(/\/$/, '');
  return `${base}${value.startsWith('/') ? value : `/${value}`}`;
}

/**
 * @param {Array<{ artId?: string, receiptId?: string, url?: string }>} grants
 * @param {{ fetchHd?: typeof fetch, hdCache?: object }} [deps]
 */
function saveGrantedArtHd(grants, deps = {}) {
  const rows = Array.isArray(grants) ? grants : [];
  if (!rows.length) return;
  void (async () => {
    let saved = false;
    for (const row of rows) {
      const result = await cacheIssuedArtHd({
        artId: row && row.artId,
        receiptId: row && row.receiptId,
        url: row && row.url,
        fetchImpl: deps.fetchHd,
        cache: deps.hdCache,
        resolveUrl: artHdUrl
      });
      if (result.ok) saved = true;
    }
    if (saved) notifyYinArtOwnership('hd-ready');
  })();
}

import {
  clearYinArtSession,
  findYinArtWork,
  mergeYinArtOwnedPiece,
  notifyYinArtOwnership,
  writeYinArtCacheFromServer,
  writeYinArtNotice,
  writeYinArtSession
} from './yinArtCollection.js';

/**
 * @param {object} [opts]
 * @param {string} [opts.artId]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 * @param {(url: string) => Promise<unknown>} [opts.openUrl]
 * @returns {Promise<{ phase: 'opening' | 'failed', reason: string }>}
 */
export async function beginYinArtCheckout({
  artId,
  postJson = postCloudJson,
  openUrl = openCheckoutUrl
} = {}) {
  if (!findYinArtWork(artId)) {
    return { phase: 'failed', reason: 'unknown' };
  }
  try {
    const body = await postJson('/api/create-art-collection-checkout-session', {
      body: JSON.stringify(buildCheckoutSessionBody({ artId }))
    });
    const url =
      body && typeof body === 'object' && typeof body.url === 'string' ? body.url : '';
    if (!url) return { phase: 'failed', reason: 'unavailable' };
    noteDesktopCheckoutOpened('art-collection', body);
    await openUrl(url);
    return { phase: 'opening', reason: 'opening' };
  } catch {
    return { phase: 'failed', reason: 'unavailable' };
  }
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.localStorage]
 * @param {Storage | null} [opts.sessionStorage]
 * @param {() => string} [opts.getSearch]
 * @param {(path: string) => void} [opts.replaceUrl]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 */
export async function confirmYinArtReturnQuery({
  storage,
  localStorage = storage !== undefined
    ? storage
    : typeof globalThis !== 'undefined'
      ? globalThis.localStorage
      : null,
  sessionStorage = typeof globalThis !== 'undefined' ? globalThis.sessionStorage : null,
  getSearch = () =>
    typeof location !== 'undefined' ? location.search || '' : '',
  replaceUrl = (path) => {
    if (typeof history !== 'undefined' && history.replaceState) {
      history.replaceState(null, '', path);
    }
  },
  postJson,
  fetchHd,
  hdCache
} = {}) {
  const params = new URLSearchParams(String(getSearch() || '').replace(/^\?/, ''));
  const cancel = params.get('art') === 'cancel';
  const sessionId = params.get('art_session') || '';

  const strip = () => {
    params.delete('art');
    params.delete('art_session');
    const qs = params.toString();
    const path =
      typeof location !== 'undefined'
        ? `${location.pathname}${qs ? `?${qs}` : ''}${location.hash || ''}`
        : qs
          ? `?${qs}`
          : '/';
    try {
      replaceUrl(path);
    } catch {
      // ignore
    }
  };

  if (cancel) {
    strip();
    writeYinArtNotice(sessionStorage, { kind: 'cancel' });
    notifyYinArtOwnership('cancel');
    return { consumed: true, owned: false, outcome: 'cancel' };
  }
  if (!sessionId.startsWith('cs_')) {
    return { consumed: false, owned: false, outcome: null };
  }

  strip();

  if (typeof postJson !== 'function') {
    writeYinArtNotice(sessionStorage, { kind: 'failed' });
    notifyYinArtOwnership('failed');
    return { consumed: true, owned: false, outcome: 'failed' };
  }

  try {
    const body = await postJson('/api/confirm-art-collection-session', {
      body: JSON.stringify({ sessionId })
    });
    const record = body && typeof body === 'object' ? body : {};
    if (record.pending === true) {
      writeYinArtNotice(sessionStorage, {
        kind: 'pending',
        artId: typeof record.artId === 'string' ? record.artId : ''
      });
      notifyYinArtOwnership('pending');
      return { consumed: true, owned: false, outcome: 'pending' };
    }
    if (
      record.owned === true &&
      typeof record.email === 'string' &&
      typeof record.artId === 'string' &&
      typeof record.ownedAt === 'string' &&
      typeof record.receiptId === 'string'
    ) {
      mergeYinArtOwnedPiece(localStorage, {
        email: record.email,
        artId: record.artId,
        ownedAt: record.ownedAt,
        receiptId: record.receiptId
      });
      writeYinArtSession(sessionStorage, record.email);
      writeYinArtNotice(sessionStorage, { kind: 'success', artId: record.artId });
      notifyYinArtOwnership('success');
      if (record.hd && typeof record.hd.url === 'string') {
        saveGrantedArtHd(
          [{ artId: record.artId, receiptId: record.receiptId, url: record.hd.url }],
          { fetchHd, hdCache }
        );
      }
      return { consumed: true, owned: true, outcome: 'success', artId: record.artId };
    }
    writeYinArtNotice(sessionStorage, { kind: 'failed' });
    notifyYinArtOwnership('failed');
    return { consumed: true, owned: false, outcome: 'failed' };
  } catch {
    writeYinArtNotice(sessionStorage, { kind: 'failed' });
    notifyYinArtOwnership('failed');
    return { consumed: true, owned: false, outcome: 'failed' };
  }
}

export async function bootYinArtReturnConfirm(opts = {}) {
  return confirmYinArtReturnQuery({
    localStorage: opts.localStorage,
    sessionStorage: opts.sessionStorage,
    postJson: postCloudJson
  });
}

/**
 * @param {object} opts
 * @param {string} opts.email
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 */
export async function requestYinArtSignInCode({ email, postJson = postCloudJson }) {
  await postJson('/api/restore/request-otp', {
    body: JSON.stringify({ email, purpose: 'art-collection' })
  });
  return { ok: true };
}

/**
 * @param {object} opts
 * @param {string} opts.email
 * @param {string} opts.code
 * @param {Storage | null} [opts.localStorage]
 * @param {Storage | null} [opts.sessionStorage]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 */
export async function verifyYinArtSignIn({
  email,
  code,
  localStorage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  sessionStorage = typeof globalThis !== 'undefined' ? globalThis.sessionStorage : null,
  postJson = postCloudJson,
  fetchHd,
  hdCache
}) {
  try {
    const body = await postJson('/api/verify-art-collection', {
      body: JSON.stringify({ email, code })
    });
    const record = body && typeof body === 'object' ? body : {};
    if (record.signedIn !== true || typeof record.email !== 'string') {
      return { ok: false, reason: 'rejected' };
    }
    writeYinArtCacheFromServer(localStorage, {
      email: record.email,
      items: record.items
    });
    writeYinArtSession(sessionStorage, record.email);
    notifyYinArtOwnership('signed-in');
    if (Array.isArray(record.downloads)) {
      saveGrantedArtHd(record.downloads, { fetchHd, hdCache });
    }
    return { ok: true, email: record.email };
  } catch {
    return { ok: false, reason: 'rejected' };
  }
}

/**
 * @param {Storage | null | undefined} sessionStorage
 */
export function signOutYinArt(sessionStorage) {
  clearYinArtSession(sessionStorage);
  notifyYinArtOwnership('signed-out');
}
