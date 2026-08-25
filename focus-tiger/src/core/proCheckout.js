/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { postCloudJson } from './cloudApiClient.js';
import { applyEntitlementPatch } from './entitlement/entitlementGate.js';
import { persistMembershipDeviceCredentialFromBody } from './membershipDeviceCredential.js';
import {
  FOCUS_TIGER_PRO_PLAN_ID,
  FOCUS_TIGER_PRO_PRICE_DISPLAY,
  isProSubscriptionActive
} from './companionEntitlement.js';

export { FOCUS_TIGER_PRO_PLAN_ID, FOCUS_TIGER_PRO_PRICE_DISPLAY };

/**
 * @param {Storage | null | undefined} storage
 * @param {object} opts
 * @param {string} opts.periodEndsAt
 * @param {() => Date} [opts.now]
 */
export function markProFromPayment(
  storage,
  { periodEndsAt, now = () => new Date() }
) {
  const ends =
    typeof periodEndsAt === 'string' && periodEndsAt.trim()
      ? periodEndsAt.trim()
      : null;
  if (!ends) throw new Error('pro_missing_periodEndsAt');
  return applyEntitlementPatch(
    {
      subscription: {
        active: true,
        periodEndsAt: ends,
        planId: FOCUS_TIGER_PRO_PLAN_ID,
        via: 'payment'
      }
    },
    { storage, now, markVerified: true }
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
export async function confirmProReturnQuery({
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
  const cancel = params.get('pro') === 'cancel';
  const sessionId = params.get('pro_session') || '';

  const strip = () => {
    params.delete('pro');
    params.delete('pro_session');
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
    const body = await postJson('/api/confirm-pro-session', {
      body: JSON.stringify({ sessionId })
    });
    const active =
      body &&
      typeof body === 'object' &&
      (/** @type {{ active?: unknown, unlocked?: unknown }} */ (body).active ===
        true ||
        /** @type {{ unlocked?: unknown }} */ (body).unlocked === true);
    const periodEndsAt =
      body &&
      typeof body === 'object' &&
      typeof /** @type {{ periodEndsAt?: unknown }} */ (body).periodEndsAt ===
        'string'
        ? /** @type {{ periodEndsAt: string }} */ (body).periodEndsAt
        : '';

    if (active && periodEndsAt) {
      markProFromPayment(storage, { periodEndsAt, now });
      persistMembershipDeviceCredentialFromBody(storage, body);
      return { consumed: true, unlocked: true, outcome: 'success' };
    }
    return { consumed: true, unlocked: false, outcome: 'failed' };
  } catch {
    return { consumed: true, unlocked: false, outcome: 'failed' };
  }
}

export async function bootProReturnConfirm(opts = {}) {
  return confirmProReturnQuery({
    storage: opts.storage,
    postJson: postCloudJson
  });
}

export function isProActiveLocally(opts = {}) {
  return isProSubscriptionActive(opts);
}

export { postCloudJson } from './cloudApiClient.js';
