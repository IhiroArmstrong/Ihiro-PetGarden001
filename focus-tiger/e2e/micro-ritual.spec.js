import { test, expect } from '@playwright/test';
import { DAILY_COMPLETION_STORAGE_KEY } from '../src/core/DailyCompletionStore.js';
import { PRACTICE_DAYS_STORAGE_KEY } from '../src/core/PracticeDaysStore.js';
import {
  clickBreathPracticeEntry,
  clickWideMoreProxyOrDirect,
  openFreshProductShell
} from './helpers/product-shell.js';

/**
 * Breath practice（原「一分钟呼吸」）DOM 主路径。
 * 入口 = 首页左球；用 `?microRitualMs=` 缩短墙钟；须先点时长 chip。
 */
async function openMicroRitualPicker(page) {
  await clickBreathPracticeEntry(page);
  const ritual = page.locator('#micro-ritual');
  await expect(ritual).toBeVisible({ timeout: 5_000 });
  await expect(ritual).toHaveAttribute('data-micro-ritual-phase', 'pick');
  return ritual;
}

async function pickMicroRitualMinutes(page, minutes = 1) {
  const ritual = page.locator('#micro-ritual');
  await ritual.locator(`[data-micro-ritual-minutes="${minutes}"]`).click();
  await expect(ritual).toHaveAttribute('data-micro-ritual-phase', 'breath');
}

test('micro ritual: entry → pick → breath → complete → record + toast + reflection', async ({
  page
}) => {
  const retentionLogs = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[RetentionTelemetry]') && text.includes('micro_ritual_complete')) {
      retentionLogs.push(text);
    }
  });

  await openFreshProductShell(page, {
    path: '/?product=1&microRitualMs=2800'
  });

  const ritual = await openMicroRitualPicker(page);
  await pickMicroRitualMinutes(page, 1);

  await expect(
    ritual.locator('[data-micro-ritual-breath-phase]')
  ).toContainText(/Inhale|Exhale|吸气|呼气/i);

  // Sit 进行中须隐藏（与 Arrival 同契约；窄屏 focusing 布局不得只禁用仍露出）
  await expect(page.locator('#btn-focus')).toBeHidden();

  // HUD 须直播墙钟（算专注内容；仍不启 FocusSession）
  // floor 秒：须等到 ≥1s 才离开 00:00
  await expect(page.locator('#hud-state')).toContainText(/Focusing|专注中/i);
  await expect
    .poll(async () => page.locator('#hud-time').textContent(), {
      timeout: 4_000
    })
    .toMatch(/^00:0[1-9]$|^00:[1-5]\d$/);

  await expect
    .poll(async () => page.locator('#mindful-acknowledge-toast').textContent(), {
      timeout: 10_000
    })
    .toMatch(/Today counts, too|今天，也算数/i);

  await expect(page.locator('#mindful-acknowledge-toast')).toHaveAttribute(
    'data-placement',
    'center'
  );
  await expect
    .poll(async () => {
      return page.locator('#mindful-acknowledge-toast').evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          opacity: Number(s.opacity),
          top: s.top,
          zIndex: Number(s.zIndex)
        };
      });
    }, { timeout: 3_000 })
    .toMatchObject({
      opacity: 1
    });
  const toastBox = await page.locator('#mindful-acknowledge-toast').boundingBox();
  expect(toastBox).toBeTruthy();
  // 中置偏低：胸口/蒲团一带（避开脸；非底栏夹缝）
  expect(toastBox.y).toBeGreaterThan(320);
  expect(toastBox.y + toastBox.height).toBeLessThan(700);

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

  // 浅接 Reflection（不等完成动画播完）
  await expect(page.locator('#tiger-reflection-moment')).toBeVisible({
    timeout: 8_000
  });
});

