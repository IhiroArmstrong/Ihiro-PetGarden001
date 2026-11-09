/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { parseEntitlementMockSearch } from './entitlement/mockEntitlementProvider.js';

/**
 * QA query params (`?confide=1`, entitlement mocks) are allowed only in
 * Vite `DEV` or explicit `FT_QA_BOOT=1` static builds (Playwright).
 *
 * `import.meta.env.X` must be written without `env?.` so Vite `define` inlines
 * `VITE_FT_QA_BOOT`. Node `--test` has no `import.meta.env` — catch and treat
 * as production (harness off) unless the caller injects deps.
 */
function compileTimeQaBootFlag() {
  try {
    return import.meta.env.VITE_FT_QA_BOOT;
  } catch {
    return '';
  }
}

function compileTimeViteDev() {
  try {
    return import.meta.env.DEV === true;
  } catch {
    return false;
  }
}

/**
 * @param {object} [deps]
 * @param {boolean | undefined} [deps.viteDev]
 * @param {string | boolean | undefined} [deps.viteQaBoot]
 * @returns {boolean}
 */
export function isClientQaHarnessAllowed(deps = {}) {
  const viteDev =
    deps.viteDev !== undefined ? deps.viteDev : compileTimeViteDev();
  const qaBoot =
    deps.viteQaBoot !== undefined ? deps.viteQaBoot : compileTimeQaBootFlag();
  return viteDev === true || qaBoot === '1' || qaBoot === true;
}

/**
 * Production builds ignore `?entitlementMock=` (Plan A option 1).
 * Keep this helper out of `main.js` so B1 main.js line count does not rise.
 *
 * @param {string} [search]
 * @param {Parameters<typeof isClientQaHarnessAllowed>[0]} [deps]
 * @returns {ReturnType<typeof parseEntitlementMockSearch>}
 */
export function parseEntitlementMockSearchIfQaHarness(search = '', deps = {}) {
  if (!isClientQaHarnessAllowed(deps)) return null;
  return parseEntitlementMockSearch(search);
}
