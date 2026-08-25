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

const electronBin = String(electronPath || '').trim();
const electron = spawn(electronBin, ['.', '--dev'], {
  cwd: desktopDir,
  stdio: 'inherit',
  env: { ...process.env, FT_DESKTOP_DEV: '1' }
});

function shutdown() {
  electron.kill();
  vite.kill();
}

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
