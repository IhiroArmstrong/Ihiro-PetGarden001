/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Dev / e2e-only boot entry for QA URL seeds. Imported only behind
 * `import.meta.env.DEV || import.meta.env.VITE_FT_QA_BOOT === '1'` so
 * production deploy bundles omit this module entirely.
 */

import { applyQaPracticeSeedFromSearch } from './qaPracticeSeed.js';
import { applyQaLotusPondSeedFromSearch } from './qaLotusPondSeed.js';

/**
 * @param {{
 *   search?: string,
 *   storage?: Storage | null
 * }} [opts]
 */
export function applyQaBootSeedFromSearch(opts = {}) {
  applyQaPracticeSeedFromSearch(opts);
  applyQaLotusPondSeedFromSearch(opts);
}
