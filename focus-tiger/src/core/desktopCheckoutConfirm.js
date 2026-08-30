/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confirm Stripe Checkout sessions in the Electron shell without relying on
 * success_url deep links (session id is captured at create-checkout time).
 */

import { postCloudJson } from './cloudApiClient.js';
import { confirmCompanionAddonReturnQuery } from './companionAddonCheckout.js';
import { confirmProReturnQuery } from './proCheckout.js';
import {
  clearDesktopCheckoutPending,
  readDesktopCheckoutPending
} from './desktopCheckoutPending.js';
import { isCompanionEntitled } from './companionEntitlement.js';

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {string} [opts.search]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 * @returns {Promise<'success' | 'failed' | 'idle' | 'cancel'>}
 */
export async function resumePendingDesktopCheckout({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  search = typeof location !== 'undefined' ? location.search : '',
  postJson = postCloudJson
} = {}) {
  const pending = readDesktopCheckoutPending();
  if (!pending) return 'idle';

  if (isCompanionEntitled({ storage, search })) {
    clearDesktopCheckoutPending();
    return 'success';
  }

    if (pending.kind === 'pro') {
    if (pending.sessionId) {
      const byId = await confirmProReturnQuery({
        storage,
        getSearch: () => `?pro_session=${encodeURIComponent(pending.sessionId)}`,
        replaceUrl: () => {},
        postJson
      });
      if (byId.outcome === 'success') {
        clearDesktopCheckoutPending();
        return 'success';
      }
      if (byId.outcome === 'cancel') return 'cancel';
    }
    const fromUrl = await confirmProReturnQuery({ storage, getSearch: () => search, postJson });
    if (fromUrl.outcome === 'success') {
      clearDesktopCheckoutPending();
      return 'success';
    }
    if (fromUrl.outcome === 'cancel') return 'cancel';
    return 'idle';
  }

  if (pending.kind === 'companion-addon') {
    if (pending.sessionId) {
      const byId = await confirmCompanionAddonReturnQuery({
        storage,
        getSearch: () =>
          `?companion_addon_session=${encodeURIComponent(pending.sessionId)}`,
        replaceUrl: () => {},
        postJson
      });
      if (byId.outcome === 'success') {
        clearDesktopCheckoutPending();
        return 'success';
      }
      if (byId.outcome === 'cancel') return 'cancel';
    }
    const fromUrl = await confirmCompanionAddonReturnQuery({
      storage,
      getSearch: () => search,
      postJson
    });
    if (fromUrl.outcome === 'success') {
      clearDesktopCheckoutPending();
      return 'success';
    }
    if (fromUrl.outcome === 'cancel') return 'cancel';
    return 'idle';
  }

  return 'idle';
}
