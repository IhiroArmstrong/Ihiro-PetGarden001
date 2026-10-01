/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import electronPath from 'electron';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const focusTigerRoot = path.join(desktopDir, '..');
const VITE_URL = 'http://127.0.0.1:5173';
const FORCE_EXIT_MS = 3000;

function probeVite() {
  return new Promise((resolve) => {
    const req = http.get(VITE_URL, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForVite(timeoutMs = 90_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(VITE_URL, (res) => {
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

/**
 * @param {import('node:child_process').ChildProcess | null | undefined} child
 * @param {NodeJS.Signals} signal
 */
function killChildTree(child, signal = 'SIGTERM') {
  if (!child?.pid || child.killed) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true
    });
    return;
  }
  try {
    process.kill(-child.pid, signal);
  } catch {
    try {
      child.kill(signal);
    } catch {
      /* already exited */
    }
  }
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {import('node:child_process').SpawnOptions} options
 */
function spawnDevChild(command, args, options) {
  return spawn(command, args, {
    ...options,
    detached: process.platform !== 'win32'
  });
}

const viteAlreadyUp = await probeVite();
/** @type {import('node:child_process').ChildProcess | null} */
let vite = null;
if (viteAlreadyUp) {
  console.log(
    'Vite already on 127.0.0.1:5173 — attaching Electron only (did not start a second Vite).'
  );
} else {
  vite = spawnDevChild('npm', ['run', 'dev'], {
    cwd: focusTigerRoot,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
  });
  try {
    await waitForVite();
  } catch (err) {
    killChildTree(vite, 'SIGTERM');
    console.error(err);
    process.exit(1);
  }
}

const electronBin = String(electronPath || '').trim();
const electron = spawnDevChild(electronBin, ['.', '--dev'], {
  cwd: desktopDir,
  stdio: 'inherit',
  env: { ...process.env, FT_DESKTOP_DEV: '1' }
});

let shuttingDown = false;
/** @type {NodeJS.Timeout | null} */
let forceExitTimer = null;

function clearForceExitTimer() {
  if (!forceExitTimer) return;
  clearTimeout(forceExitTimer);
  forceExitTimer = null;
}

function exitFromSignal(signal) {
  process.exit(signal === 'SIGINT' ? 130 : 143);
}

function shutdown(signal = 'SIGINT') {
  if (shuttingDown) return;
  shuttingDown = true;

  killChildTree(electron, 'SIGTERM');
  killChildTree(vite, 'SIGTERM');

  forceExitTimer = setTimeout(() => {
    killChildTree(electron, 'SIGKILL');
    killChildTree(vite, 'SIGKILL');
    exitFromSignal(signal);
  }, FORCE_EXIT_MS);
  forceExitTimer.unref();
}

electron.on('error', (err) => {
  clearForceExitTimer();
  console.error(err);
  killChildTree(vite, 'SIGTERM');
  process.exit(1);
});

electron.on('exit', (code) => {
  clearForceExitTimer();
  killChildTree(vite, 'SIGTERM');
  process.exit(code ?? 0);
});

if (vite) {
  vite.on('exit', (code) => {
    if (code && code !== 0) {
      killChildTree(electron, 'SIGTERM');
      process.exit(code);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
