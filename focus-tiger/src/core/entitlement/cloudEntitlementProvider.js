/**
 * Cloud entitlement provider — polls Worker with membership device credential.
 * Lifetime stays client-cache / Sanctuary path for now (Prompt 10 = subscription).
 */

import { postCloudJson, getCloudApiBaseUrl } from '../cloudApiClient.js';
import { readMembershipDeviceCredential } from '../membershipDeviceCredential.js';

/**
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 * @param {() => string} [opts.getApiBaseUrl]
 * @returns {import('./entitlementProvider.js').EntitlementProvider}
 */
export function createCloudEntitlementProvider({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  postJson = postCloudJson,
  getApiBaseUrl = getCloudApiBaseUrl
} = {}) {
  return {
    id: 'cloud',
    async fetchEntitlement() {
      if (!getApiBaseUrl()) {
        throw new Error('cloud_api_unconfigured');
      }
      const cred = readMembershipDeviceCredential(storage);
      if (!cred) {
        // No device token yet — keep cache (refreshEntitlement → grace).
        throw new Error('membership_device_credential_missing');
      }
      const body = await postJson('/api/membership-entitlement', {
        body: JSON.stringify({
          email: cred.email,
          deviceToken: cred.deviceToken
        })
      });
      if (!body || typeof body !== 'object') {
        throw new Error('membership_entitlement_invalid_response');
      }
      const o = /** @type {Record<string, unknown>} */ (body);
      const sub =
        o.subscription && typeof o.subscription === 'object'
          ? /** @type {Record<string, unknown>} */ (o.subscription)
          : null;
      const active =
        o.active === true ||
        o.unlocked === true ||
        (sub && sub.active === true);
      const periodEndsAt =
        typeof o.periodEndsAt === 'string' && o.periodEndsAt
          ? o.periodEndsAt
          : typeof sub?.periodEndsAt === 'string'
            ? sub.periodEndsAt
            : null;
      const planId =
        typeof o.planId === 'string' && o.planId
          ? o.planId
          : typeof sub?.planId === 'string'
            ? sub.planId
            : null;
      const via =
        typeof sub?.via === 'string' && sub.via
          ? sub.via
          : active
            ? 'payment'
            : null;

      return {
        subscription: {
          active: Boolean(active),
          periodEndsAt: active ? periodEndsAt : null,
          planId: active ? planId : null,
          via: active ? via : null
        }
      };
    }
  };
}

/**
 * Open Stripe Customer Portal for the stored membership credential.
 * @param {object} [opts]
 * @param {Storage | null} [opts.storage]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 * @returns {Promise<{ url: string }>}
 */
export async function createMembershipPortalSession({
  storage = typeof globalThis !== 'undefined' ? globalThis.localStorage : null,
  postJson = postCloudJson
} = {}) {
  const cred = readMembershipDeviceCredential(storage);
  if (!cred) {
    const err = new Error('membership_device_credential_missing');
    /** @type {any} */ (err).code = 'credential_missing';
    throw err;
  }
  const body = await postJson('/api/create-membership-portal-session', {
    body: JSON.stringify({
      email: cred.email,
      deviceToken: cred.deviceToken
    })
  });
  const url =
    body && typeof body === 'object'
      ? /** @type {{ url?: unknown }} */ (body).url
      : null;
  if (typeof url !== 'string' || !url) {
    throw new Error('membership_portal_missing_url');
  }
  return { url };
}
