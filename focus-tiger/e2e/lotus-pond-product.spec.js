/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import {
  openFreshProductShell,
  quickStartFocus
} from './helpers/product-shell.js';

/**
 * Product-path lotus pond Slice A: seed 11 blooms, complete 1 minute,
 * 12th bloom plants after the completion ceremony (not during it).
 */

test.describe('Lotus pond product path', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('qaLotusBlooms=11 then 1-minute sit plants the 12th bloom', async ({
    page
  }) => {
    await openFreshProductShell(page, {
      query: { sessionMinutes: 1, qaLotusBlooms: 11 }
    });

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => window.__lotusPondStore?.getVisibleBloomCount?.() ?? 0
          ),
        { timeout: 10_000 }
      )
      .toBe(11);

    await expect
      .poll(
        async () =>
          page.locator('#lotus-pond .lotus-pond-bloom').count(),
        { timeout: 10_000 }
      )
      .toBe(11);

    const firstSrc = await page
      .locator('#lotus-pond .lotus-pond-bloom')
      .first()
      .getAttribute('src');
    expect(firstSrc || '').not.toContain('lotus-front-rising');
    expect(firstSrc || '').not.toContain('lotus-chest-halo');

    await quickStartFocus(page);

    await expect
      .poll(
        async () =>
          page.evaluate(
            () => window.__lotusPondStore?.getVisibleBloomCount?.() ?? 0
          ),
        { timeout: 90_000 }
      )
      .toBe(12);

    await expect
      .poll(
        async () =>
          page.locator('#lotus-pond .lotus-pond-bloom').count(),
        { timeout: 20_000 }
      )
      .toBe(12);
  });
});
