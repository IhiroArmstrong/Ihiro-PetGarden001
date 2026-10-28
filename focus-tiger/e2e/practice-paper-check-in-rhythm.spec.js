/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

const AWAKEN_CHECKIN_KEY = 'focus-tiger.awaken-check-ins.v1';

test('Practice Paper shows end check-in rhythm when T52 ledger has end rows', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.evaluate(
    ({ key }) => {
      const ts = new Date();
      ts.setHours(12, 0, 0, 0);
      localStorage.setItem(
        key,
        JSON.stringify([
          {
            sessionId: 'e2e-sit-1',
            ts: ts.getTime(),
            label: 'ease',
            phase: 'end'
          }
        ])
      );
    },
    { key: AWAKEN_CHECKIN_KEY }
  );

  await page.getByTestId('growth-journey-home-line').click();
  const rhythm = page.getByTestId('practice-paper-check-in-rhythm');
  await expect(rhythm).toBeVisible({ timeout: 5_000 });
  await expect(rhythm).toContainText(/Ease|顺/);
});
