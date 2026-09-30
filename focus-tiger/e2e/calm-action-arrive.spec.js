/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { clickSitEntry, openFreshProductShell } from './helpers/product-shell.js';

test('arrival completion shows Calm Action card before companion focus', async ({
  page
}) => {
  await openFreshProductShell(page);
  await clickSitEntry(page);
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });

  const noticePick = arrival.getByRole('button', {
    name: /Not Sure|不确定|Calm|平静/i
  });
  await expect(noticePick.first()).toBeVisible({ timeout: 8_000 });
  await noticePick.first().click();

  const reading = arrival.getByRole('button', { name: /Reading|阅读/i });
  await expect(reading).toBeVisible({ timeout: 20_000 });
  await reading.click();

  // Card is scheduled at Arrival ready and only holds a few seconds.
  // Waiting for the companion panel first lets that hold expire.
  const card = page.locator('[data-testid="calm-action-arrive-card"]');
  await expect(card).toBeVisible({ timeout: 20_000 });
  await expect(card).toHaveText(/.{12,}/);
  await expect(page.locator('.session-start-dock__panel')).toBeVisible({
    timeout: 45_000
  });
});
