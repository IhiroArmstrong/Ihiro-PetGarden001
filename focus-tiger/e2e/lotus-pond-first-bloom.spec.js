/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * Empty-pond first bloom must sit left of Yin, not under the cushion.
 * Pond is in front of `#sprite-stage` (2026-08-21).
 * Full-ring 11→12 count remains in lotus-pond-product.spec.js.
 */

test.describe('Lotus pond first bloom slot', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('qaLotusBlooms=1 plants bloom 0 left of Yin, not under the cushion', async ({
    page
  }) => {
    await openFreshProductShell(page, {
      query: { qaLotusBlooms: 1 }
    });

    const bloom = page.locator(
      '#lotus-pond .lotus-pond-bloom[data-lotus-index="0"]'
    );
    await expect(bloom).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#lotus-pond .lotus-pond-bloom')).toHaveCount(1);

    const slot = await bloom.evaluate((el) => ({
      leftPct: parseFloat(el.style.left),
      bottomPct: parseFloat(el.style.bottom)
    }));

    expect(slot.leftPct).toBeLessThan(40);
    expect(
      Math.abs(slot.leftPct - 50) < 8 && slot.bottomPct < 22
    ).toBe(false);

    const pondInFrontOfYin = await page.evaluate(() => {
      const pond = document.querySelector('#lotus-pond');
      const stage = document.querySelector('#sprite-stage');
      if (!pond || !stage) return false;
      const pondZ = Number.parseInt(pond.style.zIndex || '0', 10);
      const stageZ = Number.parseInt(stage.style.zIndex || '0', 10);
      return pondZ > stageZ;
    });
    expect(pondInFrontOfYin).toBe(true);
  });
});
