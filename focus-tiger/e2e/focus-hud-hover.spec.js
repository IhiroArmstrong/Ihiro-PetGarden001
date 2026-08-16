/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

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

test('FocusHUD hosts show hint copy on hover without mint pulse badges', async ({
  page
}) => {
  await openFreshProductShell(page);

  await page.evaluate(() => {
    window.__onboardingHints?.store?.clear?.();
    window.__onboardingHints?.syncDiscoveryDots?.();
  });

  for (const hintId of [
    'focus-hud-ring',
    'focus-hud-progress',
    'focus-hud-streak'
  ]) {
    await expect(
      page.locator(
        `.onboarding-hint-badge[data-hint-id="${hintId}"]:not([hidden])`
      )
    ).toHaveCount(0);
  }

  const cases = [
    {
      host: '#focus-hud .ft-hud__gauge',
      hintId: 'focus-hud-ring',
      copy: /quiet presence|轻柔陪伴|スコアボード/
    },
    {
      host: '#focus-hud .ft-hud__bar',
      hintId: 'focus-hud-progress',
      copy: /Today's shared sitting|今日同坐|きょういっしょ/
    },
    {
      host: '#focus-hud .ft-hud__streak',
      hintId: 'focus-hud-streak',
      copy: /Recent days you practiced|近日同坐|日ごとに一つの点/
    }
  ];

  for (const { host, hintId, copy } of cases) {
    const el = page.locator(host);
    await expect(el).toBeVisible();
    await el.hover();
    const tip = page.locator(
      `ft-onboarding-hint-bubble[data-hint-id="${hintId}"]`
    );
    await expect(tip).toBeVisible({ timeout: 5_000 });
    await expect(tip).toContainText(copy);
    await page.mouse.move(0, 0);
    await expect(tip).toBeHidden({ timeout: 5_000 });
  }
});
