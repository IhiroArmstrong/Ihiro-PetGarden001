/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { test, expect } from '@playwright/test';
import { openFreshProductShell } from './helpers/product-shell.js';

/**
 * Batch 2 · Confide knowledge-base honesty empty state on the web harness.
 * Locks data-source and the 1s deadline. Does not assert reply tone.
 * The harness has no Electron model, so each test installs a companion
 * gate stub before paint. That stub is the same seam the desktop bridge uses.
 */

const REPLY_DEADLINE_MS = 1000;

const READY_MISS_GATE = Object.freeze({
  ok: true,
  isProduct: true,
  nearestId: 'KB-FUNC-0001',
  nearestScore: 0.7
});

const COLD_GATE = Object.freeze({
  ok: false,
  reason: 'embed_not_ready'
});

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ ok: boolean, reason?: string, isProduct?: boolean, nearestId?: string, nearestScore?: number }} gate
 */
async function openConfide(page, gate) {
  await page.addInitScript((stub) => {
    window.desktopShell = {
      isDesktop: true,
      companion: {
        semanticProductKnowledgeGate: async () => stub
      }
    };
  }, gate);
  await openFreshProductShell(page, {
    query: { confide: '1', flowerWelcome: '0' }
  });
  const browse = page.getByTestId('cold-start-goal-browse');
  const ear = page.getByTestId('confide-ear-chrome');
  const goalShown = await browse
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false);
  if (goalShown) await browse.click();
  await expect(ear).toBeVisible({ timeout: 15_000 });
  await ear.click();
  await expect(page.getByTestId('confide-to-yin-card')).toBeVisible();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 * @param {string} source
 */
async function shareExpectSource(page, text, source) {
  const reply = page.getByTestId('confide-to-yin-reply');
  await page.getByTestId('confide-to-yin-input').fill(text);
  await page.getByTestId('confide-to-yin-send').click();
  await expect(reply).toHaveAttribute('data-source', source, {
    timeout: REPLY_DEADLINE_MS
  });
  await expect(reply).toBeVisible();
  const body = (await reply.innerText()).trim();
  expect(body.length).toBeGreaterThan(0);
  return reply;
}

async function reopen(page) {
  await page.getByTestId('confide-to-yin-close').click();
  await expect(page.getByTestId('confide-to-yin-card')).toBeHidden();
  await page.getByTestId('confide-ear-chrome').click();
  await expect(page.getByTestId('confide-to-yin-card')).toBeVisible();
}

test('ready embedding miss stays on honesty empty state within 1s', async ({
  page
}) => {
  await openConfide(page, READY_MISS_GATE);
  for (const text of ['观察翼是什么', 'What is the observation wing?']) {
    const reply = await shareExpectSource(
      page,
      text,
      'product_knowledge_honesty'
    );
    await expect(reply).not.toHaveAttribute('data-source', 'generate');
    await reopen(page);
  }
  const again = await shareExpectSource(
    page,
    '观察翼是什么',
    'product_knowledge_honesty'
  );
  await expect(again).not.toHaveAttribute('data-source', 'generate');
});

test('catalog hit stays a short answer and mood aside skips honesty', async ({
  page
}) => {
  await openConfide(page, READY_MISS_GATE);
  const hit = await shareExpectSource(page, '接地练习在哪', 'product_knowledge');
  await expect(hit).not.toHaveAttribute(
    'data-source',
    'product_knowledge_honesty'
  );

  await reopen(page);
  const reply = page.getByTestId('confide-to-yin-reply');
  await page.getByTestId('confide-to-yin-input').fill('有点烦');
  await page.getByTestId('confide-to-yin-send').click();
  await expect(reply).toBeVisible({ timeout: REPLY_DEADLINE_MS });
  await expect(reply).not.toHaveAttribute(
    'data-source',
    'product_knowledge_honesty'
  );
  await expect(reply).not.toHaveAttribute('data-source', 'generate');
});

test('embedding not ready still uses honesty for a product miss within 1s', async ({
  page
}) => {
  await openConfide(page, COLD_GATE);
  const reply = await shareExpectSource(
    page,
    '观察翼是什么',
    'product_knowledge_honesty'
  );
  await expect(reply).not.toHaveAttribute('data-source', 'generate');
});
