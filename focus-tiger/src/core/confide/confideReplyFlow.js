/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Pure confide send → route + line (for UI + unit tests).
 */

import { canSubmitConfideText, confideClassify } from './confideClassify.js';
import { pickConfideLine } from './confideCorpus.js';

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
  excludeIds = []
} = {}) {
  if (!canSubmitConfideText(text)) return null;
  const route = confideClassify(text);
  if (!route) return null;
  const line = pickConfideLine({
    route,
    localDate,
    salt,
    excludeIds
  });
  if (!line) return null;
  return { route, line };
}
