/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import electronBinary from 'electron';
import {
  DESKTOP_ELECTRON_PIN,
  assertInstalledElectronVersions
} from '../../src/core/desktopShellPin.js';

const require = createRequire(import.meta.url);

function readInstalledPackageVersion() {
  try {
    return String(require('electron/package.json').version || '');
  } catch {
    return '';
  }
}

function readBinaryVersion(binaryPath) {
  if (!binaryPath) return '';
  try {
    return execFileSync(binaryPath, ['--version'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const result = assertInstalledElectronVersions({
  pin: DESKTOP_ELECTRON_PIN,
  packageVersion: readInstalledPackageVersion(),
  binaryVersion: readBinaryVersion(String(electronBinary || ''))
});

if (!result.ok) {
  console.error(`desktop electron: ${result.error}`);
  process.exit(1);
}

console.log(`desktop electron: installed binary matches ${DESKTOP_ELECTRON_PIN}`);
