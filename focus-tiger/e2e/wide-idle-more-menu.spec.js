import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * Wide Idle (≥480) declutter: Sit + ⚡ + ⋯; secondary via upward popover.
 */

test.use({ viewport: { width: 1280, height: 720 } });

test('wide Idle: resident Sit + Quick Start + more; secondary parked', async ({
  page
}) => {
  await openFreshProductShell(page);

  await expect(page.locator('#btn-focus')).toBeVisible();
  await expect(page.locator('#quick-start-focus')).toBeVisible();
  await expect(page.locator('#ft-wide-more-btn')).toBeVisible();

  // Parked off-canvas — not in the visible bottom cluster
  await expect(page.locator('.session-start-dock__hint')).not.toBeInViewport();
  await expect(page.locator('.ambient-soundscape__fab')).not.toBeInViewport();
  await expect(page.locator('#reminder-preference-toggle')).not.toBeInViewport();

  // Left ? / heatmap stay (out of declutter scope)
  await expect(page.locator('#onboarding-hint-help')).toBeVisible();
  await expect(page.locator('#weekly-practice-heatmap')).toBeVisible();
});

test('wide Idle: ⋯ opens companion + reminder panels', async ({ page }) => {
  await openFreshProductShell(page);
  const more = page.locator('#ft-wide-more-btn');
  await expect(more).toBeVisible({ timeout: 15_000 });
  await more.click();
  await expect(page.locator('#ft-wide-more-menu')).toBeVisible({
    timeout: 5_000
  });
  await page.locator('#ft-wide-more-menu [data-proxy="companion"]').click();
  await expect(page.locator('.session-start-dock__panel')).toBeVisible({
    timeout: 5_000
  });
  await expect(page.locator('#ft-wide-more-menu')).toBeHidden();

  await page.evaluate(() => window.__companionModePicker?.hide?.());
  await expect(page.locator('.session-start-dock__panel')).toBeHidden();

  await more.click();
  await expect(page.locator('#ft-wide-more-menu')).toBeVisible({
    timeout: 5_000
  });
  await page.locator('#ft-wide-more-menu [data-proxy="reminder"]').click();
  await expect(page.locator('#reminder-preference-panel')).toBeVisible({
    timeout: 5_000
  });
});

test('wide Arrival: only Quick Start; Sit and ⋯ hidden', async ({ page }) => {
  await openFreshProductShell(page);
  await page.locator('#btn-focus').click();
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
  await expect(page.locator('#btn-focus')).toBeHidden();
  await expect(page.locator('#ft-wide-more-btn')).toBeHidden();
  await expect(page.locator('#quick-start-focus')).toBeVisible();
});

test('wide Focusing: more hidden; Sound FAB returns', async ({ page }) => {
  await openFreshProductShell(page);
  await page.locator('#quick-start-focus').click();
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 15_000
  });
  await expect(page.locator('#ft-wide-more-btn')).toBeHidden();
  await expect(page.locator('.ambient-soundscape__fab')).toBeInViewport();
});
