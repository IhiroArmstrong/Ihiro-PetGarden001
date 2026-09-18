/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Electron Confide · 18 EN chitchat frozen lines · data-source only.
 * Launches Electron with --remote-debugging-port, connects via browser WS URL.
 */

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixturesForMultilangChitchatLocale } from '../../src/core/confide/confideMultilangChitchatFixtures.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.join(scriptDir, '..');
const qaDesktop =
  '/Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop';
const electronExecutable = [
  path.join(qaDesktop, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),
  path.join(desktopDir, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')
].find((candidate) => fs.existsSync(candidate));
const electronCwd = fs.existsSync(path.join(qaDesktop, 'main.js')) ? qaDesktop : desktopDir;

const fixtures = fixturesForMultilangChitchatLocale('en');
const OUT_ROOT = '/tmp/ft-l0-lab';
const DEBUG_PORT = Number(process.env.FT_ELECTRON_DEBUG_PORT || 9333);
const SEND_TIMEOUT_MS = 180_000;
const READY_TIMEOUT_MS = 300_000;

/**
 * @returns {Promise<string | null>}
 */
async function resolveExistingWsUrl() {
  if (process.env.FT_ELECTRON_WS) return process.env.FT_ELECTRON_WS;
  try {
    const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.webSocketDebuggerUrl === 'string' ? json.webSocketDebuggerUrl : null;
  } catch {
    return null;
  }
}

/**
 * @returns {Promise<{ wsUrl: string, child: import('node:child_process').ChildProcess | null }>}
 */
async function launchElectronWithWs() {
  if (!electronExecutable) {
    throw new Error('Electron binary not found');
  }
  const existing = await resolveExistingWsUrl();
  if (existing) {
    return { wsUrl: existing, child: null };
  }

  const child = spawn(
    electronExecutable,
    ['.', '--dev', `--remote-debugging-port=${DEBUG_PORT}`],
    {
      cwd: electronCwd,
      env: { ...process.env, FT_DESKTOP_DEV: '1' },
      stdio: ['ignore', 'pipe', 'pipe']
    }
  );

  const wsUrl = await new Promise((resolve, reject) => {
    const deadline = Date.now() + 60_000;
    const onData = (chunk) => {
      const text = String(chunk);
      process.stderr.write(text);
      const match = text.match(/ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[0-9a-f-]+/i);
      if (match) {
        cleanup();
        resolve(match[0]);
      }
    };
    const onExit = (code) => {
      cleanup();
      reject(new Error(`Electron exited before CDP ws (${code})`));
    };
    const timer = setInterval(() => {
      if (Date.now() > deadline) {
        cleanup();
        reject(new Error('Timed out waiting for Electron CDP ws URL'));
      }
    }, 500);
    const cleanup = () => {
      clearInterval(timer);
      child.stdout?.off('data', onData);
      child.stderr?.off('data', onData);
      child.off('exit', onExit);
    };
    child.stdout?.on('data', onData);
    child.stderr?.on('data', onData);
    child.on('exit', onExit);
  });

  return { wsUrl, child };
}

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
  await page.evaluate(() => {
    const consent = document.querySelector('[data-testid=confide-to-yin-memory-consent]');
    if (consent && !consent.hidden) {
      document.querySelector('[data-testid=confide-to-yin-memory-consent-deny]')?.click();
    }
  });
  const input = page.locator('[data-testid=confide-to-yin-input]');
  await input.fill(sentence);
  const send = page.locator('[data-testid=confide-to-yin-send]');
  await send.waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForFunction(
    () => !document.querySelector('[data-testid=confide-to-yin-send]')?.disabled,
    undefined,
    { timeout: 30_000 }
  );
  await send.click();
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
  const { wsUrl, child } = await launchElectronWithWs();
  const cdpHttp = `http://127.0.0.1:${DEBUG_PORT}`;
  const browser = await chromium.connectOverCDP(cdpHttp);
  const context = browser.contexts()[0] || (await browser.newContext());
  let page =
    context.pages().find((p) => p.url().includes('5173')) ||
    context.pages()[0] ||
    null;

  if (!page) {
    page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://127.0.0.1:5173/?product=1&confide=1', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000
    });
  } else {
    await page.setViewportSize({ width: 1280, height: 900 });
  }

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
      `[en-electron-cdp] ${fixture.id} source=${meta.dataSource} route=${meta.route}\n`
    );
  }

  const nonGenerate = rows.filter((r) => r['data-source'] !== 'generate');
  const report = {
    at: new Date().toISOString(),
    probe: 'en-chitchat-electron-confide-cdp',
    wsUrl,
    session: 'clean-open-single-session',
    sampleCount: fixtures.length,
    allGenerate: nonGenerate.length === 0,
    nonGenerateCount: nonGenerate.length,
    rows
  };
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const outPath = path.join(OUT_ROOT, `en-chitchat-electron-cdp-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ reportPath: outPath, ...report }, null, 2)}\n`);
  // Disconnect only — do not shut down the user's Electron shell.
  if (typeof browser.disconnect === 'function') {
    await browser.disconnect();
  }
  if (child) {
    child.kill('SIGTERM');
  }
  process.exit(nonGenerate.length === 0 ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});
