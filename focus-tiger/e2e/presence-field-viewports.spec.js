/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import {
  openFreshProductShell,
  skipArrivalBegin,
  expectFocusSessionActive
} from './helpers/product-shell.js';

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../docs/task-briefs/presence-field-v0-shots'
);

const VIEWPORTS = [
  { name: '375', width: 375, height: 667 },
  { name: '768', width: 768, height: 1024 },
  { name: 'wide', width: 1280, height: 800 }
];

test('presence field viewport shots for PR (375 / 768 / wide)', async ({
  page
}) => {
  test.skip(process.env.FT_PRESENCE_FIELD_SHOTS !== '1');
  mkdirSync(OUT_DIR, { recursive: true });
  await page.setViewportSize({ width: 1280, height: 800 });
  await openFreshProductShell(page, {
    query: { presenceField: '1', sessionMinutes: '1' }
  });
  await skipArrivalBegin(page);
  await expectFocusSessionActive(page);
  await expect
    .poll(async () => page.locator('[data-testid=presence-field-lobe]').count(), {
      timeout: 8_000
    })
    .toBeGreaterThan(0);

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: join(OUT_DIR, `focusing-${vp.name}.png`),
      fullPage: false
    });
  }
});
