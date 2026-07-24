import { expect } from '@playwright/test';

/** 清 focus-tiger.* localStorage 并等待产品壳 Sit 可见。 */
export async function openFreshProductShell(page) {
  // Default to wide Idle chrome (≥480). Narrow specs override with setViewportSize after.
  await page.setViewportSize({ width: 1280, height: 720 });
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
 * Wide Idle (≥480)：若 ⋯ 存在且未 hidden，则打开向上菜单。
 * @returns {Promise<boolean>} true = 已打开宽屏更多菜单
 */
export async function openWideMoreMenuIfPresent(page) {
  const canOpen = await page.evaluate(() => {
    const btn = document.getElementById('ft-wide-more-btn');
    return Boolean(btn && !btn.hidden);
  });
  if (!canOpen) return false;
  await page.locator('#ft-wide-more-btn').click({ force: true });
  await expect(page.locator('#ft-wide-more-menu')).toBeVisible({
    timeout: 5_000
  });
  return true;
}

/**
 * 展开 Companion「How shall we sit?」：宽屏走 ⋯ 菜单，窄屏点 hint。
 */
export async function openCompanionHint(page) {
  if (await openWideMoreMenuIfPresent(page)) {
    await page.locator('#ft-wide-more-menu [data-proxy="companion"]').click();
  } else {
    await page.locator('.session-start-dock__hint').evaluate((el) => {
      /** @type {HTMLButtonElement} */ (el).click();
    });
  }
  await expect(page.locator('.session-start-dock__panel')).toBeVisible({
    timeout: 10_000
  });
}

/**
 * 经宽屏 ⋯（若有）打开 Honesty / 呼吸 / 提醒等代理入口。
 * @param {import('@playwright/test').Page} page
 * @param {'honesty'|'breath'|'reminder'|'sound'} proxy
 */
export async function clickWideMoreProxyOrDirect(page, proxy) {
  const direct = {
    honesty: '#honesty-idle-entry',
    breath: '#micro-ritual-idle-entry',
    reminder: '#reminder-preference-toggle',
    sound: '.ambient-soundscape__fab'
  }[proxy];
  if (await openWideMoreMenuIfPresent(page)) {
    await page.locator(`#ft-wide-more-menu [data-proxy="${proxy}"]`).click();
    return;
  }
  if (proxy === 'reminder') {
    const opened = await page.evaluate(() => {
      const ui = window.__inAppReminder?.settings;
      if (ui?.openPanel) {
        ui.openPanel();
        return true;
      }
      return false;
    });
    if (opened) return;
  }
  await page.locator(direct).evaluate((el) => {
    el.style.pointerEvents = 'auto';
    /** @type {HTMLElement} */ (el).click();
  });
}

/**
 * Sit → Notice 点选 → Breath → Choose → 鞠躬后自动 Focusing。
 * （Arrival 已无 Skip；快速开表用 `quickStartFocus`。）
 */
export async function advanceArrivalToCompanionPicker(page) {
  await chooseReadingAndAwaitFocus(page);
}

/**
 * ⚡ Quick Start：跳过 Arrival（或先 Sit 再跳过），立刻 Focusing。
 * @param {import('@playwright/test').Page} page
 */
export async function quickStartFocus(page) {
  const quick = page.locator('#quick-start-focus');
  await expect(quick).toBeVisible({ timeout: 15_000 });
  await quick.click();
  await expect(page.locator('#arrival-practice')).toBeHidden({ timeout: 15_000 });
}

/** @deprecated 使用 `quickStartFocus`；Arrival 开着时点 ⚡ 等价旧 Skip — begin */
export async function skipArrivalBegin(page) {
  const arrival = page.locator('#arrival-practice');
  if (!(await arrival.isVisible().catch(() => false))) {
    await page.locator('#btn-focus').click();
    await expect(arrival).toBeVisible({ timeout: 15_000 });
  }
  await quickStartFocus(page);
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
 * Sit → Notice → Breath → Choose Reading → 等开表（鞠躬后自动 Focusing）。
 */
export async function chooseReadingAndAwaitFocus(page) {
  await page.locator('#btn-focus').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });

  const noticePick = arrival.getByRole('button', {
    name: /Not Sure|不确定|Calm|平静/i
  });
  await expect(noticePick.first()).toBeVisible({ timeout: 8_000 });
  await noticePick.first().click();

  const reading = arrival.getByRole('button', { name: /Reading|阅读/i });
  await expect(reading).toBeVisible({ timeout: 20_000 });
  await reading.click();

  await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
    timeout: 45_000
  });
  await expectFocusSessionActive(page);
}
