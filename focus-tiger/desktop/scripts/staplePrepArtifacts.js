/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Staples Apple's notarization ticket onto the prep DMG and packaged .app.
 * Requires a prior successful `notarytool submit --wait` (see notarizePrepDmg.js).
 * Uses Command Line Tools via `xcrun stapler` — full Xcode is not required.
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  findPackagedMacApp,
  findReleaseDmg,
  stapleArtifactsWithXcrun
} from '../../src/core/packSignatureInspect.js';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = path.join(desktopDir, 'release');

const dmg = process.argv[2] || findReleaseDmg(releaseDir);
const app = process.argv[3] || findPackagedMacApp(releaseDir);

if (!dmg) {
  console.error('staple prep: no DMG in desktop/release');
  process.exit(1);
}
if (!app) {
  console.error('staple prep: no .app in desktop/release/mac-arm64');
  process.exit(1);
}

const stapled = stapleArtifactsWithXcrun([dmg, app]);
for (const row of stapled) {
  if (row.text) process.stdout.write(`${row.text}\n`);
  console.log(`staple prep: ${row.ok ? 'ok' : 'failed'} ${row.path}`);
}
if (stapled.some((row) => !row.ok)) process.exit(1);

const recorded = spawnSync(process.execPath, [path.join(desktopDir, 'scripts/recordPackSignature.js')], {
  cwd: desktopDir,
  stdio: 'inherit'
});
process.exit(recorded.status ?? 0);