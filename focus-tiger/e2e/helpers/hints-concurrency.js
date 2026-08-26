/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { expect } from '@playwright/test';

/**
 * Guardrail: onboarding hint bubbles must not pile up on screen.
 * Product surface (2026-08-04): click/HUD hover expands at most one bubble;
 * auto spray and ? remedy tips are off — this locks the invariant if those paths return.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} [max=1]
 */
export async function expectOpenHintBubblesAtMost(page, max = 1) {
  const count = await page.locator('ft-onboarding-hint-bubble[open]').count();
  expect(count).toBeLessThanOrEqual(max);
}