test('375 micro ritual: Sit hidden while breath + FocusHUD live', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page, {
    path: '/?product=1&microRitualMs=60000'
  });
  await expect(page.locator('#ft-narrow-home-quickstart')).toBeVisible({
    timeout: 15_000
  });
  // Drawer must not list Breath (home ball only).
  await page.locator('.ft-narrow-grabber').click();
  await expect(page.locator('#ft-narrow-options-drawer')).toHaveAttribute(
    'aria-hidden',
    'false'
  );
  await expect(
    page.locator('.ft-narrow-sheet__item[data-proxy="breath"]')
  ).toHaveCount(0);
  await page.locator('body').click({ position: { x: 8, y: 8 } });

  await clickBreathPracticeEntry(page);

  const ritual = page.locator('#micro-ritual');
  await expect(ritual).toBeVisible({ timeout: 5_000 });
  await expect(ritual).toHaveAttribute('data-micro-ritual-phase', 'pick');
  await ritual.locator('[data-micro-ritual-minutes="1"]').click();
  await expect(ritual).toHaveAttribute('data-micro-ritual-phase', 'breath');
  // 图5 回归：窄屏 focusing 布局不得仍露出 Sit；HUD 仍直播
  await expect(page.locator('#btn-focus')).toBeHidden();
  await expect(page.locator('#session-start-dock')).toBeHidden();
  await expect(page.locator('#hud-state')).toContainText(/Focusing|专注中/i);
  await expect(page.locator('#focus-hud')).toBeVisible();
  // Sit chrome is gone — sit-targeting autos must not orphan over empty space.
  await expect(
    page.locator('ft-onboarding-hint-bubble[data-hint-id="idle-after-session"]')
  ).toHaveCount(0);
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const b = document.querySelector(
          'ft-onboarding-hint-bubble[data-hint-id="sit-button"]'
        );
        if (!b || b.open === false) return 'gone';
        const r = b.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? 'visible' : 'gone';
      });
    })
    .toBe('gone');
  await expect(
    page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"]')
  ).toHaveCount(0);
  // Defense: even if something tries to paint idle-after-session, no visible Sit
  // anchor → tip must not stay open over empty canvas.
  await page.evaluate(() => {
    window.__onboardingHints?.maybeShowAuto?.('idle-after-session');
  });
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const b = document.querySelector(
          'ft-onboarding-hint-bubble[data-hint-id="idle-after-session"]'
        );
        if (!b || b.open === false) return 'gone';
        const r = b.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? 'visible' : 'gone';
      });
    })
    .toBe('gone');
  const orphanSitTip = await page.evaluate(() => {
    const bubbles = [
      ...document.querySelectorAll('ft-onboarding-hint-bubble')
    ].filter((b) => b.open !== false);
    return bubbles.map((b) => ({
      id: b.dataset.hintId,
      text: b.message || b.textContent?.trim() || ''
    }));
  });
  expect(
    orphanSitTip.some((b) =>
      /Sit again whenever you like|想再坐的时候/i.test(b.text)
    )
  ).toBe(false);
});

test('micro ritual: quiet leave does not record', async ({ page }) => {
  await openFreshProductShell(page, {
    path: '/?product=1&microRitualMs=60000'
  });

  await openMicroRitualPicker(page);

  const ritual = page.locator('#micro-ritual');
  await expect(ritual).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('#btn-focus')).toBeHidden();
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
  await expect(page.locator('#ft-wide-more-btn')).toBeVisible();
  await expect(page.locator('#ft-wide-home-quickstart')).toBeVisible();
  await expect(page.locator('#btn-focus')).toBeVisible();
  await expect(page.locator('#btn-focus')).toBeEnabled();
  await expect(page.locator('#tiger-reflection-moment')).toHaveCount(0);
});

