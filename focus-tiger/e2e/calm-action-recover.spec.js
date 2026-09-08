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

test('active recover shows Calm Action card without replacing toast', async ({
  page
}) => {
  await openFreshProductShell(page, { query: { sessionMinutes: '1' } });
  await quickStartFocus(page);
  const panel = page.locator('.session-start-dock__panel');
  if (await panel.isVisible().catch(() => false)) {
    await selectCompanionMode(page, /Here & Now|当下同坐/i);
  }
  await expectFocusSessionActive(page);

  await expect(page.locator('[data-testid="active-recover-anchor"]')).toBeVisible({
    timeout: 8_000
  });

  await page.locator('[data-testid="active-recover-hit"]').click({ force: true });

  const card = page.locator('[data-testid="calm-action-recover-card"]');
  await expect(card).toBeVisible({ timeout: 5_000 });
  await expect(card).not.toHaveText('');
  await expect(card).toHaveText(/.{12,}/);
});
