import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test('FocusHUD hover shows Focus % detail; streak native tip suppressed while pulse unread', async ({
  page
}) => {
  await openFreshProductShell(page);

  const hud = page.locator('#focus-hud .ft-hud');
  await expect(hud).toBeVisible();

  const detail = page.locator('#focus-hud .ft-hud__detail');
  await expect(detail).toHaveCSS('opacity', '0');
  await hud.hover();
  await expect(detail).toHaveCSS('opacity', '1');
  await expect(detail).toContainText(/%/);

  const streak = page.locator('#focus-hud streak-meter');
  await expect(streak).toBeVisible();
  await expect(streak).toHaveAttribute('pulse-owns-tip', '');
  await expect(streak).not.toHaveAttribute('title');

  const box = await streak.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

  // Pulse tip owns hover — built-in .label must stay hidden (no triple stack).
  await expect
    .poll(async () =>
      streak.evaluate((el) => {
        const label = el.shadowRoot?.querySelector('.label');
        return label ? Number(getComputedStyle(label).opacity) : -1;
      })
    )
    .toBe(0);
});

test('FocusHUD streak .label returns after pulse tip is done', async ({ page }) => {
  await openFreshProductShell(page);

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const ui = window.__onboardingHints;
        if (!ui?.markSeen || !ui?.store) return 'no-api';
        ui.markSeen('focus-hud-streak');
        return ui.store.isDone('focus-hud-streak') ? 'done' : 'pending';
      })
    )
    .toBe('done');

  const streak = page.locator('#focus-hud streak-meter');
  await expect(streak).toBeVisible();
  await expect
    .poll(async () =>
      streak.evaluate((el) => el.hasAttribute('pulse-owns-tip'))
    )
    .toBe(false);
  await expect(streak).not.toHaveAttribute('title');

  const box = await streak.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect
    .poll(async () =>
      streak.evaluate((el) => {
        const label = el.shadowRoot?.querySelector('.label');
        return label ? Number(getComputedStyle(label).opacity) : 0;
      })
    )
    .toBeGreaterThan(0.9);

  const labelText = await streak.evaluate(
    (el) => el.shadowRoot?.querySelector('.label')?.textContent || ''
  );
  expect(labelText).toMatch(/Recent days|近日同坐/);

  const geometry = await streak.evaluate((el) => {
    const label = el.shadowRoot?.querySelector('.label');
    if (!label) return null;
    const r = label.getBoundingClientRect();
    return {
      h: r.height,
      inView: r.top >= 0 && r.bottom <= window.innerHeight && r.width > 8,
      unclipped: label.scrollHeight <= label.clientHeight + 1
    };
  });
  expect(geometry?.inView).toBe(true);
  expect(geometry?.h).toBeGreaterThan(8);
  expect(geometry?.unclipped).toBe(true);
});
