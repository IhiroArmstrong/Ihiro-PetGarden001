/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { resolveConfideReply } from '../confide/confideReplyFlow.js';
import { CONFIDE_ROUTE } from '../confide/confideRoutes.js';
import { confideLineText } from '../confide/confideCorpus.js';

export function routeDailyNoticingAnswer(opts = {}) {
  const text = String(opts.text || '').trim();
  if (!text) return { kind: 'ok' };
  const hit = resolveConfideReply({
    text,
    localDate: opts.localDate || '',
    locale: opts.locale || 'en'
  });
  if (
    hit &&
    (hit.route === CONFIDE_ROUTE.SAFETY_REDIRECT ||
      hit.route === CONFIDE_ROUTE.SAFETY_CARE)
  ) {
    return {
      kind: 'crisis',
      lineText: confideLineText(hit.line, opts.locale || 'en')
    };
  }
  return { kind: 'ok' };
}