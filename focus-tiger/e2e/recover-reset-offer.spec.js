/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  expectFocusSessionActive,
  openFreshProductShell,
  quickStartFocus,
  selectCompanionMode
} from './helpers/product-shell.js';

test('passive refocus shows reset offer emoji strip', async ({ page }) => {
  await openFreshProductShell(page, { query: { sessionMinutes: '1' } });
  await quickStartFocus(page);
  const panel = page.locator('.session-start-dock__panel');
  if (await panel.isVisible().catch(() => false)) {
    await selectCompanionMode(page, /Here & Now|当下同坐/i);
  }
  await expectFocusSessionActive(page);

  await page.evaluate(() => {
    window.__mindfulReminderController?.handleAttentionReturn?.({
      durationMs: 70_000,
      displayEligible: true
    });
  });

  const offer = page.locator('[data-testid="recover-reset-offer"]');
  // Offer schedules ~8.2s after passive refocus acknowledge (Brief §2.3).
  await expect(offer).toBeVisible({ timeout: 15_000 });
  await expect(offer.locator('.recover-reset-offer__prompt')).not.toHaveText('');
});
