/**
 * Yin Membership · subscription checkout helpers (B-track unlock via entitlement cache).
 *
 * Verification: same restraint as Sanctuary — never unlock from query alone.
 * Success path patches unified entitlement subscription cache (not a parallel gate).
 *
 * ZERO COUPLING: must not import tipJarGate. Sanctuary gate is independent.
 */

import { postCloudJson } from './cloudApiClient.js';
import {
  applyEntitlementPatch,
  getEntitlementState,
  isEntitled
} from './entitlement/entitlementGate.js';
import { persistMembershipDeviceCredentialFromBody } from './membershipDeviceCredential.js';

export const MEMBERSHIP_PLAN_ID = 'yin-membership';

/**
 * Display-only USD amount for Support / membership cards (`About ${price}`).
 * Stripe recurring Price on the Worker (`STRIPE_MEMBERSHIP_PRICE_ID`) is the
 * billing authority. Amount confirmed 2026-08-15 as **US$6.99 / month**
 * (same pattern as `TIP_JAR_PRICE_USD` / `SANCTUARY_LIFETIME_PRICE_USD`).
 */
export const MEMBERSHIP_PRICE_DISPLAY = '6.99';

/**
 * Apply confirmed subscription fields into entitlement cache.
 *
 * @param {Storage | null | undefined} storage
 * @param {object} opts
 * @param {string} opts.periodEndsAt
 * @param {string} [opts.planId]
 * @param {() => Date} [opts.now]
 * @returns {import('./entitlement/entitlementState.js').EntitlementCache}
 */
export function markMembershipFromPayment(
  storage,
  { periodEndsAt, planId = MEMBERSHIP_PLAN_ID, now = () => new Date() }
) {
  const ends =
    typeof periodEndsAt === 'string' && periodEndsAt.trim()
      ? periodEndsAt.trim()
      : null;
  if (!ends) {
    throw new Error('membership_missing_periodEndsAt');
  }
  return applyEntitlementPatch(
    {
      subscription: {
        active: true,
        periodEndsAt: ends,
        planId:
          typeof planId === 'string' && planId.trim()
            ? planId.trim()
            : MEMBERSHIP_PLAN_ID,
        via: 'payment'
      }
    },
    { storage, now, markVerified: true }
  );
}

/**
 * After Checkout return: read `membership_session` query, confirm with server,
 * then patch entitlement. Never unlock from the query alone.
 *
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => string} [opts.getSearch]
 * @param {(path: string) => void} [opts.replaceUrl]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 * @param {() => Date} [opts.now]
 * @returns {Promise<{ consumed: boolean, unlocked: boolean, outcome: 'success' | 'cancel' | 'failed' | null }>}
 */
export async function confirmMembershipReturnQuery({
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
  const cancel = params.get('membership') === 'cancel';
  const sessionId = params.get('membership_session') || '';

  const strip = () => {
    params.delete('membership');
    params.delete('membership_session');
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
    const body = await postJson('/api/confirm-membership-session', {
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
    const planId =
      body &&
      typeof body === 'object' &&
      typeof /** @type {{ planId?: unknown }} */ (body).planId === 'string'
        ? /** @type {{ planId: string }} */ (body).planId
        : MEMBERSHIP_PLAN_ID;

    if (active && periodEndsAt) {
      markMembershipFromPayment(storage, { periodEndsAt, planId, now });
      persistMembershipDeviceCredentialFromBody(storage, body);
      return { consumed: true, unlocked: true, outcome: 'success' };
    }
    return { consumed: true, unlocked: false, outcome: 'failed' };
  } catch {
    return { consumed: true, unlocked: false, outcome: 'failed' };
  }
}

/**
 * Boot: confirm Membership return query once (server-confirmed only).
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 */
export async function bootMembershipReturnConfirm(opts = {}) {
  return confirmMembershipReturnQuery({
    storage: opts.storage,
    postJson: postCloudJson
  });
}

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {() => Date} [opts.now]
 * @returns {boolean}
 */
export function isMembershipActiveLocally({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  now = () => new Date()
} = {}) {
  return getEntitlementState({ storage, now }).subscription.entitled === true;
}

/**
 * Convenience: advanced rituals / B-tier ongoing keys after membership confirm.
 * @param {string} featureKey
 * @param {object} [opts]
 */
export function isMembershipFeatureEntitled(featureKey, opts = {}) {
  return isEntitled(featureKey, opts);
}

export { postCloudJson, getCloudApiBaseUrl } from './cloudApiClient.js';
