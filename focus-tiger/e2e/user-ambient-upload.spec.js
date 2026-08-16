/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/** Tiny MPEG frame (enough for accept + IDB store; decode optional). */
const TINY_MP3 = Buffer.from([
  0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

async function openSoundscapePanel(page) {
  await page.locator('.ambient-soundscape__mute').click({ force: true });
  await expect(page.locator('.ambient-soundscape__panel')).toBeVisible({
    timeout: 8_000
  });
  await expect(page.locator('#ambient-upload-btn')).toBeVisible();
}

test('user ambient upload: list on top, delete, survives reload until deleted', async ({
  page
}) => {
  await openFreshProductShell(page);
  await openSoundscapePanel(page);

  await page.locator('#ambient-upload-input').setInputFiles({
    name: 'my-calm.mp3',
    mimeType: 'audio/mpeg',
    buffer: TINY_MP3
  });

  const userTrack = page.locator(
    '.ambient-soundscape__track[data-user-track="1"]'
  );
  await expect(userTrack.first()).toBeVisible({ timeout: 8_000 });
  await expect(userTrack.first()).toContainText(/my-calm/i);
  await expect(userTrack.first()).toHaveClass(/is-selected/);

  const firstTrackLabel = page.locator('.ambient-soundscape__track').nth(1);
  await expect(firstTrackLabel).toHaveAttribute('data-user-track', '1');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 30_000
  });
  await openSoundscapePanel(page);
  await expect(
    page.locator('.ambient-soundscape__track[data-user-track="1"]')
  ).toHaveCount(1);

  await page.locator('.ambient-soundscape__track-delete').click({ force: true });
  await expect(
    page.locator('.ambient-soundscape__track[data-user-track="1"]')
  ).toHaveCount(0);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, {
    timeout: 30_000
  });
  await openSoundscapePanel(page);
  await expect(
    page.locator('.ambient-soundscape__track[data-user-track="1"]')
  ).toHaveCount(0);
});
