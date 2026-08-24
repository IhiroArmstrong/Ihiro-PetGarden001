/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fallbackRouteIsCorpusFallback,
  simulateGenerateFailureFallback,
  verifyProductionL0ConfigUnchanged
} from '../companion/l0Spike17Checks.js';
import { runSpike17Probe } from '../companion/l0Spike17Probe.js';

const desktopDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function defaultSpikeDir() {
  if (process.env.FT_COMPANION_SPIKE_17_DIR) {
    return process.env.FT_COMPANION_SPIKE_17_DIR;
  }
  if (process.platform === 'darwin') {
    return path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'Focus Tiger',
      'companion-spike-17b'
    );
  }
  return path.join(desktopDir, '.spike-17b-cache');
}

function writeReport(report) {
  const outDir = path.join(desktopDir, '.spike-17b-cache', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `spike-17b-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  return outPath;
}

const modelDir = defaultSpikeDir();
fs.mkdirSync(modelDir, { recursive: true });

const productionCheck = verifyProductionL0ConfigUnchanged();
const fallbackSample = simulateGenerateFailureFallback();
const fallbackCheck = {
  corpusFallbackOnGenerateFailure: fallbackRouteIsCorpusFallback(),
  sample: fallbackSample
};

process.stderr.write(`[spike-17b] model dir: ${modelDir}\n`);
process.stderr.write(
  `[spike-17b] production l0Config unchanged: ${productionCheck.unchanged} (${productionCheck.productionModelId})\n`
);

const probe = await runSpike17Probe(modelDir, {
  onProgress: (msg) => {
    process.stderr.write(`[spike-17b] ${msg}\n`);
  }
});

const report = {
  kind: 'desktop-companion-spike-17b',
  at: new Date().toISOString(),
  productionConfig: productionCheck,
  startupIsolation: {
    note: 'Spike is a standalone Node script; Electron main only loads companion on user Confide open (L1 ensure), not at app boot.',
    l0ConfigWiredTo17B: productionCheck.unchanged,
    spikeDoesNotModifyL1Child: true
  },
  fallback: fallbackCheck,
  probe,
  answers: {
    downloadComplete: Boolean(probe.download?.complete),
    modelBytes: probe.download?.bytes ?? null,
    expectedBytes: probe.download?.expectedBytes ?? null,
    loadMs: probe.loadMs ?? null,
    firstTtftMs: probe.generations?.[0]?.ttftMs ?? null,
    firstTokensPerSec: probe.generations?.[0]?.tokensPerSec ?? null,
    peakRssMb: probe.rssMbPeak ?? null,
    fiveGenerationsStable:
      Array.isArray(probe.generations) && probe.generations.length === 5,
    generateFailureUsesCorpusFallback: fallbackCheck.corpusFallbackOnGenerateFailure,
    normalStartupUnchanged: productionCheck.unchanged,
    resourcesReleasedAfterUnload:
      probe.rssMbAfterUnload != null &&
      probe.rssMbBeforeUnload != null &&
      probe.rssMbAfterUnload < probe.rssMbBeforeUnload
  },
  notes: [
    'Spike mirrors production l0Config.js (1.7B); does not change L1/L2 routing.',
    'Sit→Focusing hitch while 1.7B loaded: manual TRACKER check (dual-terminal).',
    'M1 8GB probe + AE L2「能聊」still separate gates.'
  ]
};

const reportPath = writeReport(report);
process.stdout.write(
  `${JSON.stringify({ reportPath, ok: probe.ok && productionCheck.unchanged, verdict: probe.verdict }, null, 2)}\n`
);
process.exit(probe.ok && productionCheck.unchanged ? 0 : 1);
