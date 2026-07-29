import { test, expect } from '@playwright/test';
import {
  openFreshProductShell,
  openWideMoreMenuIfPresent
} from './helpers/product-shell.js';

const PANEL = '#language-preference-panel';
const SIT = '#btn-focus';
const WIDE_LANG = '#ft-wide-more-menu [data-proxy="language"]';
const NARROW_LANG = '#ft-narrow-options-drawer [data-proxy="language"]';

/**
 * v1.0.0 English-only ship: Language chrome is hidden while only `en` is ready.
 * Architecture (LanguagePreferenceUI + registry slots) stays for later flips.
 */
test('Language menu hidden while only English is ready (v1.0 English-only)', async ({
  page
}) => {
  await openFreshProductShell(page);

  await expect(page.locator(SIT)).toContainText(/Sit with Yin/i);

  const openedMore = await openWideMoreMenuIfPresent(page);
  if (openedMore) {
    await expect(page.locator(WIDE_LANG)).toHaveCount(0);
  } else {
    const grabber = page.locator(
      '#ft-narrow-options-grabber, [data-proxy="sheet"]'
    );
    if (await grabber.first().isVisible().catch(() => false)) {
      await grabber.first().click();
      await expect(page.locator(NARROW_LANG)).toHaveCount(0);
    }
  }

  await expect(page.locator(PANEL)).toBeHidden();
  await expect(page.locator('#language-preference-zh')).toHaveCount(0);
  await expect(page.locator('#language-preference-es')).toHaveCount(0);
});
