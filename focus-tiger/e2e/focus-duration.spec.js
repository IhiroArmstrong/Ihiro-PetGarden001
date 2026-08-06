import { test, expect } from '@playwright/test';
import {
  chooseReadingAndOpenCompanion,
  openFreshProductShell,
  selectCompanionMode
} from './helpers/product-shell.js';

/**
 * Product Focus duration chips (15/25/45/60) — no ?sessionMinutes= so picker shows.
 */
test('Focus duration: companion select → 15 chip starts Focusing', async ({
  page
}) => {
  await openFreshProductShell(page, { path: '/?product=1' });
  await chooseReadingAndOpenCompanion(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  // selectCompanionMode already picks if shown; assert we are Focusing with short wait
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 15_000
  });
  await expect(page.locator('#hud-state')).toContainText(/Focusing|专注/i);
});

test('Focus duration: Leave cancels without Focusing', async ({ page }) => {
  await openFreshProductShell(page, { path: '/?product=1' });
  await chooseReadingAndOpenCompanion(page);
  const panel = page.locator('.session-start-dock__panel');
  await panel
    .locator('.session-start-dock__option')
    .filter({ hasText: /Here & Now|当下同坐/i })
    .click();
  const picker = page.locator('#focus-duration-picker');
  await expect(picker).toBeVisible({ timeout: 5_000 });
  await picker.locator('[data-focus-duration-leave]').click();
  await expect(picker).toBeHidden({ timeout: 5_000 });
  await expect(page.locator('#btn-focus')).toContainText(/Sit with Yin|与阿寅同坐/i);
  await expect(page.locator('#hud-state')).not.toContainText(/Focusing|专注中/i);
});

test('Focus duration: ?sessionMinutes=1 skips picker', async ({ page }) => {
  await openFreshProductShell(page, {
    path: '/?product=1&sessionMinutes=1'
  });
  await chooseReadingAndOpenCompanion(page);
  const panel = page.locator('.session-start-dock__panel');
  await panel
    .locator('.session-start-dock__option')
    .filter({ hasText: /Here & Now|当下同坐/i })
    .click();
  await expect(page.locator('#focus-duration-picker')).toHaveCount(0);
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 15_000
  });
});
