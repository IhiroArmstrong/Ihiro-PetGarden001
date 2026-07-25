import { test, expect } from '@playwright/test';
import {
  advanceArrivalToCompanionPicker,
  chooseReadingAndAwaitFocus,
  chooseReadingAndOpenCompanion,
  expectFocusSessionActive,
  expectFocusSessionInactive,
  openCompanionHint,
  openFreshProductShell,
  riseSkipReflectionToIdle,
  selectCompanionMode,
  skipArrivalBegin
} from './helpers/product-shell.js';

/**
 * SCENARIO_TESTS 场景 A / I / K · 产品壳 DOM 主路径（到 Companion 开表为止）。
 * 不跑到 1 分钟达标 / Celebrating；序列观感仍人工。
 */

test('scenario I: hint opens companion panel when gate not ready (no silent no-op)', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  await expect(page.locator('#arrival-practice')).toBeHidden();
});

test('companion panel dismisses on outside click', async ({ page }) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  const panel = page.locator('.session-start-dock__panel');
  // Empty upper-left canvas (away from dock / ActionBar)
  await page.mouse.click(28, 140);
  await expect(panel).toBeHidden({ timeout: 3_000 });
});

test('scenario I2: Here & Now before Arrival gate opens Arrival (HUD stays idle)', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
  await expectFocusSessionInactive(page);
});

test('Arrival Notice dismisses on outside click (back to Idle)', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#btn-focus').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await expect(
    arrival.getByRole('button', { name: /Calm|平静|Not Sure|不确定/i }).first()
  ).toBeVisible({ timeout: 8_000 });
  await page.mouse.click(28, 140);
  await expect(arrival).toBeHidden({ timeout: 5_000 });
  await expectFocusSessionInactive(page);
  await expect(page.locator('#btn-focus')).toBeVisible();
});

test('Arrival Notice: tip click dismisses tip only, not Arrival', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#btn-focus').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await expect(
    arrival.getByRole('button', { name: /Calm|平静|Not Sure|不确定/i }).first()
  ).toBeVisible({ timeout: 8_000 });
  // Inject open tip chrome (auto Arrival tips suppressed); pointerdown must not cancel Arrival
  await page.evaluate(() => {
    const tip = document.createElement('ft-onboarding-hint-bubble');
    tip.id = 'ft-e2e-arrival-tip-guard';
    tip.setAttribute('open', '');
    tip.message = 'A tap is enough — or skip ahead.';
    tip.style.cssText =
      'position:fixed;left:48px;top:200px;width:140px;height:44px;z-index:10000;';
    document.body.appendChild(tip);
  });
  // Dispatch pointerdown (Arrival listens on capture); tip click alone is too late
  await page.evaluate(() => {
    const tip = document.getElementById('ft-e2e-arrival-tip-guard');
    tip.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, cancelable: true })
    );
  });
  await expect(arrival).toBeVisible();
  await expect(
    arrival.getByRole('button', { name: /Calm|平静|Not Sure|不确定/i }).first()
  ).toBeVisible();
  // Blank outside still cancels (regression lock)
  await page.mouse.click(28, 140);
  await expect(arrival).toBeHidden({ timeout: 5_000 });
});

test('Arrival Choose dismisses on outside click (back to Idle)', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#btn-focus').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await arrival
    .getByRole('button', { name: /Not Sure|不确定|Calm|平静/i })
    .first()
    .click();
  const reading = arrival.getByRole('button', { name: /Reading|阅读/i });
  await expect(reading).toBeVisible({ timeout: 20_000 });
  await page.mouse.click(28, 140);
  await expect(arrival).toBeHidden({ timeout: 5_000 });
  await expectFocusSessionInactive(page);
});

