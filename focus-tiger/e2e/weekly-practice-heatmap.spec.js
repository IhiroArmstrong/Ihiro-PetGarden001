import { test, expect } from '@playwright/test';
import {
  advanceArrivalToCompanionPicker,
  expectFocusSessionActive,
  openFreshProductShell,
  selectCompanionMode
} from './helpers/product-shell.js';

const HEATMAP = '#weekly-practice-heatmap';
const CELLS = `${HEATMAP} .weekly-practice-heatmap__cell`;
const PRACTICE_DAYS_KEY = 'focus-tiger.practice-days.v1';

/**
 * Seed practice-days relative to the browser's local today, then reload.
 * - oldest (today-6): null → lit (legacy unknown)
 * - today-4: 20 → lit
 * - today-2: explicit 0 → dim
 * - today: 15 → lit
 * Gaps filled by getLastNDays → dim
 */
async function seedMixedPracticeDaysAndReload(page) {
  await page.evaluate((storageKey) => {
    const pad = (n) => String(n).padStart(2, '0');
    const keyOf = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const shift = (delta) => {
      const d = new Date();
      d.setDate(d.getDate() + delta);
      return keyOf(d);
    };
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        days: [
          { date: shift(-6), totalMinutes: null },
          { date: shift(-4), totalMinutes: 20 },
          { date: shift(-2), totalMinutes: 0 },
          { date: shift(0), totalMinutes: 15 }
        ]
      })
    );
  }, PRACTICE_DAYS_KEY);
  await page.reload();
  await expect(page.locator('#btn-focus')).toBeVisible({ timeout: 60_000 });
}

test('Idle shows weekly heatmap with 7 cells', async ({ page }) => {
  await openFreshProductShell(page);
  const heatmap = page.locator(HEATMAP);
  await expect(heatmap).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(CELLS)).toHaveCount(7);
});

test('non-Idle (Focusing) hides weekly heatmap', async ({ page }) => {
  await openFreshProductShell(page);
  await expect(page.locator(HEATMAP)).toBeVisible({ timeout: 15_000 });

  await advanceArrivalToCompanionPicker(page);
  await selectCompanionMode(page, /Here & Now|当下同坐/i);
  await expectFocusSessionActive(page);

  await expect(page.locator(HEATMAP)).toBeHidden();
});

test('heatmap lights null and positive minutes; dims true zero days', async ({
  page
}) => {
  await openFreshProductShell(page);
  await seedMixedPracticeDaysAndReload(page);

  const heatmap = page.locator(HEATMAP);
  await expect(heatmap).toBeVisible({ timeout: 15_000 });
  await expect(page.locator(CELLS)).toHaveCount(7);

  const flags = await page.evaluate((sel) => {
    const pad = (n) => String(n).padStart(2, '0');
    const keyOf = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const shift = (delta) => {
      const d = new Date();
      d.setDate(d.getDate() + delta);
      return keyOf(d);
    };
    const byDate = {};
    for (const el of document.querySelectorAll(sel)) {
      byDate[el.dataset.date] = el.dataset.lit;
    }
    return {
      byDate,
      expectLit: [shift(-6), shift(-4), shift(0)],
      expectDim: [shift(-5), shift(-3), shift(-2), shift(-1)]
    };
  }, CELLS);

  for (const date of flags.expectLit) {
    expect(flags.byDate[date], `expected lit for ${date}`).toBe('1');
  }
  for (const date of flags.expectDim) {
    expect(flags.byDate[date], `expected dim for ${date}`).toBe('0');
  }
});
