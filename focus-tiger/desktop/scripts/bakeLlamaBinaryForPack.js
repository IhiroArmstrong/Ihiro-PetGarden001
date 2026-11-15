/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Pack-time only. Compiles node-llama-cpp for this Electron binary when no
 * prebuild exists, then requires a second load with build:'never'.
 * This is Node-mode (ELECTRON_RUN_AS_NODE). It is not the packaged-GUI proof.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import electronBinary from 'electron';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const inner = path.join(desktopDir, 'scripts', 'bakeLlamaBinaryInner.mjs');
const electron = String(electronBinary || '');
if (!electron) {
  console.error('llama bake: Electron binary missing');
  process.exit(1);
}

const run = spawnSync(electron, [inner], {
  cwd: desktopDir,
  stdio: 'inherit',
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
});
process.exit(run.status ?? 1);
