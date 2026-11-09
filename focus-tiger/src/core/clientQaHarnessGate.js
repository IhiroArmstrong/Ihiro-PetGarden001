/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * QA query params (`?confide=1`, entitlement mocks) are allowed only in dev / explicit QA boot builds.
 *
 * @param {object} [deps]
 * @param {boolean | undefined} [deps.viteDev]
 * @param {string | undefined} [deps.viteQaBoot]
 * @returns {boolean}
 */
export function isClientQaHarnessAllowed(deps = {}) {
  const viteDev =
    deps.viteDev !== undefined
      ? deps.viteDev
      : typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;
  const qaBoot =
    deps.viteQaBoot !== undefined
      ? deps.viteQaBoot
      : typeof import.meta !== 'undefined' &&
        import.meta.env?.VITE_FT_QA_BOOT === '1';
  return viteDev === true || qaBoot === '1';
}
