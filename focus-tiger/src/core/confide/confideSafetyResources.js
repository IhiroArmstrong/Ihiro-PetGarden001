/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Crisis resource copy shared by safety-01, the help-entry panel, and (later) mid-tier care.
 */

import { CONFIDE_CORPUS, confideLineText } from './confideCorpus.js';

const SAFETY_01_ID = 'safety-01';

/**
 * @param {string} [locale]
 * @returns {string}
 */
export function formatConfideSafetyResourceGuidance(locale = 'en') {
  const line = CONFIDE_CORPUS.find((row) => row.id === SAFETY_01_ID);
  if (!line) return '';
  return confideLineText(line, locale);
}
