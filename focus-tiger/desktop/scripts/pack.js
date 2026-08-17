/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const focusTigerRoot = path.join(desktopDir, '..');

const vite = spawnSync('npm', ['run', 'build'], {
  cwd: focusTigerRoot,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32'
});
if (vite.status !== 0) process.exit(vite.status ?? 1);

const pack = spawnSync(
  'npm',
  ['exec', '--', 'electron-builder', '--mac', 'dmg', '--arm64'],
  {
    cwd: desktopDir,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
  }
);
process.exit(pack.status ?? 1);
