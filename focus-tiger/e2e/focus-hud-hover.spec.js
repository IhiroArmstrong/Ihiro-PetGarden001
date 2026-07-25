import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

test('FocusHUD hover shows Focus % detail and streak tooltip above progress bar', async ({
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

  // Label sits over the shared-sitting band with host z-index; must be on-screen
  const geometry = await streak.evaluate((el) => {
    const label = el.shadowRoot?.querySelector('.label');
    if (!label) return null;
    const r = label.getBoundingClientRect();
    return {
      w: r.width,
      h: r.height,
      top: r.top,
      bottom: r.bottom,
      scrollH: label.scrollHeight,
      clientH: label.clientHeight,
      inView: r.top >= 0 && r.bottom <= window.innerHeight && r.width > 8,
      // Descenders must fit: no internal clip (scrollHeight ≈ clientHeight)
      unclipped: label.scrollHeight <= label.clientHeight + 1
    };
  });
  expect(geometry?.inView).toBe(true);
  expect(geometry?.h).toBeGreaterThan(8);
  expect(geometry?.unclipped).toBe(true);
});
