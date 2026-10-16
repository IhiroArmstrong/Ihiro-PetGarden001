/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { expect } from '@playwright/test';
import { VISIBLE_TEXT_POISON_RE } from '../../src/core/visibleTextPoison.js';

/**
 * A8: Idle / shell visible copy must not leak undefined / NaN / [object Object].
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} [contextLabel]
 */
export async function expectNoVisibleTextPoison(page, contextLabel = 'page') {
  const text = await page.evaluate(() => document.body?.innerText ?? '');
  expect(text, `${contextLabel} visible text poison`).not.toMatch(
    VISIBLE_TEXT_POISON_RE
  );
}
