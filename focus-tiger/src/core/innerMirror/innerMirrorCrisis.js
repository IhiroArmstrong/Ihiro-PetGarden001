/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { resolveConfideReply } from '../confide/confideReplyFlow.js';

export function isInnerMirrorCrisisRoute(route) {
  return (
    route === CONFIDE_ROUTE.SAFETY_REDIRECT || route === CONFIDE_ROUTE.SAFETY_CARE
  );
}

/**
 * Live safety layer before any leave / theme count.
 * @param {{ text?: string, route?: string, semanticCrisis?: boolean, locale?: string, localDate?: string }} opts
 */
export function isInnerMirrorCrisis(opts = {}) {
  if (opts.semanticCrisis === true) return true;
  if (isInnerMirrorCrisisRoute(opts.route)) return true;
  const text = String(opts.text || '').trim();
  if (!text) return false;
  const hit = resolveConfideReply({
    text,
    localDate: opts.localDate || '',
    locale: opts.locale || 'en'
  });
  return Boolean(hit && isInnerMirrorCrisisRoute(hit.route));
}
