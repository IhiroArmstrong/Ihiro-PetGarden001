import { test, expect } from '@playwright/test';
import {
  openFreshProductShell,
  quickStartFocus
} from './helpers/product-shell.js';

/**
 * Ambient parity matrix rows ⑤⑥⑩:
 * ⑤ audible → note click mutes (not panel-only)
 * ⑥ muted → note click resumes preferred track with sound
 * ⑩ Focusing: pick a track → audible
 *
 * @see docs/task-briefs/audit-narrow-wide-ambient-parity.md
 */

/** @param {import('@playwright/test').Page} page */
function ambientSnap(page) {
  return page.evaluate(() => {
    const audios = [...document.querySelectorAll('audio')];
    const anyAudible = audios.some(
      (a) => !a.paused && !a.muted && a.volume > 0 && Boolean(a.currentSrc)
    );
    const ctrl = window.__ambientSoundscape;
    return {
      anyAudible,
      want: Boolean(ctrl?.wantsEnabled?.()),
      audible: Boolean(ctrl?.isAudiblePlaying?.())
    };
  });
}

/**
 * Open Soundscape and pick the first non-Off built-in track.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} noteBtn
 */
async function chooseBuiltInTrack(page, noteBtn) {
  await noteBtn.click();
  await expect(page.locator('.ambient-soundscape__panel')).toBeVisible({
    timeout: 5_000
  });
  const track = page.locator('.ambient-soundscape__track').nth(1);
  await expect(track).toBeVisible();
  await track.click();
  await expect
    .poll(async () => {
      const s = await ambientSnap(page);
      return s.anyAudible || s.audible;
    }, { timeout: 8_000 })
    .toBe(true);
}

test.describe('ambient ⑤⑥ note mute / resume', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('wide: audible → note mutes; note again resumes preferred with sound', async ({
    page
  }) => {
    await openFreshProductShell(page);
    const note = page.locator('.ambient-soundscape__mute');
    await expect(note).toBeVisible({ timeout: 10_000 });

    await chooseBuiltInTrack(page, note);

    // ⑤ — second note click while audible must mute
    await note.click();
    await expect
      .poll(async () => {
        const s = await ambientSnap(page);
        return !s.anyAudible && !s.audible;
      }, { timeout: 8_000 })
      .toBe(true);

    // ⑥ — third note click resumes preferred track with sound (same gesture)
    await note.click();
    await expect
      .poll(async () => {
        const s = await ambientSnap(page);
        return s.anyAudible || s.audible;
      }, { timeout: 8_000 })
      .toBe(true);
  });
});

test.describe('ambient ⑤⑥ narrow ActionBar ♪', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('375: ActionBar note mute then resume preferred with sound', async ({
    page
  }) => {
    await openFreshProductShell(page);
    const note = page.locator('#ft-narrow-mute-btn');
    await expect(note).toBeVisible({ timeout: 10_000 });

    await chooseBuiltInTrack(page, note);

    await note.click();
    await expect
      .poll(async () => {
        const s = await ambientSnap(page);
        return !s.anyAudible && !s.audible;
      }, { timeout: 8_000 })
      .toBe(true);

    await note.click();
    await expect
      .poll(async () => {
        const s = await ambientSnap(page);
        return s.anyAudible || s.audible;
      }, { timeout: 8_000 })
      .toBe(true);
  });
});

test.describe('ambient ⑩ Focusing track audible', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('wide Focusing: choosing a track is audible', async ({ page }) => {
    await openFreshProductShell(page);
    await quickStartFocus(page);
    await expect(page.locator('#btn-focus')).toContainText(/Rise|起身/i, {
      timeout: 10_000
    });

    const note = page.locator('.ambient-soundscape__mute');
    await expect(note).toBeVisible();
    await chooseBuiltInTrack(page, note);

    const snap = await ambientSnap(page);
    expect(snap.anyAudible || snap.audible).toBe(true);
    expect(snap.want).toBe(true);
  });
});
