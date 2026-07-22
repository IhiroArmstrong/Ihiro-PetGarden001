import { test, expect } from '@playwright/test';
import { DAILY_COMPLETION_STORAGE_KEY } from '../src/core/DailyCompletionStore.js';
import { PRACTICE_DAYS_STORAGE_KEY } from '../src/core/PracticeDaysStore.js';

/**
 * 「一分钟呼吸」微仪式 DOM 主路径。
 * 用 `?microRitualMs=` 缩短墙钟；序列观感（smiling / 摆尾节奏）仍人工。
 */
test('micro ritual: entry → breath → complete → record + toast', async ({
  page
}) => {
  const retentionLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[RetentionTelemetry]') && text.includes('micro_ritual_complete')) {
      retentionLogs.push(text);
    }
  });

  await page.goto('/?product=1&microRitualMs=1500');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('focus-tiger.')) localStorage.removeItem(key);
    }
  });
  await page.reload();
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 60_000 });

  const entry = page.locator('#micro-ritual-idle-entry');
  await expect(entry).toBeVisible({ timeout: 15_000 });
  await expect(entry).toContainText(/A minute of breath|一分钟呼吸/i);
  // 立体按钮（非下划线轻链）：须有可见边框/背景，不抢 Sit 主 CTA
  await expect(entry).toHaveCSS('border-radius', '999px');
  const bg = await entry.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toMatch(/gradient/i);

  await entry.click();

  const ritual = page.locator('#micro-ritual');
  await expect(ritual).toBeVisible({ timeout: 5_000 });
  await expect(ritual).toHaveAttribute('data-micro-ritual-phase', 'breath');
  await expect(
    ritual.locator('[data-micro-ritual-breath-phase]')
  ).toContainText(/Inhale|Exhale|吸气|呼气/i);

  // Sit 进行中须禁用（禁止可点却静默）
  await expect(page.locator('#btn-focus')).toBeDisabled();

  await expect
    .poll(async () => page.locator('#mindful-acknowledge-toast').textContent(), {
      timeout: 10_000
    })
    .toMatch(/Today counts, too|今天，也算数/i);

  await expect(ritual).toBeHidden({ timeout: 8_000 });

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

  await expect
    .poll(async () => {
      return page.evaluate((key) => {
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        try {
          const days = JSON.parse(raw).days;
          return Array.isArray(days) && days.length > 0;
        } catch {
          return false;
        }
      }, PRACTICE_DAYS_STORAGE_KEY);
    }, { timeout: 5_000 })
    .toBe(true);

  await expect
    .poll(() => retentionLogs.length, { timeout: 5_000 })
    .toBeGreaterThan(0);

  // 回流：入口再次可见；Sit 恢复；不进 Reflection
  await expect(entry).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#btn-focus')).toBeEnabled();
  await expect(page.locator('#btn-focus')).toContainText(/Sit with Yin|与阿寅同坐/i);
  await expect(page.locator('#tiger-reflection-moment')).toHaveCount(0);
});

test('micro ritual: quiet leave does not record', async ({ page }) => {
  await page.goto('/?product=1&microRitualMs=60000');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('focus-tiger.')) localStorage.removeItem(key);
    }
  });
  await page.reload();
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 60_000 });

  const entry = page.locator('#micro-ritual-idle-entry');
  await expect(entry).toBeVisible({ timeout: 15_000 });
  await entry.click();

  const ritual = page.locator('#micro-ritual');
  await expect(ritual).toBeVisible({ timeout: 5_000 });
  await ritual.locator('[data-micro-ritual-leave]').click();
  await expect(ritual).toBeHidden({ timeout: 5_000 });

  const sessions = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    try {
      return JSON.parse(raw).sessions?.length ?? 0;
    } catch {
      return 0;
    }
  }, DAILY_COMPLETION_STORAGE_KEY);
  expect(sessions).toBe(0);

  await expect(page.locator('#mindful-acknowledge-toast')).not.toContainText(
    /Today counts|今天，也算数/
  );
  await expect(entry).toBeVisible();
  await expect(page.locator('#btn-focus')).toBeEnabled();
});

test('bridge CTA hides micro-ritual entry over Yes/No; No restores entry', async ({
  page
}) => {
  await page.goto('/?product=1');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('focus-tiger.')) localStorage.removeItem(key);
    }
  });
  await page.reload();
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 60_000 });

  const entry = page.locator('#micro-ritual-idle-entry');
  await expect(entry).toBeVisible({ timeout: 15_000 });

  const bridgeReady = await page.evaluate(() => {
    const bridge = window.__honestyBridge;
    if (!bridge?.onHonestyCheckInComplete) return false;
    bridge.onHonestyCheckInComplete();
    return bridge.isVisible() === true;
  });
  expect(bridgeReady).toBe(true);

  const bridge = page.locator('#honesty-bridge-cta');
  await expect(bridge).toBeVisible({ timeout: 5_000 });
  await expect(bridge).toContainText(
    /Want to sit for a bit now too|要不要现在也坐一会儿/
  );
  // 回归：一分钟呼吸不得叠在 Yes/No 上（dock z16 > 桥接 z15）
  await expect(entry).toBeHidden();

  await bridge.getByRole('button', { name: /^(No|先不用)$/i }).click();
  await expect(bridge).toBeHidden({ timeout: 5_000 });
  await expect(entry).toBeVisible({ timeout: 10_000 });
});
