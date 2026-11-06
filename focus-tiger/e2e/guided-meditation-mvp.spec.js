/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import {
  openFreshProductShell,
  pickWideMoreRadialGroup
} from './helpers/product-shell.js';

test.use({ viewport: { width: 1280, height: 900 } });

test('Practice menu opens Guided meditation; short lesson can credit', async ({
  page
}) => {
  await page.addInitScript(() => {
    globalThis.__FT_GUIDED_MEDITATION_MOCK_MEDIA__ = true;
  });
  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  await page.locator('#ft-wide-more-btn').click();
  await pickWideMoreRadialGroup(page, 'MENU_GROUP_PRACTICE');
  const menu = page.locator('#ft-wide-more-menu');
  await expect(menu).toBeVisible({ timeout: 5_000 });
  await expect(menu.locator('[data-proxy="guided-meditation"]')).toBeVisible();
  await menu.locator('[data-proxy="guided-meditation"]').click();

  const card = page.locator('[data-testid="guided-meditation"]');
  await expect(card).toBeVisible({ timeout: 3_000 });
  await expect(page.locator('#ft-wide-more-btn')).toBeVisible();
  await expect(
    page.getByTestId('guided-meditation-lesson-concepts-habits-intro')
  ).toBeVisible();
  await expect(
    page.getByTestId('guided-meditation-lesson-what-is-zen-ancient-wisdom')
  ).toBeVisible();

  await page.getByTestId('guided-meditation-lesson-concepts-habits-intro').click();
  await expect(page.getByTestId('guided-meditation-player')).toBeVisible({
    timeout: 3_000
  });
  await expect(page.getByTestId('guided-meditation-status')).toBeVisible();
  await expect(page.getByTestId('guided-meditation-audio-fallback')).toBeVisible();
  await expect(page.getByTestId('guided-meditation-video')).not.toHaveAttribute(
    'crossorigin'
  );

  const credited = await page.evaluate(() =>
    window.__guidedMeditation?.creditFromTestHook?.(
      'concepts-habits-intro',
      253
    )
  );
  expect(credited).toBe(true);
  await expect(page.getByTestId('guided-meditation-status')).toContainText(
    /counted|已计入|数えました/i
  );
});
