/**
 * Cloud Worker newsletter provider — Stay in touch → POST /api/newsletter/subscribe.
 * Optional lead capture; NOT an account. Zero coupling with entitlement / tip / sanctuary.
 */

import { postCloudJson, getCloudApiBaseUrl } from '../cloudApiClient.js';
import { getLocale } from '../../locales/i18n.js';

/**
 * @param {object} [opts]
 * @param {(path: string, init?: RequestInit) => Promise<unknown>} [opts.postJson]
 * @param {() => string} [opts.getApiBaseUrl]
 * @param {() => string} [opts.getLocaleFn]
 * @returns {import('./newsletterProvider.js').NewsletterProvider}
 */
export function createWorkerNewsletterProvider({
  postJson = postCloudJson,
  getApiBaseUrl = getCloudApiBaseUrl,
  getLocaleFn = getLocale
} = {}) {
  return {
    id: 'worker',
    /**
     * @param {string} email
     * @param {{ locale?: string }} [subscribeOpts]
     */
    async subscribe(email, subscribeOpts = {}) {
      if (!getApiBaseUrl()) {
        return { ok: false, error: 'unconfigured' };
      }
      try {
        const body = await postJson('/api/newsletter/subscribe', {
          body: JSON.stringify({
            email: String(email || '').trim(),
            locale: subscribeOpts.locale || getLocaleFn() || 'en'
          })
        });
        if (body && typeof body === 'object' && /** @type {{ ok?: unknown }} */ (body).ok === true) {
          return { ok: true };
        }
        return { ok: false, error: 'subscribe_failed' };
      } catch (err) {
        const status = /** @type {{ status?: number }} */ (err)?.status;
        if (status === 400) return { ok: false, error: 'invalid_email' };
        if (status === 429) return { ok: false, error: 'rate_limited' };
        return { ok: false, error: 'subscribe_failed' };
      }
    }
  };
}
