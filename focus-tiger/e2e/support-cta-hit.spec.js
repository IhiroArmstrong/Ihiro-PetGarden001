/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { dismissColdStartOverlay } from './helpers/cold-start-overlay.js';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * Scene Q guard: a shared glass-card z-index rewrite must not put Support
 * CTAs under the dim. Hits the button center with elementFromPoint (no Stripe).
 */

test.use({ viewport: { width: 1280, height: 720 } });

const MONEY_CTA_TEST_IDS = [
  'yin-support-membership-cta',
  'yin-support-sanctuary-cta',
  'yin-support-tea-cta',
  'yin-support-pro-cta',
  'yin-support-close'
];

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} locator
 * @param {string} testId
 */
async function hitAtCenter(page, locator, testId) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box, `${testId} has a box`).toBeTruthy();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  return page.evaluate(
    ({ x, y, testId: id }) => {
      const el = document.elementFromPoint(x, y);
      const cta = document.querySelector(`[data-testid="${id}"]`);
      const dim = document.getElementById('yin-support-backdrop');
      return {
        hitsCta: Boolean(cta && el && (el === cta || cta.contains(el))),
        hitsDim: Boolean(dim && el && (el === dim || dim.contains(el))),
        tag: el?.tagName || null,
        id: el?.id || null
      };
    },
    { x, y, testId }
  );
}

test('Support money CTAs stay above the dim and can start checkout', async ({
  page
}) => {
  await page.route(/create-(pro|membership|sanctuary|tip|companion-addon)-checkout-session/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: 'https://checkout.stripe.com/c/pay/cs_test_e2e_blocked',
        sessionId: 'cs_test_e2e_blocked'
      })
    });
  });
  await page.route('https://checkout.stripe.com/**', (route) => route.abort());

  await openFreshProductShell(page);
  await dismissColdStartOverlay(page);

  const fab = page.locator('#yin-support-fab');
  await expect(fab).toBeVisible();
  await fab.click();

  const modal = page.locator('#yin-support-modal');
  await expect(modal).toBeVisible();

  for (const testId of MONEY_CTA_TEST_IDS) {
    const locator = page.getByTestId(testId);
    if (!(await locator.isVisible())) continue;
    const hit = await hitAtCenter(page, locator, testId);
    expect(hit.hitsDim, `${testId} must not hit the dim (${hit.tag}#${hit.id})`).toBe(
      false
    );
    expect(hit.hitsCta, `${testId} center must hit the button itself`).toBe(true);
  }

  const pro = page.getByTestId('yin-support-pro-cta');
  const membership = page.getByTestId('yin-support-membership-cta');
  const buy = (await pro.isVisible()) ? pro : membership;
  const checkoutWait = page
    .waitForRequest((req) => /checkout-session/.test(req.url()), {
      timeout: 2_000
    })
    .catch(() => null);

  await buy.click();
  const checkoutReq = await checkoutWait;
  const stillOpen = await modal.isVisible();
  if (!checkoutReq && !stillOpen) {
    throw new Error(
      'Support closed with no checkout request — the dim likely ate the click'
    );
  }
});
