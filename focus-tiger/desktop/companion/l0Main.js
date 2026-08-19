/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Electron main-process L0 orchestrator: Idle window rAF + Node child inference.
 * No preload companion API. No product menu.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { L0_RAF_SAMPLE_MS } from './l0Config.js';
import { evaluateL0Verdict, summarizeFrameIntervals } from './l0Metrics.js';
import { rafSamplerSource } from './l0Raf.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {import('electron').WebContents} webContents
 * @param {number} sampleMs
 */
export async function sampleRendererRaf(webContents, sampleMs = L0_RAF_SAMPLE_MS) {
  const intervals = await webContents.executeJavaScript(rafSamplerSource(sampleMs));
  return summarizeFrameIntervals(intervals);
}

/**
 * @param {string} line
 * @returns {object | null}
 */
export function parseNdjsonLine(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

/**
 * @param {{
 *   nodePath?: string,
 *   childPath?: string,
 *   onEvent?: (ev: object) => void
 * }} opts
 */
export function runL0Child(opts = {}) {
  const childPath = opts.childPath || path.join(__dirname, 'l0Child.js');
  const nodePath = opts.nodePath || process.env.FT_COMPANION_L0_NODE || 'node';
  const child = spawn(nodePath, [childPath], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: process.env
  });

  let buffer = '';
  /** @type {object | null} */
  let doneReport = null;
  /** @type {((ev: object) => void) | null} */
  let readyHook = null;

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      const ev = parseNdjsonLine(line);
      if (!ev) continue;
      opts.onEvent?.(ev);
      if (ev.event === 'ready') readyHook?.(ev);
      if (ev.event === 'done') doneReport = ev.report || ev;
      if (ev.event === 'error') {
        doneReport = { loadError: ev.message };
      }
    }
  });

  const finished = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (code) => {
      if (doneReport) {
        resolve(doneReport);
        return;
      }
      if (code === 0) resolve({ loadError: 'child_exit_without_report' });
      else reject(new Error(`l0_child_exit_${code}`));
    });
  });

  const whenReady = new Promise((resolve) => {
    readyHook = () => resolve();
  });

  return {
    child,
    whenReady,
    finished,
    go() {
      child.stdin.write('go\n');
    }
  };
}

/**
 * @param {{
 *   BrowserWindow: typeof import('electron').BrowserWindow,
 *   createWindow: () => import('electron').BrowserWindow,
 *   userDataDir: string
 * }} deps
 */
export async function runL0BenchInMain(deps) {
  const skipWindow = process.env.FT_COMPANION_L0_SKIP_WINDOW === '1';
  /** @type {import('electron').BrowserWindow | null} */
  let win = null;
  /** @type {ReturnType<typeof summarizeFrameIntervals> | null} */
  let rafBaseline = null;
  /** @type {ReturnType<typeof summarizeFrameIntervals> | null} */
  let rafLoaded = null;

  if (!skipWindow) {
    win = deps.createWindow();
    await new Promise((resolve) => win.webContents.once('did-finish-load', resolve));
    await new Promise((resolve) => setTimeout(resolve, 800));
    rafBaseline = await sampleRendererRaf(win.webContents);
  }

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
      if (win && !win.isDestroyed()) {
        rafLoaded = await sampleRendererRaf(win.webContents);
      }
      if (session.child.stdin && !session.child.stdin.destroyed) {
        session.go();
      }
      inference = await session.finished;
    }
  } catch (err) {
    inference = inference || {
      loadError: err instanceof Error ? err.message : String(err)
    };
  }

  const row = inference || { loadError: 'no_inference_report' };
  const rafP95DeltaMs =
    rafBaseline && rafLoaded
      ? Math.round((rafLoaded.p95Ms - rafBaseline.p95Ms) * 10) / 10
      : null;
  const verdict = evaluateL0Verdict({
    loadError: row.loadError || null,
    ttftMs: row.ttftMs ?? null,
    tokensPerSec: row.tokensPerSec ?? null,
    rafP95DeltaMs
  });

  const report = {
    kind: 'desktop-companion-l0',
    at: new Date().toISOString(),
    electron: process.versions.electron || null,
    host: row.host || {
      platform: process.platform,
      arch: process.arch,
      totalMemMb: Math.round(os.totalmem() / (1024 * 1024))
    },
    inference: row,
    rafBaseline,
    rafLoaded,
    rafP95DeltaMs,
    verdict,
    notes: [
      'rAF sample is Idle window proxy; Sit→Focusing hitch is still a manual TRACKER check.',
      'No product chat entry is registered in this slice.'
    ]
  };

  const outDir = path.join(deps.userDataDir, 'companion-l0');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `report-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ reportPath: outPath, verdict }, null, 2)}\n`);
  return report;
}
