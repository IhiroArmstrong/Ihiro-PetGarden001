import { expect } from '@playwright/test';

/**
 * 清 focus-tiger.* localStorage 并等待产品壳 Sit 可见。
 * CI `vite preview` 上「每个用例首次导航」常挂到 expect 超时；内部短重试，
 * 避免外层 1.1m 红 + 33s retry 把 visibility job 拖死。
 * @param {import('@playwright/test').Page} page
 * @param {{ path?: string, query?: Record<string, string | number | boolean> }} [opts]
 */
export async function openFreshProductShell(page, opts = {}) {
  const params = new URLSearchParams({ product: '1' });
  for (const [key, value] of Object.entries(opts.query || {})) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const path = opts.path ?? `/?${params.toString()}`;
  // Wipe focus-tiger.* once per browser context (before first paint).
  // Must NOT wipe again on later reload/goto in the same context — helpers such as
  // seedMixedPracticeDaysAndReload set storage then reload; a per-navigation wipe
  // would erase the seed and false-fail heatmap lit asserts (null→lit).
  await page.addInitScript(() => {
    try {
      if (sessionStorage.getItem('__ftE2eStorageGate') === '1') return;
      sessionStorage.setItem('__ftE2eStorageGate', '1');
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('focus-tiger.')) localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  });

  // Static dist server + single local attempt. Do NOT about:blank between
  // retries — that raced with in-flight goto ("interrupted by about:blank").
  const isCi = Boolean(process.env.CI);
  const attempts = isCi ? 2 : 1;
  const gotoMs = isCi ? 40_000 : 45_000;
  const readyMs = isCi ? 35_000 : 30_000;
  const sitMs = isCi ? 15_000 : 10_000;

  let lastErr;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      await page.goto(path, {
        waitUntil: 'domcontentloaded',
        timeout: gotoMs
      });
      await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
        timeout: readyMs
      });
      await expect(page.locator('#btn-focus')).toBeVisible({ timeout: sitMs });
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
 * @param {'honesty'|'breath'|'reminder'|'sound'|'language'} proxy
 */
export async function clickWideMoreProxyOrDirect(page, proxy) {
  const direct = {
    honesty: '#honesty-idle-entry',
    breath: '#micro-ritual-idle-entry',
    reminder: '#reminder-preference-toggle',
    sound: '.ambient-soundscape__fab',
    language: '#language-preference-panel'
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
  if (proxy === 'language') {
    const opened = await page.evaluate(() => {
      const ui = window.__languagePreference;
      if (ui?.openPanel) {
        ui.openPanel();
        return true;
      }
      return false;
    });
    if (opened) return;
    // Narrow drawer path
    const grabber = page.locator('#ft-narrow-options-grabber, [data-proxy="sheet"]');
    if (await grabber.first().isVisible().catch(() => false)) {
      await grabber.first().click();
      await page.locator('#ft-narrow-options-drawer [data-proxy="language"]').click();
      return;
    }
  }
  if (proxy === 'language') {
    throw new Error('language preference UI not reachable');
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
