/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Electron Confide · 18 EN chitchat · data-source via Playwright _electron.
 * Requires Vite on :5173 and a working Electron binary (qa worktree fallback).
 */

import { _electron as electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixturesForMultilangChitchatLocale } from '../../src/core/confide/confideMultilangChitchatFixtures.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.join(scriptDir, '..');
const electronCandidates = [
  path.join(desktopDir, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),
  '/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'
];
const electronExecutable =
  electronCandidates.find((candidate) => fs.existsSync(candidate)) || electronCandidates[0];
const electronCwd =
  fs.existsSync(
    '/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop/main.js'
  )
    ? '/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop'
    : desktopDir;

const fixtures = fixturesForMultilangChitchatLocale('en');
const OUT_ROOT = '/tmp/ft-l0-lab';
const SEND_TIMEOUT_MS = 180_000;
const READY_TIMEOUT_MS = 300_000;

async function waitForCompanionReady(page) {
  await page.waitForFunction(
    () => {
      const copy = document.querySelector(
        '[data-testid=confide-to-yin-desktop-status-copy]'
      );
      const text = copy?.textContent || '';
      return (
        /ready|Model4E4|準備ができました|已就绪|准备就绪/i.test(text)
      );
    },
    undefined,
    { timeout: READY_TIMEOUT_MS }
  );
}

async function sendAndReadSource(page, sentence) {
  await page.evaluate(() => window.__i18n?.setLocale?.('en'));
  await page.locator('[data-testid=confide-to-yin-input]').fill(sentence);
  await page.locator('[data-testid=confide-to-yin-send]').click();
  await page.waitForFunction(
    (text) => {
      const user = document.querySelector('[data-testid=confide-to-yin-user]');
      const reply = document.querySelector('[data-testid=confide-to-yin-reply]');
      return (
        user?.textContent?.trim() === text &&
        reply &&
        !reply.hidden &&
        Boolean(reply.dataset.source)
      );
    },
    sentence,
    { timeout: SEND_TIMEOUT_MS }
  );
  return page.evaluate(() => {
    const reply = document.querySelector('[data-testid=confide-to-yin-reply]');
    return {
      dataSource: reply?.dataset?.source || '',
      route: reply?.dataset?.route || '',
      lineId: reply?.dataset?.lineId || ''
    };
  });
}

async function main() {
  const app = await electron.launch({
    executablePath: electronExecutable,
    cwd: electronCwd,
    args: ['.', '--dev'],
    env: { ...process.env, FT_DESKTOP_DEV: '1' },
    timeout: READY_TIMEOUT_MS
  });

  const page = await app.firstWindow();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://127.0.0.1:5173/?product=1&confide=1', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000
  });
  await page.waitForFunction(() => window.__FT_APP_READY__ === true, undefined, {
    timeout: 60_000
  });

  await page.evaluate(() => {
    window.__confideToYin?.close?.();
    window.__i18n?.setLocale?.('en');
    window.__confideToYin?.open?.();
  });
  await page.waitForSelector('[data-testid=confide-to-yin-card]:not([hidden])', {
    timeout: 30_000
  });
  await waitForCompanionReady(page);

  const rows = [];
  for (const fixture of fixtures) {
    const meta = await sendAndReadSource(page, fixture.text);
    rows.push({
      id: fixture.id,
      input: fixture.text,
      'data-source': meta.dataSource,
      route: meta.route,
      lineId: meta.lineId
    });
    process.stderr.write(
      `[en-electron] ${fixture.id} source=${meta.dataSource} route=${meta.route}\n`
    );
  }

  const nonGenerate = rows.filter((r) => r['data-source'] !== 'generate');
  const report = {
    at: new Date().toISOString(),
    probe: 'en-chitchat-electron-confide',
    electronExecutable,
    electronCwd,
    session: 'clean-open-single-session',
    sampleCount: fixtures.length,
    allGenerate: nonGenerate.length === 0,
    nonGenerateCount: nonGenerate.length,
    rows
  };
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const outPath = path.join(OUT_ROOT, `en-chitchat-electron-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ reportPath: outPath, ...report }, null, 2)}\n`);
  await app.close();
  process.exit(nonGenerate.length === 0 ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});
