/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * Memorial Seal (Mustard Seed · Sumeru) — product-path ritual card after score unlock.
 * Locks directory-driven copy for all three verse cases via debug API + DOM snapshot.
 */

test.describe('Mustard Seed memorial seal', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  const cases = [
    {
      caseId: 'mustard-seed-sumeru',
      poemZh: '大鵬展翅九萬里',
      poemEn: 'A roc spreads its wings for ninety thousand miles',
      attribution: '樂五齋詩稿'
    },
    {
      caseId: 'hero-not-pond',
      poemZh: '山海奇雲風幡舞',
      poemEn: 'Strange clouds over mountains and seas',
      attribution: '樂五齋七言歌行'
    },
    {
      caseId: 'no-trace-might',
      poemZh: '乾坤縱橫九萬里',
      poemEn: 'Heaven and earth span ninety thousand miles',
      attribution: '樂五齋詩稿'
    }
  ];

  test('three verse cases render expected copy from directory', async ({ page }) => {
    await openFreshProductShell(page);

    await expect
      .poll(async () => page.evaluate(() => Boolean(window.__mustardSeedSeal?.open)), {
        timeout: 15_000
      })
      .toBe(true);

    for (const entry of cases) {
      await page.evaluate((id) => {
        window.__mustardSeedSeal.clear();
        window.__mustardSeedSeal.open({ mode: 'force', caseId: id });
      }, entry.caseId);

      const card = page.locator('#mustard-seed-seal-card');
      await expect(card).toBeVisible({ timeout: 10_000 });
      await expect(card).toHaveAttribute('data-case-id', entry.caseId);
      await expect(
        page.locator('[data-testid="mustard-seed-seal-poem-zh"]')
      ).toContainText(entry.poemZh);
      await expect(
        page.locator('[data-testid="mustard-seed-seal-poem-en"]')
      ).toContainText(entry.poemEn);
      await expect(
        page.locator('[data-testid="mustard-seed-seal-attribution"]')
      ).toContainText(entry.attribution);

      await page.evaluate(() => window.__mustardSeedCard.close());
      await expect(card).toBeHidden({ timeout: 5_000 });
    }

    const directoryIds = await page.evaluate(() =>
      window.__mustardSeedSeal?.cases?.()
    );
    expect(directoryIds).toEqual(cases.map((c) => c.caseId));
  });

  test('CA-01 old pond renders Japanese original from catalog', async ({ page }) => {
    await openFreshProductShell(page);
    await expect
      .poll(async () => page.evaluate(() => Boolean(window.__mustardSeedSeal?.open)), {
        timeout: 15_000
      })
      .toBe(true);

    await page.evaluate(() => {
      window.__mustardSeedSeal.clearArchive();
      window.__mustardSeedSeal.open({
        mode: 'force',
        archiveEntryId: 'ca-01-old-pond'
      });
    });

    const card = page.locator('#mustard-seed-seal-card');
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toHaveAttribute('data-case-id', 'ca-01-old-pond');
    await expect(card).toHaveAttribute('data-surface', 'contemplative-archive');
    await expect(
      page.locator('[data-testid="mustard-seed-seal-poem-zh"]')
    ).toContainText('古池や');
    await expect(
      page.locator('[data-testid="mustard-seed-seal-poem-en"]')
    ).toContainText('AN OLD POND');
  });
});
