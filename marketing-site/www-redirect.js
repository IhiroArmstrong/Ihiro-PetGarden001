/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Pages `_redirects` cannot do domain-level jumps (www → apex).
 * Both hostnames are custom domains on the same project, so www was
 * serving 200 and Safari kept a separate 4h CSS cache.
 *
 * T87-C: samatia.net is the product canonical. twinsology.com product pages
 * 301 there only when Pages env `SAMATIA_CANONICAL_LIVE` is set — so merging
 * this PR does not take the live studio domain down before DNS + HTTPS +
 * trademark checklist.
 */

export const SAMATIA_APEX = 'samatia.net';
export const TWINSOLOGY_APEX = 'twinsology.com';

/**
 * @param {unknown} env
 * @returns {boolean}
 */
export function isSamatiaCanonicalLive(env) {
  const raw = env && typeof env === 'object' ? env.SAMATIA_CANONICAL_LIVE : '';
  return raw === true || raw === '1' || raw === 'true';
}

/**
 * @param {string} hostname
 * @param {boolean} canonicalLive
 * @returns {string | null} apex hostname to 301 onto
 */
export function marketingRedirectTargetHost(hostname, canonicalLive) {
  if (hostname === `www.${SAMATIA_APEX}`) return SAMATIA_APEX;
  if (canonicalLive) {
    if (
      hostname === TWINSOLOGY_APEX ||
      hostname === `www.${TWINSOLOGY_APEX}`
    ) {
      return SAMATIA_APEX;
    }
    return null;
  }
  if (hostname === `www.${TWINSOLOGY_APEX}`) return TWINSOLOGY_APEX;
  return null;
}

/**
 * @param {Request} request
 * @param {unknown} [env]
 * @returns {Response | null}
 */
export function redirectMarketingHost(request, env) {
  const url = new URL(request.url);
  const target = marketingRedirectTargetHost(
    url.hostname,
    isSamatiaCanonicalLive(env)
  );
  if (!target) return null;
  url.hostname = target;
  url.protocol = 'https:';
  return Response.redirect(url.toString(), 301);
}

/** @deprecated use redirectMarketingHost */
export function redirectWwwToApex(request) {
  return redirectMarketingHost(request, {});
}
