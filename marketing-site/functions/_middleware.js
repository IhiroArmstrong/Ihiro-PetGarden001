/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Pages `_redirects` cannot do domain-level jumps (www → apex).
 * Both hostnames are custom domains on the same project, so www was
 * serving 200 and Safari kept a separate 4h CSS cache.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'www.twinsology.com') {
    url.hostname = 'twinsology.com';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
