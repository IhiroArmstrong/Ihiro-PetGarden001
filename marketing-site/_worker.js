/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { redirectMarketingHost } from './www-redirect.js';

export default {
  async fetch(request, env) {
    const redirect = redirectMarketingHost(request, env);
    if (redirect) return redirect;
    return env.ASSETS.fetch(request);
  },
};
