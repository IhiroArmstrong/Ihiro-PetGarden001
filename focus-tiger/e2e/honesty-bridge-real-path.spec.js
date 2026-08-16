/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { DAILY_COMPLETION_STORAGE_KEY } from '../src/core/DailyCompletionStore.js';
import {
  clickWideMoreProxyOrDirect,
  openFreshProductShell
} from './helpers/product-shell.js';

/**
 * Task 3 · 真实 Honesty 补登 → 桥接 Yes → Arrival DOM。
 * 禁止经 `__honestyBridge.onHonestyCheckInComplete()` 注入；须走入口→时长→呼吸→记账。
 * `?honestyBreathMs=` 缩短墙钟（对齐 microRitualMs）；桥接排版 / Arrival 动画仍人工。
 */
test('Honesty real path: duration → breath → bridge Yes → Arrival', async ({
  page
}) => {
  await openFreshProductShell(page, {
    query: { honestyBreathMs: 1500 }
  });

  await clickWideMoreProxyOrDirect(page, 'honesty');

  const checkIn = page.locator('#honesty-check-in');
  await expect(checkIn).toBeVisible({ timeout: 5_000 });

  // Duration row — pick 20min (middle option); labels EN/ZH
  const duration20 = checkIn.getByRole('button', {
    name: /deep breath|深沉呼吸|~20m|约 20/i
  });
  await expect(duration20).toBeVisible({ timeout: 5_000 });
  await duration20.click();

  // Breath phase (shortened); then panel hides after record
  await expect(checkIn.locator('[data-honesty-breath-phase]')).toBeVisible({
    timeout: 3_000
  });
  await expect(checkIn).toBeHidden({ timeout: 12_000 });

  // Bridge must appear without __honestyBridge inject
  const bridge = page.locator('#honesty-bridge-cta');
  await expect(bridge).toBeVisible({ timeout: 8_000 });
  await expect(bridge).toContainText(
    /Want to sit for a bit now too|要不要现在也坐一会儿/
  );
  await expect(bridge.getByRole('button', { name: /^(Yes|好啊)$/i })).toBeVisible();

  await expect
    .poll(async () => {
      return page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        if (!raw) return 0;
        try {
          return JSON.parse(raw).sessions?.length ?? 0;
        } catch {
          return 0;
        }
      }, DAILY_COMPLETION_STORAGE_KEY);
    }, { timeout: 5_000 })
    .toBeGreaterThan(0);

  await bridge.getByRole('button', { name: /^(Yes|好啊)$/i }).click();

  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await expect(bridge).toBeHidden({ timeout: 5_000 });
  // Welcome / Notice beat — Arrival opened from bridge Yes (not Quick Start)
  await expect(arrival).toContainText(
    /What is present|当下有什么|Welcome|欢迎|A tap is enough|轻点就好/i
  );
});

test('Honesty real path: bridge No returns Idle without Arrival', async ({
  page
}) => {
  await openFreshProductShell(page, {
    query: { honestyBreathMs: 1500 }
  });

  await clickWideMoreProxyOrDirect(page, 'honesty');
  const checkIn = page.locator('#honesty-check-in');
  await expect(checkIn).toBeVisible({ timeout: 5_000 });
  await checkIn
    .getByRole('button', { name: /brief moment|片刻清静|~10m|约 10/i })
    .click();
  await expect(checkIn).toBeHidden({ timeout: 12_000 });

  const bridge = page.locator('#honesty-bridge-cta');
  await expect(bridge).toBeVisible({ timeout: 8_000 });
  await bridge.getByRole('button', { name: /^(No|先不用)$/i }).click();
  await expect(bridge).toBeHidden({ timeout: 5_000 });
  await expect(page.locator('#arrival-practice')).toBeHidden();
  await expect(page.locator('#btn-focus')).toContainText(/Sit with Yin|与阿寅同坐/i);
});
