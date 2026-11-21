/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test('soundscape music list sits above the local upload row', async ({ page }) => {
  await openFreshProductShell(page);
  await expect(page.locator('.ambient-soundscape__mute')).toBeVisible({
    timeout: 15_000
  });
  await page.locator('.ambient-soundscape__mute').click();
  await expect(page.locator('.ambient-soundscape__panel')).toBeVisible({
    timeout: 5_000
  });
  const order = await page.evaluate(() => {
    const scroll = document.querySelector('.ambient-soundscape__panel-scroll');
    return [...(scroll?.children || [])].map((el) => el.className);
  });
  const tracks = order.findIndex((c) => c.includes('ambient-soundscape__tracks'));
  const upload = order.findIndex((c) =>
    c.includes('ambient-soundscape__upload-row')
  );
  expect(tracks).toBeGreaterThanOrEqual(0);
  expect(upload).toBeGreaterThan(tracks);
});
