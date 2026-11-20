/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * Open-gate G2: after an A/B noticing line or a safety-01 line, the T14
 * help-resources control is visible and clickable in the same card.
 */

const REPLY_DEADLINE_MS = 1000;
const PANEL_DEADLINE_MS = 1000;

async function openThoughtDropCard(page) {
  await page.waitForFunction(() => Boolean(window.__confideToYin?.open), {
    timeout: 15_000
  });
  await page.waitForFunction(() => {
    window.__confideToYin.open();
    return window.__confideToYin.isOpen() === true;
  }, { timeout: 15_000 });
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
 */
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

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 * @param {string} route
 */
async function shareExpectRoute(page, text, route) {
  const reply = page.getByTestId('confide-to-yin-reply');
  await page.getByTestId('confide-to-yin-input').fill(text);
  await page.getByTestId('confide-to-yin-send').click();
  await expect(reply).toBeVisible({ timeout: REPLY_DEADLINE_MS });
  await expect(reply).toHaveAttribute('data-route', route, {
    timeout: REPLY_DEADLINE_MS
  });
  await expect(reply).not.toHaveAttribute('data-source', 'generate');
  const body = (await reply.innerText()).trim();
  expect(body.length).toBeGreaterThan(0);
  return reply;
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} viewportLabel
 */
async function expectHelpResourcesClickableInCard(page, viewportLabel) {
  const card = page.getByTestId('confide-to-yin-card');
  const reply = card.getByTestId('confide-to-yin-reply');
  const help = card.getByTestId('confide-to-yin-help-resources');
  const panel = card.getByTestId('confide-to-yin-help-resources-panel');

  await expect(help, `${viewportLabel}: help missing after reply`).toBeVisible();
  await expect(help).toBeEnabled();

  const stacked = await page.evaluate(() => {
    const cardEl = document.querySelector('[data-testid="confide-to-yin-card"]');
    const replyEl = cardEl?.querySelector('[data-testid="confide-to-yin-reply"]');
    const helpEl = cardEl?.querySelector(
      '[data-testid="confide-to-yin-help-resources"]'
    );
    if (!cardEl || !replyEl || !helpEl) {
      return { ok: false, reason: 'missing-nodes' };
    }
    const replyBox = replyEl.getBoundingClientRect();
    const helpBox = helpEl.getBoundingClientRect();
    const x = helpBox.left + helpBox.width / 2;
    const y = helpBox.top + helpBox.height / 2;
    const top = document.elementFromPoint(x, y);
    const hitHelp =
      Boolean(top) &&
      (top === helpEl || helpEl.contains(top) || Boolean(top.closest('[data-testid="confide-to-yin-help-resources"]')));
    return {
      ok: true,
      helpAfterReply: helpBox.top + 1 >= replyBox.top,
      hitHelp,
      topTag: top?.tagName || 'none',
      topTestId: top?.getAttribute?.('data-testid') || top?.id || top?.className || ''
    };
  });
  expect(stacked.ok, `${viewportLabel}: card nodes missing`).toBe(true);
  expect(
    stacked.helpAfterReply,
    `${viewportLabel}: help is above the reply (card-top only)`
  ).toBe(true);
  expect(
    stacked.hitHelp,
    `${viewportLabel}: help click blocked by ${stacked.topTag} ${stacked.topTestId}`
  ).toBe(true);

  await help.click();
  await expect(panel).toBeVisible({ timeout: PANEL_DEADLINE_MS });
  await expect(page.locator('#yin-support-modal.is-visible')).toHaveCount(0);
}

test('wide English A/B or safety reply keeps in-card help resources clickable', async ({
  page
}) => {
  const holdReply = await shareExpectRoute(
    page,
    'the weather is mild today',
    'fallback'
  );
  await expect(holdReply).toHaveAttribute('data-line-id', /^[AB]-\d{2}$/);
  await expectHelpResourcesClickableInCard(page, 'wide-ab');

  await page.getByTestId('confide-to-yin-close').click();
  await expect(page.getByTestId('confide-to-yin-card')).toBeHidden();
  await openThoughtDropCard(page);
  await expect(page.getByTestId('confide-to-yin-card')).toBeVisible();

  const safetyReply = await shareExpectRoute(
    page,
    'I want to die',
    'safety_redirect'
  );
  await expect(safetyReply).toHaveAttribute('data-line-id', 'safety-01');
  await expectHelpResourcesClickableInCard(page, 'wide-safety');
});
