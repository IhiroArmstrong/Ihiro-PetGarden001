/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runL0Child } from '../companion/l0Main.js';
import { evaluateL0Verdict } from '../companion/l0Metrics.js';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const focusTigerRoot = path.join(desktopDir, '..');
const skipWindow = process.env.FT_COMPANION_L0_SKIP_WINDOW === '1';

function waitForVite(timeoutMs = 90_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get('http://127.0.0.1:5173', (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error('Timed out waiting for Vite at 127.0.0.1:5173'));
          return;
        }
        setTimeout(tick, 400);
      });
    };
    tick();
  });
}

function writeLocalReport(report) {
  const outDir = path.join(desktopDir, '.l0-cache', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `report-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ reportPath: outPath, verdict: report.verdict }, null, 2)}\n`);
  return outPath;
}

async function runNodeOnlyProbe() {
  process.env.FT_COMPANION_L0_HOLD_MS =
    process.env.FT_COMPANION_L0_HOLD_MS || '1000';
  const session = runL0Child({
    onEvent: (ev) => {
      if (ev.event === 'status') {
        process.stderr.write(`[l0] ${ev.message}\n`);
      }
    }
  });
  /** @type {object | null} */
  let inference = null;
  try {
    const first = await Promise.race([
      session.whenReady.then(() => 'ready'),
      session.finished.then((report) => {
        inference = report;
        return 'done';
      })
    ]);
    if (first === 'ready') {
      if (session.child.stdin && !session.child.stdin.destroyed) session.go();
      inference = await session.finished;
    }
  } catch (err) {
    inference = inference || {
      loadError: err instanceof Error ? err.message : String(err)
    };
  }
  const row = inference || { loadError: 'no_inference_report' };
  const verdict = evaluateL0Verdict({
    loadError: row.loadError || null,
    ttftMs: row.ttftMs ?? null,
    tokensPerSec: row.tokensPerSec ?? null,
    rafP95DeltaMs: null
  });
  const report = {
    kind: 'desktop-companion-l0',
    at: new Date().toISOString(),
    electron: null,
    skipWindow: true,
    host: row.host || {
      platform: process.platform,
      arch: process.arch,
      totalMemMb: Math.round(os.totalmem() / (1024 * 1024))
    },
    inference: row,
    rafBaseline: null,
    rafLoaded: null,
    rafP95DeltaMs: null,
    verdict,
    notes: [
      'Skip-window run: no Idle rAF sample. Sit→Focusing hitch is still a manual TRACKER check.',
      'No product chat entry is registered in this slice.'
    ]
  };
  writeLocalReport(report);
  process.exit(row.loadError ? 1 : 0);
}

if (skipWindow) {
  await runNodeOnlyProbe();
} else {
  const { default: electronPath } = await import('electron');
  const electronBin = String(electronPath || '').trim();
  const vite = spawn('npm', ['run', 'dev'], {
    cwd: focusTigerRoot,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
  });
  try {
    await waitForVite();
  } catch (err) {
    vite.kill();
    console.error(err);
    process.exit(1);
  }

  const electron = spawn(electronBin, ['.', '--dev'], {
    cwd: desktopDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      FT_DESKTOP_DEV: '1',
      FT_COMPANION_L0: '1'
    }
  });

  function shutdown() {
    electron.kill();
    vite.kill();
  }

  electron.on('error', (err) => {
    console.error(err);
    vite.kill();
    process.exit(1);
  });
  electron.on('exit', (code) => {
    vite.kill();
    process.exit(code ?? 0);
  });
  vite.on('exit', (code) => {
    if (code && code !== 0) {
      electron.kill();
      process.exit(code);
    }
  });
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
