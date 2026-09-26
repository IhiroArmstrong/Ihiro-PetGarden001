/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * System TTS Slice 0 probe launcher.
 * Default: EN/JA gate + speak samples to /tmp/ft-l0-lab/
 * --ui: open Electron lab page (manual Speak EN/JA / Stop)
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  probeMacosTtsGate,
  startMacosSpeechSpeak,
  stopMacosSpeechSpeak
} from '../voiceInput/macosSpeechNative.js';
import { SYSTEM_TTS_PROBE_SAMPLES } from '../systemTts/ttsProvider.js';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.join(scriptDir, '..');
const OUT_ROOT = '/tmp/ft-l0-lab';
const START_LATENCY_BUDGET_MS = 1000;

async function writeProbeReport(report) {
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const outPath = path.join(OUT_ROOT, `system-tts-probe-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ reportPath: outPath, ...report }, null, 2)}\n`);
  return report;
}

async function runSpeakSample(locale) {
  const text = SYSTEM_TTS_PROBE_SAMPLES[locale];
  const session = startMacosSpeechSpeak(text, locale);
  const started = await session.started;
  const startLatencyMs = Number(started?.startLatencyMs);
  const finished = await session.finished;
  return {
    locale,
    text,
    startLatencyMs: Number.isFinite(startLatencyMs) ? startLatencyMs : null,
    startWithinBudget:
      Number.isFinite(startLatencyMs) && startLatencyMs <= START_LATENCY_BUDGET_MS,
    ok: finished.ok === true,
    phase: finished.json?.phase || null,
    durationMs: Number(finished.json?.durationMs) || null,
    json: finished.json
  };
}

async function runInterruptSample() {
  const locale = 'en-US';
  const text =
    'Return to a single breath. Pause here. Let the shoulders soften. Stay with one quiet inhale.';
  const session = startMacosSpeechSpeak(text, locale);
  await session.started;
  await new Promise((resolve) => setTimeout(resolve, 500));
  stopMacosSpeechSpeak(session.child);
  const finished = await session.finished;
  return {
    locale,
    interrupted: finished.json?.phase === 'stopped',
    ok: finished.ok === true,
    json: finished.json
  };
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
      FT_SYSTEM_TTS_PROBE: '1'
    }
  });
  child.on('exit', (code) => process.exit(code ?? 0));
}

async function main() {
  const uiMode = process.argv.includes('--ui');
  const [enGate, jaGate] = await Promise.all([
    probeMacosTtsGate('en-US'),
    probeMacosTtsGate('ja-JP')
  ]);
  const enSpeak = await runSpeakSample('en-US');
  const jaSpeak = await runSpeakSample('ja-JP');
  const interrupt = await runInterruptSample();

  const probePassed =
    enGate.gatePassed === true &&
    jaGate.gatePassed === true &&
    enSpeak.ok === true &&
    jaSpeak.ok === true &&
    enSpeak.startWithinBudget === true &&
    jaSpeak.startWithinBudget === true &&
    interrupt.ok === true &&
    interrupt.interrupted === true;

  const report = await writeProbeReport({
    at: new Date().toISOString(),
    probe: 'system-tts-slice0',
    probePassed,
    startLatencyBudgetMs: START_LATENCY_BUDGET_MS,
    gates: { enGate, jaGate },
    samples: { enSpeak, jaSpeak, interrupt },
    notes: {
      requiresNetwork: false,
      requiresMicrophone: false
    }
  });

  if (uiMode) {
    if (!report.probePassed) {
      process.stderr.write(
        '[system-tts-probe] automated samples did not fully pass — UI still opens for manual listening\n'
      );
    }
    await launchProbeUi();
    return;
  }

  process.exit(report.probePassed ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});
