/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * First-ship: Practice Study menu + T83 first-sit invite stay off in release
 * builds until B5 (RR-21) passes. DEV / FT_QA_BOOT / FT_PRACTICE_STUDY_MENU=1 only.
 */

function compileTimePracticeStudyMenuFlag() {
  try {
    return import.meta.env.VITE_FT_PRACTICE_STUDY_MENU;
  } catch {
    return '';
  }
}

function compileTimeQaBootFlag() {
  try {
    return import.meta.env.VITE_FT_QA_BOOT;
  } catch {
    return '';
  }
}

function compileTimeIsProductionBundle() {
  try {
    if (import.meta.env.PROD === true) return true;
    const mode = import.meta.env.MODE;
    return mode === 'production';
  } catch {
    return false;
  }
}

/**
 * @param {object} [deps]
 * @param {boolean | undefined} [deps.productionBundle]
 * @param {string | boolean | undefined} [deps.viteQaBoot]
 * @param {string | boolean | undefined} [deps.vitePracticeStudyMenu]
 * @returns {boolean}
 */
export function isPracticeStudyMenuReleaseEnabled(deps = {}) {
  const productionBundle =
    deps.productionBundle !== undefined
      ? deps.productionBundle === true
      : compileTimeIsProductionBundle();
  if (!productionBundle) return true;

  const qaBoot =
    deps.viteQaBoot !== undefined ? deps.viteQaBoot : compileTimeQaBootFlag();
  const menuFlag =
    deps.vitePracticeStudyMenu !== undefined
      ? deps.vitePracticeStudyMenu
      : compileTimePracticeStudyMenuFlag();
  if (qaBoot === '1' || qaBoot === true) return true;
  if (menuFlag === '1' || menuFlag === true) return true;
  return false;
}
