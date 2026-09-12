/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { getScenarioResetPlan } from '../../src/core/debugScenarioReset.js';

/**
 * Apply an official scenario recipe inside the page.
 * Uses the same plan as DEV `window.__ftDebug.resetScenario` (prod e2e has
 * no `__ftDebug`; this imports the module in Node and only ships key lists).
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} id
 */
export async function applyScenarioResetOnPage(page, id) {
  const plan = getScenarioResetPlan(id);
  await page.evaluate((p) => {
    for (const key of p.localStorageKeys) localStorage.removeItem(key);
    for (const key of p.sessionStorageKeys) sessionStorage.removeItem(key);
  }, plan);
  return plan;
}
