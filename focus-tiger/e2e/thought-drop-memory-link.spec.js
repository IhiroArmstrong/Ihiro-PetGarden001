/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

const EMPTY_MEMORY_STATE = {
  schemaVersion: 1,
  consent: 'granted',
  consentedAt: '2026-01-01T00:00:00.000Z',
  rememberOptOuts: [],
  memories: []
};

test('Thought Drop What Yin remembers opens the memory panel in front', async ({
  page
}) => {
  await page.addInitScript((state) => {
    window.desktopShell = {
      isDesktop: true,
      yinPersonalMemory: {
        getState: async () => state,
        setConsent: async () => state,
        rememberFromConfide: async () => state,
        recordOptOut: async () => state,
        suppressPostRecallFromConfide: async () => state,
        forget: async () => state
      }
    };
  }, EMPTY_MEMORY_STATE);

  await openFreshProductShell(page, {
    query: { confide: '1', flowerWelcome: '0' }
  });
  const browse = page.getByTestId('cold-start-goal-browse');
  const goalShown = await browse
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (goalShown) await browse.click();

  await page.waitForFunction(() => Boolean(window.__confideToYin?.open), {
    timeout: 15_000
  });
  await page.evaluate(() => window.__confideToYin.open());

  const consent = page.getByTestId('confide-consent-modal');
  if (await consent.isVisible().catch(() => false)) {
    await page.getByTestId('confide-consent-item1').click();
    await page.getByTestId('confide-consent-item2').click();
    await page.getByTestId('confide-consent-age').click();
    await page.getByTestId('confide-consent-confirm').click();
  }

  const link = page.getByTestId('confide-to-yin-memory-list-link');
  await expect(link).toBeVisible();
  await link.click();

  const memory = page.getByTestId('yin-personal-memory');
  await expect(memory).toBeVisible({ timeout: 1000 });
  const stack = await page.evaluate(() => {
    const mem = document.getElementById('yin-personal-memory');
    const confide = document.getElementById('confide-to-yin-card');
    return {
      memoryZ: Number(getComputedStyle(mem).zIndex),
      confideZ: Number(getComputedStyle(confide).zIndex)
    };
  });
  expect(stack.memoryZ).toBeGreaterThan(stack.confideZ);
});
