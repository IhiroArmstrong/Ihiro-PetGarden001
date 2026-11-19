/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import isolationSummary from '../../../fixtures/noticing-one-line-isolation-summary.json' with { type: 'json' };
import { readNoticingOneLineIsolationPassed } from './noticingOneLineIsolationEval.js';

/**
 * Extra internal labels stay closed until the committed lab JSON is isolationPassed true.
 * This file does not change the send chain.
 */
export function isNoticingOneLineIsolationPassed() {
  return readNoticingOneLineIsolationPassed(isolationSummary);
}
