/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { confideBrowserSafeEnv } from './confideSemanticRoutingConfig.js';

/**
 * Product mount default on (T14 / CONFIDE_NOW, PO 2026-11-08). Set `FT_CONFIDE_HELP_ENTRY=off` to hide.
 * @param {NodeJS.ProcessEnv | null | undefined} [env]
 * @returns {boolean}
 */
export function resolveConfideHelpEntryEnabled(env) {
  const raw = String(confideBrowserSafeEnv(env).FT_CONFIDE_HELP_ENTRY ?? 'on')
    .trim()
    .toLowerCase();
  return !(raw === 'off' || raw === '0' || raw === 'false');
}
