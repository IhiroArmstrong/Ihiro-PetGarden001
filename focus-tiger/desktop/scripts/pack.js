/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const focusTigerRoot = path.join(desktopDir, '..');

function assertPlanALiveShipPackEnvUnset() {
  const offenders = [];
  for (const key of [
    'FT_QA_BOOT',
    'VITE_FT_QA_BOOT',
    'FT_PRACTICE_STUDY_MENU',
    'VITE_FT_PRACTICE_STUDY_MENU'
  ]) {
    const v = process.env[key];
    if (v === '1' || v === 'true' || v === true) offenders.push(key);
  }
  if (offenders.length > 0) {
    console.error(
      `desktop pack: refuse release build with live-ship QA flags set: ${offenders.join(', ')}`
    );
    process.exit(1);
  }
}

assertPlanALiveShipPackEnvUnset();

const vite = spawnSync('npm', ['run', 'build'], {
  cwd: focusTigerRoot,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32'
});
if (vite.status !== 0) process.exit(vite.status ?? 1);

const verify = spawnSync('npm', ['run', 'build:verify-no-qa-boot'], {
  cwd: focusTigerRoot,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32'
});
if (verify.status !== 0) process.exit(verify.status ?? 1);

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
