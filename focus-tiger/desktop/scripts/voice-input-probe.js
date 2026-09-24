/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Voice Input Slice 0 probe launcher.
 * Default: on-device gate JSON to /tmp/ft-l0-lab/
 * --ui: open Electron lab page (manual Speak/Stop)
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { probeMacosOnDeviceGate } from '../voiceInput/macosSpeechNative.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.join(scriptDir, '..');
const OUT_ROOT = '/tmp/ft-l0-lab';

async function writeGateReport(gate) {
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const report = {
    at: new Date().toISOString(),
    probe: 'voice-input-gate',
    gatePassed: gate.gatePassed === true,
    gate
  };
  const outPath = path.join(OUT_ROOT, `voice-input-gate-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ reportPath: outPath, ...report }, null, 2)}\n`);
  return report;
}

async function launchProbeUi() {
  const electronMod = await import('electron');
  const electronBin = String(electronMod.default || '').trim();
  const child = spawn(electronBin, ['.', '--dev'], {
    cwd: desktopDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      FT_DESKTOP_DEV: '1',
      FT_VOICE_INPUT_PROBE: '1'
    }
  });
  child.on('exit', (code) => process.exit(code ?? 0));
}

async function main() {
  const uiMode = process.argv.includes('--ui');
  const gate = await probeMacosOnDeviceGate('en-US');
  const report = await writeGateReport(gate);

  if (uiMode) {
    if (!report.gatePassed) {
      process.stderr.write(
        '[voice-input-probe] gate failed — UI still opens for permission / sample debugging\n'
      );
    }
    await launchProbeUi();
    return;
  }

  process.exit(report.gatePassed ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});