test('Arrival open: Sit hidden so Notice icons are not covered; Quick Start stays', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.locator('#btn-focus').click();
  const arrival = page.locator('#arrival-practice');
  await expect(arrival).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('#btn-focus')).toBeHidden();
  await expect(page.locator('#quick-start-focus')).toBeVisible();
  await expect(
    arrival.getByRole('button', { name: /Calm|平静|Not Sure|不确定/i }).first()
  ).toBeVisible({ timeout: 8_000 });
});

test('scenario A: Arrival Choose → Companion → Here & Now starts timer', async ({
  page
}) => {
  await openFreshProductShell(page);
  await advanceArrivalToCompanionPicker(page);
  await expectFocusSessionActive(page);
});

/**
 * L249：Choose Reading 后 Companion 仍开着 → 点 Here & Now → Focusing，无 Notice。
 */
test('scenario A4: after Choose, Here & Now starts focus (no Arrival Notice)', async ({
  page
}) => {
  await openFreshProductShell(page);
  await chooseReadingAndOpenCompanion(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expect(page.locator('#arrival-practice')).toBeHidden({
    timeout: 5_000
  });
  await expectFocusSessionActive(page);
});

/**
 * 图2 回归：375 Choose 鞠躬后须 stage Companion（三选一在视口内），
 * 尚未 Focusing；点选后才见 FocusHUD。禁止屏外「假死」Calm。
 */
test('375 Choose bow: Companion staged in viewport then Here & Now focuses', async ({
  page
}) => {
  await openFreshProductShell(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('.ft-narrow-grabber')).toBeVisible({
    timeout: 15_000
  });
  await page.locator('.ft-narrow-grabber').click();
  await page.locator('.ft-narrow-sheet__item.is-primary').click();

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

  const panel = page.locator('.session-start-dock__panel');
  await expect(panel).toBeVisible({ timeout: 45_000 });
  await expect(panel).toBeInViewport();
  await expect(page.locator('#hud-state')).toContainText(
    /Calm|Idle|Asleep|沉静|空闲|沉睡/i
  );
  await expectFocusSessionInactive(page);

  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expectFocusSessionActive(page);
  await expect(page.locator('#focus-hud')).toBeVisible();
  await expect(page.locator('#hud-state')).toContainText(/Focusing|专注/i);
});

test('scenario A4b: after Choose, Flow State starts focus (no Arrival Notice)', async ({
  page
}) => {
  await openFreshProductShell(page);
  await chooseReadingAndOpenCompanion(page);
  await selectCompanionMode(page, /Flow State|心流/i);
  await expect(page.locator('#arrival-practice')).toBeHidden({
    timeout: 5_000
  });
  await expectFocusSessionActive(page);
});

/**
 * Scenario J / L249 回流：Arrival→Focus→Rise 后，再点 Here & Now 须立刻 Focusing（不得再 Notice）。
 */
test('scenario J: after Rise, Here & Now starts focus without Notice', async ({
  page
}) => {
  await openFreshProductShell(page);
  await chooseReadingAndAwaitFocus(page);
  await riseSkipReflectionToIdle(page);

  await openCompanionHint(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expect(page.locator('#arrival-practice')).toBeHidden({
    timeout: 5_000
  });
  await expectFocusSessionActive(page);
});

test('scenario A2: preselect Flow → Quick Start starts timer', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  await selectCompanionMode(page, /Flow State|心流/i);
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
  await skipArrivalBegin(page);
  await expectFocusSessionActive(page);
});

test('scenario A3: preselect Here & Now → Quick Start starts timer', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expect(page.locator('#arrival-practice')).toBeVisible({
    timeout: 15_000
  });
  await skipArrivalBegin(page);
  await expectFocusSessionActive(page);
});

test('scenario K: Offline Space starts focus without Arrival', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openCompanionHint(page);
  await selectCompanionMode(page, /Offline Space|离线空间|Offline/i);
  await expect(page.locator('#arrival-practice')).toBeHidden({
    timeout: 5_000
  });
  await expectFocusSessionActive(page);
});
