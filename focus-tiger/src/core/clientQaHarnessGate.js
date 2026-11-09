/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * QA query params (`?confide=1`, entitlement mocks) are allowed only in dev / explicit QA boot builds.
 */
function readDefaultHarnessFlags() {
  try {
    // No `import.meta.env?.X` — optional chaining blocks Vite `define` in FT_QA_BOOT builds.
    return {
      viteDev: import.meta.env.DEV === true,
      qaBoot: import.meta.env.VITE_FT_QA_BOOT === '1'
    };
  } catch {
    return { viteDev: false, qaBoot: false };
  }
}

/**
 * @param {object} [deps]
 * @param {boolean | undefined} [deps.viteDev]
 * @param {string | undefined} [deps.viteQaBoot]
 * @returns {boolean}
 */
export function isClientQaHarnessAllowed(deps = {}) {
  const viteDev =
    deps.viteDev !== undefined ? deps.viteDev : readDefaultHarnessFlags().viteDev;
  const qaBoot =
    deps.viteQaBoot !== undefined
      ? deps.viteQaBoot
      : readDefaultHarnessFlags().qaBoot;
  return viteDev === true || qaBoot === '1';
}