test('micro ritual ambient is ephemeral: Focus presence still works after leave', async ({
  page
}) => {
  await openFreshProductShell(page, {
    path: '/?product=1&microRitualMs=60000'
  });

  await openMicroRitualPicker(page);
  await pickMicroRitualMinutes(page, 1);

  const duringRitual = await page.evaluate(() => {
    const a = window.__ambientSoundscape;
    return {
      preferred: a?.getPreferredTrackId?.(),
      sessionBoost: a?.getPresenceBoost?.(25) ?? null,
      pref: localStorage.getItem('focus-tiger.ambient-pref.v1')
    };
  });
  // Ephemeral play must not arm Focus presence session
  expect(duringRitual.sessionBoost).toBe(0);

  await page.locator('#micro-ritual [data-micro-ritual-leave]').click();
  await expect(page.locator('#micro-ritual')).toBeHidden({ timeout: 5_000 });

  const afterLeave = await page.evaluate(async () => {
    const a = window.__ambientSoundscape;
    const pref = localStorage.getItem('focus-tiger.ambient-pref.v1');
    const preferred = a.getPreferredTrackId();
    a.startSession();
    await a.setTrack('singing-bowl');
    return {
      pref,
      preferred,
      audible: a.isAudiblePlaying(),
      boost: a.getPresenceBoost(25),
      wants: a.wantsEnabled()
    };
  });

  expect(afterLeave.preferred).toBe(duringRitual.preferred);
  expect(afterLeave.pref).toBe(duringRitual.pref);
  expect(afterLeave.audible).toBe(true);
  expect(afterLeave.boost).toBeGreaterThan(0);
  expect(afterLeave.wants).toBe(true);
});

test('bridge CTA hides dock entries over Yes/No; No restores entries', async ({
  page
}) => {
  await openFreshProductShell(page);

  const microEntry = page.locator('#micro-ritual-idle-entry');
  const honestyEntry = page.locator('#honesty-idle-entry');
  await expect(page.locator('#ft-wide-more-btn')).toBeVisible({ timeout: 15_000 });
  await expect(microEntry).toBeAttached();
  await expect(honestyEntry).toBeAttached();

  // Injects visible bridge (not real Honesty 补登). Requires `__honestyBridge` in
  // production builds too — CI uses vite preview where DEV hooks were missing.
  const bridgeReady = await page.evaluate(() => {
    const bridge = window.__honestyBridge;
    if (!bridge?.onHonestyCheckInComplete) return false;
    bridge.onHonestyCheckInComplete();
    return bridge.isVisible() === true;
  });
  expect(
    bridgeReady,
    'window.__honestyBridge missing or inject failed (CI preview must expose hook)'
  ).toBe(true);

  const bridge = page.locator('#honesty-bridge-cta');
  await expect(bridge).toBeVisible({ timeout: 5_000 });
  await expect(bridge).toContainText(
    /Want to sit for a bit now too|要不要现在也坐一会儿/
  );
  // 回归：Honesty / 一分钟呼吸均不得叠在 Yes/No 上；⋯ 亦收起
  await expect(microEntry).toBeHidden();
  await expect(honestyEntry).toBeHidden();
  await expect(page.locator('#ft-wide-more-btn')).toBeHidden();
  await expect(page.locator('#session-start-dock')).toHaveClass(
    /is-honesty-bridge-active/
  );

  await bridge.getByRole('button', { name: /^(No|先不用)$/i }).click();
  await expect(bridge).toBeHidden({ timeout: 5_000 });
  await expect(page.locator('#ft-wide-more-btn')).toBeVisible({ timeout: 10_000 });
  await expect(microEntry).toBeAttached();
  await expect(honestyEntry).toBeAttached();
});

