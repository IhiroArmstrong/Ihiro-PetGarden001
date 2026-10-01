/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { expect } from '@playwright/test';

const SKIP_ALL_RE = /Skip all|全部跳过|すべてスキップ/i;
const CONTINUE_RE = /Continue|继续|続ける/i;

/**
 * Skip all → wisdom-hold landing → Continue dismisses Reflection.
 * Calm Action Reflect · TEST_TRACKER 2026-09-09.
 *
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} [reflection]
 */
export async function dismissReflectionViaWisdomHold(page, reflection) {
  const card = reflection ?? page.locator('#tiger-reflection-moment');
  await card.getByRole('button', { name: SKIP_ALL_RE }).click();
  const continueBtn = card.getByRole('button', { name: CONTINUE_RE });
  await expect(continueBtn).toBeVisible({ timeout: 8_000 });
  await continueBtn.click();
  await expect(card).toBeHidden({ timeout: 10_000 });
}
