/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

const CHECKOUT_PATH_RE =
  /create-(pro|membership|sanctuary|tip|companion-addon|art-collection)-checkout-session/i;

const HIT_SELECTORS = [
  '[data-testid="yin-support-pro-cta"]',
  '[data-testid="yin-support-membership-cta"]',
  '[data-testid="yin-support-sanctuary-cta"]',
  '[data-testid="yin-support-tea-cta"]',
  '[data-testid="yin-support-close"]'
];

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 */
async function assertCenterHitsTarget(page, selector) {
  const loc = page.locator(selector);
  await expect(loc).toBeVisible();
  await loc.scrollIntoViewIfNeeded();
  const hit = await loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const top = document.elementFromPoint(x, y);
    const ok = Boolean(top && (top === el || el.contains(top)));
    const topLabel = top
      ? String(
          /** @type {HTMLElement} */ (top).dataset?.testid ||
            top.id ||
            top.className ||
            top.tagName
        )
      : 'null';
    return { ok, topLabel, x, y };
  });
  expect(
    hit.ok,
    `${selector} center (${hit.x},${hit.y}) hit ${hit.topLabel} instead of the button`
  ).toBe(true);
}

test('payment click contract: Support CTAs hit themselves not the dim', async ({
  page
}) => {
  const checkoutUrls = [];
  await page.route(CHECKOUT_PATH_RE, async (route) => {
    checkoutUrls.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: 'https://checkout.stripe.com/c/pay/ft_e2e_contract',
        sessionId: 'cs_test_e2e_contract'
      })
    });
  });
  await page.addInitScript(() => {
    window.open = () => null;
  });

  await openFreshProductShell(page);
  await page.locator('#yin-support-fab').click();
  await expect(page.locator('#yin-support-modal')).toBeVisible();
  await expect(page.locator('#yin-support-modal')).toHaveClass(/is-visible/);

  for (const selector of HIT_SELECTORS) {
    const loc = page.locator(selector);
    if ((await loc.count()) === 0) continue;
    if (await loc.isHidden()) continue;
    await assertCenterHitsTarget(page, selector);
  }

  const proCta = page.locator('[data-testid="yin-support-pro-cta"]');
  await expect(proCta).toBeVisible();
  await proCta.click();

  await expect
    .poll(
      async () => {
        const modalOpen = await page
          .locator('#yin-support-modal.is-visible')
          .isVisible()
          .catch(() => false);
        const inlineError = await page
          .locator('[data-testid="yin-support-pro-checkout-status"]')
          .isVisible()
          .catch(() => false);
        return checkoutUrls.length > 0 || (modalOpen && inlineError) || modalOpen;
      },
      { timeout: 8_000 }
    )
    .toBeTruthy();

  const modalGone = await page
    .locator('#yin-support-modal.is-visible')
    .isHidden()
    .catch(() => true);
  const errorVisible = await page
    .locator('[data-testid="yin-support-pro-checkout-status"]')
    .isVisible()
    .catch(() => false);
  const startedCheckout = checkoutUrls.length > 0;
  expect(
    startedCheckout || errorVisible || !modalGone,
    'Subscribe must not close Support via the dim with no checkout and no error'
  ).toBeTruthy();
  expect(
    modalGone && !startedCheckout && !errorVisible,
    'regression: click landed on #yin-support-backdrop'
  ).toBe(false);
});
