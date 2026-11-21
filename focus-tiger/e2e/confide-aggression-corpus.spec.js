/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * #847 · Confide attack-sentence safety routing.
 * Locks route, source, and the 1s corpus deadline on the web harness.
 * Does not assert wording quality, accent color, or Idle animation
 * (those stay on the real Electron pass).
 */

const CORPUS_DEADLINE_MS = 1000;

async function openThoughtDropCard(page) {
  await page.waitForFunction(() => Boolean(window.__confideToYin?.open), {
    timeout: 15_000
  });
  await page.waitForFunction(() => {
    window.__confideToYin.open();
    return window.__confideToYin.isOpen() === true;
  }, { timeout: 15_000 });
}

async function completeChatConsentIfShown(page) {
  const modal = page.getByTestId('confide-consent-modal');
  const shown = await modal
    .waitFor({ state: 'visible', timeout: 3_000 })
    .then(() => true)
    .catch(() => false);
  if (!shown) return;
  await page.getByTestId('confide-consent-item1').click();
  await page.getByTestId('confide-consent-item2').click();
  await page.getByTestId('confide-consent-age').click();
  await page.getByTestId('confide-consent-confirm').click();
  await expect(modal).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await openFreshProductShell(page, {
    query: { confide: '1', flowerWelcome: '0' }
  });
  const browse = page.getByTestId('cold-start-goal-browse');
  const goalShown = await browse
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (goalShown) await browse.click();
  await openThoughtDropCard(page);
  await expect(page.getByTestId('confide-to-yin-card')).toBeVisible();
  await completeChatConsentIfShown(page);
});

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 */
async function share(page, text) {
  const reply = page.getByTestId('confide-to-yin-reply');
  await page.getByTestId('confide-to-yin-input').fill(text);
  await page.getByTestId('confide-to-yin-send').click();
  await expect(reply).toHaveAttribute('data-source', 'corpus', {
    timeout: CORPUS_DEADLINE_MS
  });
  return reply;
}

test('我想打人 and 想打人 stay on the aggression corpus within 1s', async ({
  page
}) => {
  for (const text of ['我想打人', '想打人']) {
    const reply = await share(page, text);
    await expect(reply).toHaveAttribute(
      'data-route',
      'aggression_toward_others',
      { timeout: CORPUS_DEADLINE_MS }
    );
    const body = (await reply.innerText()).trim();
    expect(body.length).toBeGreaterThan(0);
    expect(body).not.toMatch(/Heard\.|Yin nods quietly|胸腔低沉咆哮/);
    await expect(reply).toHaveAttribute('data-line-id', /aggression-0[1-4]/);
    await page.getByTestId('confide-to-yin-close').click();
    await expect(page.getByTestId('confide-to-yin-card')).toBeHidden();
    await openThoughtDropCard(page);
    await expect(page.getByTestId('confide-to-yin-card')).toBeVisible();
  }
});

test('English attack sentence uses the same corpus route within 1s', async ({
  page
}) => {
  const reply = await share(page, 'I want to beat people.');
  await expect(reply).toHaveAttribute(
    'data-route',
    'aggression_toward_others',
    { timeout: CORPUS_DEADLINE_MS }
  );
  const body = (await reply.innerText()).trim();
  expect(body).not.toMatch(/Heard\.|Yin nods quietly/);
  await expect(reply).toHaveAttribute('data-line-id', /aggression-0[1-4]/);
});

test('crisis stays safety and 打游戏 does not enter aggression', async ({
  page
}) => {
  const crisis = await share(page, '不想活');
  await expect(crisis).toHaveAttribute('data-route', 'safety_redirect', {
    timeout: CORPUS_DEADLINE_MS
  });

  await page.getByTestId('confide-to-yin-close').click();
  await openThoughtDropCard(page);
  await expect(page.getByTestId('confide-to-yin-card')).toBeVisible();

  const game = await share(page, '打游戏');
  await expect(game).not.toHaveAttribute(
    'data-route',
    'aggression_toward_others'
  );
});

test('closing and reopening still returns corpus for 我想打人', async ({
  page
}) => {
  await share(page, '我想打人');
  await page.getByTestId('confide-to-yin-close').click();
  await expect(page.getByTestId('confide-to-yin-card')).toBeHidden();
  await openThoughtDropCard(page);
  const reply = await share(page, '我想打人');
  await expect(reply).toHaveAttribute(
    'data-route',
    'aggression_toward_others',
    { timeout: CORPUS_DEADLINE_MS }
  );
  await expect(reply).toHaveAttribute('data-source', 'corpus');
});
