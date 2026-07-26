import { expect } from '@playwright/test';

/**
 * 清 focus-tiger.* localStorage 并等待产品壳 Sit 可见。
 * CI `vite preview` 上「每个用例首次导航」常挂到 expect 超时；内部短重试，
 * 避免外层 1.1m 红 + 33s retry 把 visibility job 拖死。
 * @param {import('@playwright/test').Page} page
 * @param {{ path?: string }} [opts]
 */
export async function openFreshProductShell(page, opts = {}) {
  const path = opts.path ?? '/?product=1';
  // Wipe before every document start (incl. first paint) — avoids CI double-navigation.
  await page.addInitScript(() => {
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('focus-tiger.')) localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  });

  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // domcontentloaded：避免 Vite 产品壳重资源挂住 `load`
      await page.goto(path, {
        waitUntil: 'domcontentloaded',
        timeout: 45_000
      });
      await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 20_000 });
      return;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

/**
 * 若宽屏 ⋯ 可见则打开 More 菜单。
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<boolean>}
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
 * 经宽屏 ⋯（若有）打开 Honesty / 呼吸 / 提醒等代理入口；否则点 dock 直钮。
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
 * 展开 Companion「How shall we sit?」：宽屏走 ⋯ 菜单，窄屏点 hint。
 * @param {import('@playwright/test').Page} page
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
 * Sit → Notice 点选 → Breath → Choose → 鞠躬后 Companion → Here & Now 开表。
 * （Arrival 已无 Skip；快速开表用 `quickStartFocus`。）
 */
export async function advanceArrivalToCompanionPicker(page) {
  await chooseReadingAndAwaitFocus(page);
}

/**
 * Sit → Notice → Breath → Choose Reading → 鞠躬后 Companion 面板可见（尚未 Focusing）。
 */
export async function chooseReadingAndOpenCompanion(page) {
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

  await expect(page.locator('.session-start-dock__panel')).toBeVisible({
    timeout: 45_000
  });
  await expectFocusSessionInactive(page);
}

/**
 * Sit → Notice → Breath → Choose Reading → Companion 点 Here & Now → Focusing。
 */
export async function chooseReadingAndAwaitFocus(page) {
  await chooseReadingAndOpenCompanion(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expectFocusSessionActive(page);
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
 * Focusing 中点 Rise → 等 Reflection → Skip all → 回到 Idle chrome。
 */
export async function riseSkipReflectionToIdle(page) {
  await page.locator('#btn-focus').click();
  const reflection = page.locator('#tiger-reflection-moment');
  await expect(reflection).toBeVisible({ timeout: 15_000 });
  await reflection.getByRole('button', { name: /Skip all|全部跳过/i }).click();
  await expect(reflection).toBeHidden({ timeout: 10_000 });
  await expectFocusSessionInactive(page);
}

/**
 * Sit → Notice → Breath → Choose「自己写」空 Enter（chose:false）
 * → 门闩就绪并展开 Companion（不自动开表）。
 */
export async function advanceArrivalToCompanionPanel(page) {
  await page.locator('#btn-focus').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });

  const noticePick = arrival.getByRole('button', {
    name: /Not Sure|不确定|Calm|平静/i
  });
  await expect(noticePick.first()).toBeVisible({ timeout: 8_000 });
  await noticePick.first().click();

  const writeOwn = arrival.getByRole('button', {
    name: /Write your own|自己写/i
  });
  await expect(writeOwn).toBeVisible({ timeout: 20_000 });
  await writeOwn.click();

  const intention = arrival.locator('#arrival-choose-typed-input');
  await expect(intention).toBeVisible({ timeout: 5_000 });
  await expect(arrival.locator('#arrival-choose-typed-confirm')).toBeVisible();
  await expect(arrival.locator('#arrival-choose-typed-hint')).toContainText(
    /Tap → or press Enter|点右箭头，或按回车/
  );
  await intention.focus();
  await intention.press('Enter');

  await expect(arrival).toBeHidden({ timeout: 15_000 });
  await expect(page.locator('.session-start-dock__panel')).toBeVisible({
    timeout: 15_000
  });
  await expectFocusSessionInactive(page);
}
