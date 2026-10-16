/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { A13_GLASS_VISUAL_SURFACES } from '../src/core/glassCardVisualSurfaces.js';
import {
  isWarmSanctuaryGlassRgb,
  parseCssRgba,
  readFirstRootBackground
} from './helpers/glass-card-visual-guardrail.js';
import {
  openA13GlassSurface,
  prepareIdleWideShell
} from './helpers/open-a13-glass-surface.js';

/**
 * A13 · Key card warm-glass guardrails + optional element screenshots.
 * RGB contract runs in CI; soft snapshots when FT_A13_SOFT_SNAP=1.
 * @see docs/task-briefs/task-a13-glass-card-screenshots.md
 */

test.describe.configure({ mode: 'serial' });

test.describe('A13 glass card visual guardrail · wide Idle', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  for (const surface of A13_GLASS_VISUAL_SURFACES) {
    test(`${surface.id} · warm sanctuary glass (not dark plate)`, async ({
      page
    }) => {
      await prepareIdleWideShell(page, surface);
      await openA13GlassSurface(page, surface);

      if (surface.expectWarmGlass === false) {
        const chrome = page.locator(surface.rootSelector).first();
        await expect(chrome).toBeVisible({ timeout: 8_000 });
        return;
      }

      const sample = await readFirstRootBackground(page, surface.rootSelector);
      expect(sample.found, `root ${surface.rootSelector}`).toBe(true);
      const rgba = parseCssRgba(sample.backgroundColor);
      expect(
        isWarmSanctuaryGlassRgb(rgba),
        `${surface.id} fill warm glass; selector=${sample.selector}; bg=${sample.backgroundColor}`
      ).toBe(true);
    });

    test(`${surface.id} · element screenshot (soft)`, async ({ page }, testInfo) => {
      test.skip(
        process.env.FT_A13_SOFT_SNAP !== '1',
        'soft snapshots: FT_A13_SOFT_SNAP=1 (optional; RGB contract is CI gate)'
      );
      test.skip(
        testInfo.project.name === 'local-acceptance',
        'chromium project only'
      );

      await prepareIdleWideShell(page, surface);
      await openA13GlassSurface(page, surface);
      const target = page.locator(surface.rootSelector).first();
      await expect(target).toBeVisible({ timeout: 8_000 });

      await expect(target).toHaveScreenshot(`${surface.id}-root.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.03,
        scale: 'css'
      });
    });
  }
});
