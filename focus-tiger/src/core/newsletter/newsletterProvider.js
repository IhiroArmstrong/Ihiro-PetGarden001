/**
 * Newsletter / Stay-in-touch email capture provider interface.
 * Optional local-first lead capture — NOT an account system; zero coupling
 * with entitlement / tip-jar / sanctuary gates.
 */

/**
 * @typedef {{ ok: true } | { ok: false, error: string }} NewsletterSubscribeResult
 *
 * @typedef {{
 *   id: string,
 *   subscribe: (email: string, opts?: { locale?: string }) => Promise<NewsletterSubscribeResult>
 * }} NewsletterProvider
 */

/** @type {NewsletterProvider | null} */
let activeProvider = null;

/**
 * @param {NewsletterProvider | null} provider
 */
export function setNewsletterProvider(provider) {
  activeProvider = provider;
}

/** @returns {NewsletterProvider | null} */
export function getNewsletterProvider() {
  return activeProvider;
}
