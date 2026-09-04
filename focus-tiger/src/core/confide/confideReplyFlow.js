/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Pure confide send → route + line (for UI + unit tests).
 */

import { canSubmitConfideText, confideClassify } from './confideClassify.js';
import { confideLineText, pickConfideLine } from './confideCorpus.js';
import { lastRepeatableYinReplyText } from './confideReplyUniqueness.js';
import { CONFIDE_ROUTE } from './confideRoutes.js';

/**
 * @param {object} opts
 * @param {string} opts.text
 * @param {string} [opts.localDate]
 * @param {number} [opts.salt]
 * @param {ReadonlySet<string> | string[]} [opts.excludeIds]
 * @returns {{ route: string, line: import('./confideCorpus.js').ConfideLine } | null}
 */
export function resolveConfideReply({
  text,
  localDate = '',
  salt = 0,
  excludeIds = [],
  excludeNormalizedTexts = [],
  locale = 'en'
} = {}) {
  if (!canSubmitConfideText(text)) return null;
  const route = confideClassify(text);
  if (!route) return null;
  const line = pickConfideLine({
    route,
    localDate,
    salt,
    excludeIds,
    excludeNormalizedTexts,
    locale
  });
  if (!line) return null;
  return { route, line };
}

/**
 * After generate fails, show a fallback that is not the last visible jacket.
 * @param {object} opts
 * @param {string} [opts.locale]
 * @param {string} [opts.localDate]
 * @param {number} [opts.salt]
 * @param {ReadonlySet<string> | string[]} [opts.excludeIds]
 * @param {unknown} [opts.history]
 * @param {string} [opts.failedLineId]
 * @returns {{ route: string, line: import('./confideCorpus.js').ConfideLine, text: string } | null}
 */
export function resolveCorpusFallbackAfterGenerateFailure({
  locale = 'en',
  localDate = '',
  salt = 0,
  excludeIds = [],
  history = [],
  failedLineId = ''
} = {}) {
  const extra =
    excludeIds instanceof Set
      ? new Set(excludeIds)
      : new Set(Array.isArray(excludeIds) ? excludeIds : []);
  if (failedLineId) extra.add(failedLineId);
  const lastVisible = lastRepeatableYinReplyText(history);
  const line = pickConfideLine({
    route: CONFIDE_ROUTE.FALLBACK,
    localDate,
    salt,
    excludeIds: extra,
    excludeNormalizedTexts: lastVisible ? [lastVisible] : [],
    locale
  });
  if (!line) return null;
  return {
    route: CONFIDE_ROUTE.FALLBACK,
    line,
    text: confideLineText(line, locale)
  };
}
