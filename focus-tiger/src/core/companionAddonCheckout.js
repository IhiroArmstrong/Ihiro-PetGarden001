/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { postCloudJson } from './cloudApiClient.js';
import {
  COMPANION_ADDON_LIFETIME_ITEM_ID,
  COMPANION_ADDON_LIFETIME_PRICE_USD
} from './entitlement/companionAddonSku.js';
import {
  isCompanionAddonActive,
  writeCompanionEntitlementCache
} from './companionEntitlement.js';

export { COMPANION_ADDON_LIFETIME_PRICE_USD };

/**
 * @param {Storage | null | undefined} storage
 * @param {object} [opts]
 * @param {string} [opts.itemId]
 * @param {() => Date} [opts.now]
 */
export function markCompanionAddonFromPayment(
  storage,
  { itemId = COMPANION_ADDON_LIFETIME_ITEM_ID, now = () => new Date() } = {}
) {
  return writeCompanionEntitlementCache(
    storage,
    { active: true, itemId, via: 'payment' },
    now
  );
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => string} [opts.getSearch]
 * @param {(path: string) => void} [opts.replaceUrl]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 * @param {() => Date} [opts.now]
 */
export async function confirmCompanionAddonReturnQuery({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  getSearch = () =>
    typeof location !== 'undefined' ? location.search || '' : '',
  replaceUrl = (path) => {
    if (typeof history !== 'undefined' && history.replaceState) {
      history.replaceState(null, '', path);
    }
  },
  postJson,
  now = () => new Date()
} = {}) {
  const params = new URLSearchParams(getSearch().replace(/^\?/, ''));
  const cancel = params.get('companion_addon') === 'cancel';
  const sessionId = params.get('companion_addon_session') || '';

  const strip = () => {
    params.delete('companion_addon');
    params.delete('companion_addon_session');
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
    return { consumed: true, unlocked: false, outcome: 'cancel' };
  }
  if (!sessionId.startsWith('cs_')) {
    return { consumed: false, unlocked: false, outcome: null };
  }

  strip();

  if (typeof postJson !== 'function') {
    return { consumed: true, unlocked: false, outcome: 'failed' };
  }

  try {
    const body = await postJson('/api/confirm-companion-addon-session', {
      body: JSON.stringify({ sessionId })
    });
    const unlocked =
      body &&
      typeof body === 'object' &&
      /** @type {{ unlocked?: unknown }} */ (body).unlocked === true;
    const itemId =
      body &&
      typeof body === 'object' &&
      typeof /** @type {{ itemId?: unknown }} */ (body).itemId === 'string'
        ? /** @type {{ itemId: string }} */ (body).itemId
        : COMPANION_ADDON_LIFETIME_ITEM_ID;

    if (unlocked) {
      markCompanionAddonFromPayment(storage, { itemId, now });
      return { consumed: true, unlocked: true, outcome: 'success' };
    }
    return { consumed: true, unlocked: false, outcome: 'failed' };
  } catch {
    return { consumed: true, unlocked: false, outcome: 'failed' };
  }
}

export async function bootCompanionAddonReturnConfirm(opts = {}) {
  return confirmCompanionAddonReturnQuery({
    storage: opts.storage,
    postJson: postCloudJson
  });
}

export function isCompanionAddonActiveLocally(opts = {}) {
  return isCompanionAddonActive(opts);
}

export { postCloudJson } from './cloudApiClient.js';
