/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confirm Stripe Checkout in the Electron shell without waiting for Safari
 * to land on the Vite success_url.
 */

import { postCloudJson } from './cloudApiClient.js';
import { confirmCompanionAddonReturnQuery } from './companionAddonCheckout.js';
import { confirmProReturnQuery } from './proCheckout.js';
import { confirmMembershipReturnQuery } from './membershipCheckout.js';
import { confirmSanctuaryReturnQuery, isSanctuaryUnlocked } from './sanctuaryEntitlementGate.js';
import { consumeTipReturnQuery } from './tipJarGate.js';
import {
  isCompanionAddonActive,
  isProSubscriptionActive
} from './companionEntitlement.js';
import { getEntitlementState } from './entitlement/entitlementGate.js';
import {
  clearDesktopCheckoutPending,
  readDesktopCheckoutPending
} from './desktopCheckoutPending.js';

/**
 * @param {object} opts
 * @param {(args: object) => Promise<{ outcome?: string | null }>} opts.confirm
 * @param {string} opts.sessionParam
 * @param {string | null} opts.sessionId
 * @param {Storage | null} opts.storage
 * @param {string} opts.search
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} opts.postJson
 * @returns {Promise<'success' | 'failed' | 'idle' | 'cancel'>}
 */
async function resumeConfirmableKind({
  confirm,
  sessionParam,
  sessionId,
  storage,
  search,
  postJson
}) {
  if (sessionId) {
    const byId = await confirm({
      storage,
      getSearch: () => `?${sessionParam}=${encodeURIComponent(sessionId)}`,
      replaceUrl: () => {},
      postJson
    });
    if (byId.outcome === 'success') {
      clearDesktopCheckoutPending();
      return 'success';
    }
    if (byId.outcome === 'cancel') return 'cancel';
  }
  const fromUrl = await confirm({
    storage,
    getSearch: () => search,
    replaceUrl: () => {},
    postJson
  });
  if (fromUrl.outcome === 'success') {
    clearDesktopCheckoutPending();
    return 'success';
  }
  if (fromUrl.outcome === 'cancel') return 'cancel';
  return 'idle';
}

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

  if (pending.kind === 'sanctuary' && isSanctuaryUnlocked({ storage })) {
    clearDesktopCheckoutPending();
    return 'success';
  }
  if (pending.kind === 'pro' && isProSubscriptionActive({ storage, search })) {
    clearDesktopCheckoutPending();
    return 'success';
  }
  if (pending.kind === 'companion-addon' && isCompanionAddonActive({ storage })) {
    clearDesktopCheckoutPending();
    return 'success';
  }
  if (
    pending.kind === 'membership' &&
    getEntitlementState({ storage }).subscription.entitled === true
  ) {
    clearDesktopCheckoutPending();
    return 'success';
  }

  if (pending.kind === 'pro') {
    return resumeConfirmableKind({
      confirm: confirmProReturnQuery,
      sessionParam: 'pro_session',
      sessionId: pending.sessionId,
      storage,
      search,
      postJson
    });
  }

  if (pending.kind === 'companion-addon') {
    return resumeConfirmableKind({
      confirm: confirmCompanionAddonReturnQuery,
      sessionParam: 'companion_addon_session',
      sessionId: pending.sessionId,
      storage,
      search,
      postJson
    });
  }

  if (pending.kind === 'sanctuary') {
    return resumeConfirmableKind({
      confirm: confirmSanctuaryReturnQuery,
      sessionParam: 'sanctuary_session',
      sessionId: pending.sessionId,
      storage,
      search,
      postJson
    });
  }

  if (pending.kind === 'membership') {
    return resumeConfirmableKind({
      confirm: confirmMembershipReturnQuery,
      sessionParam: 'membership_session',
      sessionId: pending.sessionId,
      storage,
      search,
      postJson
    });
  }

  if (pending.kind === 'tea') {
    const tip = consumeTipReturnQuery({
      storage,
      search,
      replaceUrl: () => {}
    });
    if (tip.outcome === 'success') {
      clearDesktopCheckoutPending();
      return 'success';
    }
    if (tip.outcome === 'cancel') return 'cancel';
    return 'idle';
  }

  return 'idle';
}

/**
 * @param {import('./desktopCheckoutPending.js').DesktopCheckoutKind | string | null | undefined} pendingKind
 * @returns {import('./paymentCheckoutThanks.js').PaymentThanksKind | null}
 */
export function paymentThanksKindFromDesktopPending(pendingKind) {
  if (pendingKind === 'companion-addon') return 'companion-addon';
  if (pendingKind === 'sanctuary') return 'sanctuary';
  if (pendingKind === 'membership') return 'membership';
  if (pendingKind === 'tea') return 'tip';
  if (pendingKind === 'pro') return 'pro';
  return null;
}
