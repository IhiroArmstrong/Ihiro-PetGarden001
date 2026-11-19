/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * R2L-02: 390px Share was hit-tested onto `#ft-narrow-home-ctas`.
 * Opens the existing panel API (same as the ear / ActionBar), then shrinks.
 */

async function openThoughtDropCard(page) {
  await page.waitForFunction(() => Boolean(window.__confideToYin?.open), {
    timeout: 15_000
  });
  await page.waitForFunction(() => {
    window.__confideToYin.open();
    return window.__confideToYin.isOpen() === true;
  }, { timeout: 15_000 });
}

async function completeChatConsentIfShown(page) {
  const modal = page.getByTestId('confide-consent-modal');
  const shown = await modal
    .waitFor({ state: 'visible', timeout: 3_000 })
    .then(() => true)
    .catch(() => false);
  if (!shown) return;
  await page.getByTestId('confide-consent-item1').click();
  await page.getByTestId('confide-consent-item2').click();
  await page.getByTestId('confide-consent-age').click();
  await page.getByTestId('confide-consent-confirm').click();
  await expect(modal).toBeHidden();
}

test('390px Thought Drop send is not covered by home CTAs', async ({ page }) => {
  await openFreshProductShell(page, {
    query: { confide: '1', flowerWelcome: '0' }
  });
  const browse = page.getByTestId('cold-start-goal-browse');
  const goalShown = await browse
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (goalShown) await browse.click();

  await openThoughtDropCard(page);
  await expect(page.getByTestId('confide-to-yin-card')).toBeVisible();
  await completeChatConsentIfShown(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#ft-narrow-home-ctas')).toHaveCSS(
    'pointer-events',
    'none'
  );

  const send = page.getByTestId('confide-to-yin-send');
  await expect(send).toBeVisible();
  const box = await send.boundingBox();
  expect(box).toBeTruthy();
  const hit = await page.evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return 'none';
      if (el.closest('#ft-narrow-home-ctas')) return 'home-ctas';
      if (el.closest('[data-testid="confide-to-yin-send"]')) return 'send';
      return el.id || el.className || el.tagName;
    },
    { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  );
  expect(hit).not.toBe('home-ctas');
});