test('375 bridge: ActionBar time stays; tip click does not dismiss Yes/No', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await expect(page.locator('.ft-narrow-action-bar')).toBeVisible({
    timeout: 15_000
  });

  const bridgeReady = await page.evaluate(() => {
    const bridge = window.__honestyBridge;
    if (!bridge?.onHonestyCheckInComplete) return false;
    bridge.onHonestyCheckInComplete();
    return bridge.isVisible() === true;
  });
  expect(
    bridgeReady,
    'window.__honestyBridge missing or inject failed (CI preview must expose hook)'
  ).toBe(true);

  const bridge = page.locator('#honesty-bridge-cta');
  await expect(bridge).toBeVisible({ timeout: 5_000 });
  // 图4：桥接时 ActionBar 时间仍可见（勿 suppress）
  await expect(page.locator('.ft-narrow-action-bar')).toBeVisible();
  await expect(page.locator('.ft-narrow-action-bar__time')).toBeVisible();
  // 窄屏三球 / grabber 不得盖住 Yes/No（z30 高于桥接 z18）
  await expect(page.locator('#ft-narrow-home-ctas')).toBeHidden();
  await expect(page.locator('.ft-narrow-grabber')).toBeHidden();
  await expect(page.locator('#ft-narrow-home-honesty')).toBeHidden();
  // 不自动出 honesty-bridge tip
  await expect(
    page.locator('ft-onboarding-hint-bubble[data-hint-id="honesty-bridge"]')
  ).toHaveCount(0);

  // 点「?」只出产品简介，不得喷 tip，也不得关掉 Yes/No
  await page.locator('#ft-narrow-help-btn').click();
  await expect(page.locator('#onboarding-app-purpose:not([hidden])')).toBeVisible({
    timeout: 8_000
  });
  await expect(
    page.locator('ft-onboarding-hint-bubble[data-hint-id="honesty-bridge"]')
  ).toHaveCount(0);
  await expect(bridge).toBeVisible();
  await expect(bridge.getByRole('button', { name: /^(Yes|好啊)$/i })).toBeVisible();
});

test('Honesty Check-in click hides entry until duration panel open', async ({
  page
}) => {
  await openFreshProductShell(page);

  const honestyEntry = page.locator('#honesty-idle-entry');
  await expect(honestyEntry).toBeAttached({ timeout: 15_000 });
  await clickWideMoreProxyOrDirect(page, 'honesty');

  await expect(page.locator('#honesty-check-in')).toBeVisible({ timeout: 5_000 });
  await expect(honestyEntry).toBeHidden();
});

test('375 Honesty panel: narrow home Honesty ball hidden', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page);
  await expect(page.locator('#ft-narrow-home-honesty')).toBeVisible({
    timeout: 15_000
  });
  await page.locator('#ft-narrow-home-honesty').click();
  await expect(page.locator('#honesty-check-in')).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('#ft-narrow-home-honesty')).toBeHidden();
});

/**
 * micro-ritual-sit-unavailable (narrow): during Breath practice,
 * home Sit ball must not remain clickable/visible (shell Focusing hides home CTAs;
 * legacy #btn-focus stays disabled).
 */
test('375 micro ritual: home Sit unavailable while breath runs', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openFreshProductShell(page, {
    path: '/?product=1&microRitualMs=60000'
  });
  await expect(page.locator('#ft-narrow-idle-shell')).toBeVisible({
    timeout: 15_000
  });
  await expect(page.locator('#ft-narrow-home-sit')).toBeVisible();
  await expect(page.locator('#ft-narrow-home-quickstart')).toBeVisible();

  await clickBreathPracticeEntry(page);

  const ritual = page.locator('#micro-ritual');
  await expect(ritual).toBeVisible({ timeout: 5_000 });
  await expect(ritual).toHaveAttribute('data-micro-ritual-phase', 'pick');
  await ritual.locator('[data-micro-ritual-minutes="1"]').click();
  await expect(ritual).toHaveAttribute('data-micro-ritual-phase', 'breath');
  await expect(
    ritual.locator('[data-micro-ritual-breath-phase]')
  ).toContainText(/Inhale|Exhale|吸气|呼气/i);

  await expect(page.locator('#ft-narrow-home-sit')).toBeHidden();
  await expect(page.locator('#ft-narrow-home-ctas')).toBeHidden();
  await expect(page.locator('#btn-focus')).toBeDisabled();
  // Legacy dock Sit must not resurface via ft-narrow-focusing CSS (O⑤)
  await expect(page.locator('#btn-focus')).not.toBeInViewport();
  await expect(page.locator('body')).toHaveClass(/ft-narrow-hide-sit-dock/);
});
