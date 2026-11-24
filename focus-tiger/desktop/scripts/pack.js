/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertDesktopShellPin } from '../../src/core/desktopShellPin.js';
import {
  hasDeveloperIdApplicationIdentity,
  readCodesigningIdentityList
} from '../../src/core/packSignatureInspect.js';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const focusTigerRoot = path.join(desktopDir, '..');

function assertReleaseQaBootEnvUnset() {
  const offenders = [];
  for (const key of ['FT_QA_BOOT', 'VITE_FT_QA_BOOT']) {
    const v = process.env[key];
    if (v === '1' || v === 'true' || v === true) offenders.push(key);
  }
  if (offenders.length > 0) {
    console.error(
      `desktop pack: refuse release build with QA boot env set: ${offenders.join(', ')}`
    );
    process.exit(1);
  }
}

assertReleaseQaBootEnvUnset();

const shellPin = assertDesktopShellPin(
  JSON.parse(readFileSync(path.join(desktopDir, 'package.json'), 'utf8'))
);
if (!shellPin.ok) {
  console.error(`desktop pack: ${shellPin.error}`);
  process.exit(1);
}

function runDesktopNode(script, extraEnv = {}) {
  const run = spawnSync(process.execPath, [script], {
    cwd: desktopDir,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv }
  });
  if (run.status !== 0) process.exit(run.status ?? 1);
}

runDesktopNode(path.join(desktopDir, 'scripts/assertInstalledElectron.js'));
runDesktopNode(path.join(desktopDir, 'scripts/bakeLlamaBinaryForPack.js'));

/** Invite DMG default: cloud gate OFF. Later open-gate pack: VITE_FT_PRACTICE_BACKUP_CLOUD=1. */
const inviteCloudGateOff = process.env.VITE_FT_PRACTICE_BACKUP_CLOUD !== '1';
const packBuildEnv = {
  ...process.env,
  ...(inviteCloudGateOff ? { VITE_FT_PRACTICE_BACKUP_CLOUD: '0' } : {})
};

const vite = spawnSync('npm', ['run', 'build'], {
  cwd: focusTigerRoot,
  stdio: 'inherit',
  env: packBuildEnv,
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

const verifyCloud = spawnSync(
  'npm',
  ['run', 'build:verify-cloud-gate', '--', '--require-dist'],
  {
    cwd: focusTigerRoot,
    stdio: 'inherit',
    env: packBuildEnv,
    shell: process.platform === 'win32'
  }
);
if (verifyCloud.status !== 0) process.exit(verifyCloud.status ?? 1);

const verifyFeed = spawnSync('npm', ['run', 'build:verify-update-feed'], {
  cwd: focusTigerRoot,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32'
});
if (verifyFeed.status !== 0) process.exit(verifyFeed.status ?? 1);

const verifyNoGenerate = spawnSync(
  'npm',
  ['run', 'build:verify-confide-release-no-generate'],
  {
    cwd: focusTigerRoot,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
  }
);
if (verifyNoGenerate.status !== 0) process.exit(verifyNoGenerate.status ?? 1);

const probePack = process.env.FT_T95_PACK_PROBE === '1';
const builderEnv = { ...process.env };
const canSignWithDeveloperId = hasDeveloperIdApplicationIdentity(
  readCodesigningIdentityList()
);
if (probePack && !canSignWithDeveloperId) {
  builderEnv.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
}
const builderArgs = probePack
  ? ['exec', '--', 'electron-builder', '--mac', 'dir', '--arm64']
  : ['exec', '--', 'electron-builder', '--mac', 'dmg', '--arm64'];
const built = spawnSync('npm', builderArgs, {
  cwd: desktopDir,
  stdio: 'inherit',
  env: builderEnv,
  shell: process.platform === 'win32'
});
if (built.status !== 0) process.exit(built.status ?? 1);
if (!probePack) process.exit(0);

runDesktopNode(path.join(desktopDir, 'scripts/recordPackSignature.js'));
const probed = spawnSync(process.execPath, [path.join(desktopDir, 'scripts/probePackagedLlamaGui.js')], {
  cwd: desktopDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    FT_UPDATE_FEED_URL: process.env.FT_UPDATE_FEED_URL || 'https://updates.twinsology.com/prep/'
  }
});
const dmg = spawnSync(
  'npm',
  ['exec', '--', 'electron-builder', '--mac', 'dmg', '--arm64', '--prepackaged', 'release/mac-arm64/Samatia.app'],
  {
    cwd: desktopDir,
    stdio: 'inherit',
    env: builderEnv,
    shell: process.platform === 'win32'
  }
);
if (dmg.status !== 0) process.exit(dmg.status ?? 1);
process.exit(probed.status ?? 1);
