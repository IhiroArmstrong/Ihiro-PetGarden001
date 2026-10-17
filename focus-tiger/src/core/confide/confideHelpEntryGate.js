/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';

/**
 * Product mount default off (T14 / CONFIDE_NOW). Set `FT_CONFIDE_HELP_ENTRY=on` to show the in-card link.
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @returns {boolean}
 */
export function resolveConfideHelpEntryEnabled(env) {
  const raw = String(confideBrowserSafeEnv(env).FT_CONFIDE_HELP_ENTRY ?? 'off')
    .trim()
    .toLowerCase();
  return !(raw === 'off' || raw === '0' || raw === 'false');
}
