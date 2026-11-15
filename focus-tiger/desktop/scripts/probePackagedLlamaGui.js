/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = path.join(desktopDir, 'release');
const reportPath = path.join(releaseDir, 't95-llama-gui-probe.json');

function findApp() {
  const macDir = path.join(releaseDir, 'mac-arm64');
  if (!existsSync(macDir)) return '';
  const name = readdirSync(macDir).find((entry) => entry.endsWith('.app'));
  return name ? path.join(macDir, name) : '';
}

const appPath = findApp();
if (!appPath) {
  console.error('llama gui probe: no release/mac-arm64/*.app — pack the dir first');
  process.exit(1);
}

const executable = path.join(appPath, 'Contents', 'MacOS');
const binName = readdirSync(executable)[0];
const bin = path.join(executable, binName);
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
env.FT_T95_LLAMA_PROBE_OUT = reportPath;

const run = spawnSync(bin, ['--t95-llama-probe'], {
  cwd: desktopDir,
  env,
  encoding: 'utf8',
  timeout: 120000
});
if (run.stdout) process.stdout.write(run.stdout);
if (run.stderr) process.stderr.write(run.stderr);
if (!existsSync(reportPath)) {
  console.error('llama gui probe: packaged app did not write a report');
  process.exit(run.status || 1);
}
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
console.log(`llama gui probe: guiProcessLoaded=${report.guiProcessLoaded === true} developerIdSigned=false notarized=false`);
process.exit(report.guiProcessLoaded === true ? 0 : 1);
