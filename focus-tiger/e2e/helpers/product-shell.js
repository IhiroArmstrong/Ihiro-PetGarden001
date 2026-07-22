import { expect } from '@playwright/test';

/** 清 focus-tiger.* localStorage 并等待产品壳 Sit 可见。 */
export async function openFreshProductShell(page) {
  await page.goto('/?product=1');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('focus-tiger.')) localStorage.removeItem(key);
    }
  });
  await page.reload();
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 60_000 });
}

/**
 * Sit → 逐步 Skip Arrival → Companion 三选一面板展开。
 * 使用真实 Skip 按钮（非 DEV 强制），跳过 Choose 以避开 intentionSet 动画等待。
 */
export async function advanceArrivalToCompanionPicker(page) {
  await page.locator('#btn-focus').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });

  const skipStep = arrival.getByRole('button', { name: /^Skip$/i });
  const panel = page.locator('.session-start-dock__panel');

  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (await panel.isVisible()) return;

    if (await arrival.isVisible()) {
      if (await skipStep.isVisible()) {
        await skipStep.click();
        await page.waitForTimeout(200);
        continue;
      }
    }

    await page.waitForTimeout(300);
  }

  throw new Error('Companion picker did not open within timeout');
}

/**
 * Arrival 已打开时点「Skip — begin」，立刻结束抵达练习。
 * @param {import('@playwright/test').Page} page
 */
export async function skipArrivalBegin(page) {
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await arrival.getByRole('button', { name: /Skip — begin|跳过，直接开始|跳过并开始/i }).click();
  await expect(arrival).toBeHidden({ timeout: 15_000 });
}

/** @param {import('@playwright/test').Page} page @param {RegExp|string} label */
export async function selectCompanionMode(page, label) {
  const panel = page.locator('.session-start-dock__panel');
  await expect(panel).toBeVisible({ timeout: 10_000 });
  await panel
    .locator('.session-start-dock__option')
    .filter({ hasText: label })
    .click();
}

export async function expectFocusSessionActive(page) {
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i);
  await expect(page.locator('#hud-state')).toContainText(/Focusing|专注/i);
  await expect
    .poll(async () => page.locator('#hud-time').textContent(), {
      timeout: 8_000
    })
    .not.toBe('00:00');
}

export async function expectFocusSessionInactive(page) {
  await expect(page.locator('#btn-focus')).toContainText(/Sit with Yin|与阿寅同坐/i);
  await expect(page.locator('#hud-state')).toContainText(
    /Calm|Idle|Asleep|沉静|空闲|沉睡/i
  );
  await expect(page.locator('#hud-time')).toHaveText('00:00');
}

/**
 * Sit → 逐步 Skip 到 Choose → 点 Reading → 等开表。
 * 须等 intentionNod pingpong + CapCut 叠化结束（约数秒）。
 */
export async function chooseReadingAndAwaitFocus(page) {
  await page.locator('#btn-focus').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });

  const skipStep = arrival.getByRole('button', { name: /^Skip$/i });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (await arrival.getByRole('button', { name: /Reading|阅读/i }).isVisible()) {
      break;
    }
    if (await arrival.isVisible() && (await skipStep.isVisible())) {
      await skipStep.click();
      await page.waitForTimeout(200);
      continue;
    }
    await page.waitForTimeout(300);
  }

  await arrival.getByRole('button', { name: /Reading|阅读/i }).click();
  // intentionNod pingpong + CapCut 1s；开表后主按钮变 Rise
  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 45_000
  });
  await expectFocusSessionActive(page);
}
