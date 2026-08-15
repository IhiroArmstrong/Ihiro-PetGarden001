import { test, expect } from '@playwright/test';
import {
  openFreshProductShell,
  quickStartFocus,
  riseSkipReflectionToIdle
} from './helpers/product-shell.js';

/**
 * Hint 收窄契约（2026-08-04）：
 * - 「?」→ 只出产品简介卡，绝不喷本页其它 tip / More tips 芯片
 * - 薄荷绿音符点：只有**选曲**才清；Rise / 会话结束不得清
 *
 * @see docs/ONBOARDING_HINTS.md、docs/TEST_TRACKER.md
 */

/** @param {import('@playwright/test').Page} page */
function purposeCardVisible(page) {
  return page.locator('#onboarding-app-purpose:not([hidden])');
}

/** @param {import('@playwright/test').Page} page */
function remedyTipCount(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('ft-onboarding-hint-bubble[data-remedy="1"]')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }).length
  );
}

test.describe('wide ? purpose only', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('click ? shows purpose card and no remedy tip spray', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await expect(page.locator('#onboarding-hint-help')).toBeVisible({
      timeout: 8_000
    });

    await page.locator('#onboarding-hint-help').click();

    await expect(purposeCardVisible(page)).toBeVisible({ timeout: 8_000 });
    expect(await remedyTipCount(page)).toBe(0);
    await expect(page.locator('#ft-hint-catalog-chip')).toBeHidden();
    await expect(
      page.locator('ft-onboarding-hint-bubble[data-hint-id="weekly-heatmap"]')
    ).toHaveCount(0);
    await expect(
      page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"]')
    ).toHaveCount(0);
  });

  test('purpose Privacy opens sheet; Back returns to purpose', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await page.locator('#onboarding-hint-help').click();
    await expect(purposeCardVisible(page)).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('.onboarding-app-purpose__body')).toContainText(
      /no ads|No pressure/i
    );
    await expect(
      page.locator('[data-testid="onboarding-purpose-wellness"]')
    ).toBeVisible();
    await expect(
      page.locator('.onboarding-app-purpose__wellness-title')
    ).toContainText(/Not therapy or medical care/i);
    await expect(
      page.locator('.onboarding-app-purpose__wellness-body')
    ).toContainText(/not a medical device|counselor|therapist/i);
    await expect(
      page.locator('.onboarding-app-purpose__wellness-body')
    ).toContainText(/diagnose, treat, cure, or prevent/i);
    await page.locator('.onboarding-app-purpose__privacy').click();
    await expect(
      page.locator('#onboarding-privacy-sheet:not([hidden])')
    ).toBeVisible({ timeout: 5_000 });
    await expect(purposeCardVisible(page)).toBeHidden();
    await expect(page.locator('#onboarding-privacy-sheet')).toContainText(
      /on your device|do not sell/i
    );
    await expect(
      page.locator('[data-testid="privacy-wellness-link"]')
    ).toBeVisible();
    await page.locator('[data-testid="privacy-wellness-link"]').click();
    await expect(purposeCardVisible(page)).toBeVisible({ timeout: 5_000 });
    await expect(
      page.locator('[data-testid="onboarding-purpose-wellness"]')
    ).toBeVisible();
    await expect(
      page.locator('#onboarding-privacy-sheet:not([hidden])')
    ).toHaveCount(0);
    await page.locator('.onboarding-app-purpose__privacy').click();
    await page.locator('.onboarding-privacy-sheet__back').click();
    await expect(purposeCardVisible(page)).toBeVisible({ timeout: 5_000 });
    await expect(
      page.locator('#onboarding-privacy-sheet:not([hidden])')
    ).toHaveCount(0);
  });
});

test.describe('wellness first-run card', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('Idle does not auto-open wellness first card; ? still has the notice', async ({
    page
  }) => {
    await openFreshProductShell(page, { query: { flowerWelcome: 0 } });
    await expect(
      page.locator('#onboarding-wellness-first:not([hidden])')
    ).toHaveCount(0);
    await page.locator('#onboarding-hint-help').click();
    await expect(purposeCardVisible(page)).toBeVisible({ timeout: 8_000 });
    await expect(
      page.locator('[data-testid="onboarding-purpose-wellness"]')
    ).toBeVisible();
    await expect(
      page.locator('.onboarding-app-purpose__wellness-title')
    ).toContainText(/Not therapy or medical care/i);
    await expect(
      page.locator('#onboarding-wellness-first:not([hidden])')
    ).toHaveCount(0);
  });

  test('?wellnessFirst=1 shows the Got it card once', async ({ page }) => {
    await openFreshProductShell(page, {
      query: { wellnessFirst: 1, flowerWelcome: 0 }
    });
    const first = page.locator('#onboarding-wellness-first:not([hidden])');
    await expect(first).toBeVisible({ timeout: 15_000 });
    await expect(first.locator('.onboarding-wellness-first__title')).toContainText(
      /Not therapy or medical care/i
    );
    await expect(first.locator('.onboarding-wellness-first__body')).toContainText(
      /diagnose, treat, cure, or prevent/i
    );
    await page.locator('[data-testid="onboarding-wellness-first-got-it"]').click();
    await expect(
      page.locator('#onboarding-wellness-first:not([hidden])')
    ).toHaveCount(0);
  });
});

test.describe('narrow ? purpose only', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('375 click ? shows purpose only (no Sit tip / chip)', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await page.locator('#ft-narrow-help-btn').click();

    await expect(purposeCardVisible(page)).toBeVisible({ timeout: 8_000 });
    expect(await remedyTipCount(page)).toBe(0);
    await expect(
      page.locator('[data-testid="onboarding-purpose-wellness"]')
    ).toBeVisible();
    await expect(
      page.locator('ft-onboarding-hint-bubble[data-hint-id="sit-button"]')
    ).toHaveCount(0);
    await expect(page.locator('#ft-hint-catalog-chip')).toBeHidden();
  });

  test('375 Focusing: ? still purpose only (no HUD tip pile)', async ({
    page
  }) => {
    await openFreshProductShell(page);
    await quickStartFocus(page);
    await expect(page.locator('#hud-state')).toContainText(/Focusing|专注/i, {
      timeout: 15_000
    });

    await page.locator('#ft-narrow-help-btn').click();

    await expect(purposeCardVisible(page)).toBeVisible({ timeout: 8_000 });
    expect(await remedyTipCount(page)).toBe(0);
    for (const banned of [
      'rise-button',
      'focus-hud-ring',
      'focus-hud-progress',
      'focus-hud-streak',
      'ambient-soundscape',
      'weekly-heatmap'
    ]) {
      await expect(
        page.locator(`ft-onboarding-hint-bubble[data-hint-id="${banned}"]`)
      ).toHaveCount(0);
    }
  });
});

test.describe('mint note dot lifecycle', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('unread shows the mint pulse and Rise must not clear it', async ({
    page
  }) => {
    await openFreshProductShell(page);

    const mintNow = () =>
      page.evaluate(() =>
        Boolean(
          document
            .querySelector('.ambient-soundscape__mute')
            ?.classList.contains('has-hint-mint')
        )
      );

    await expect.poll(mintNow, { timeout: 8_000 }).toBe(true);

    await quickStartFocus(page);
    await expect(page.locator('#hud-state')).toContainText(/Focusing|专注/i, {
      timeout: 15_000
    });
    await riseSkipReflectionToIdle(page);

    await expect.poll(mintNow, { timeout: 8_000 }).toBe(true);
  });
});
