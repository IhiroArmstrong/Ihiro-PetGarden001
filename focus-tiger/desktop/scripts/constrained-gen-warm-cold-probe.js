/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Lab: constrained-gen stage 0 — time-to-warm + RSS after load, no generate.
 *
 *   cd /Users/armstronghesapplelaptop/Downloads/Zen-tiger-Pet-garden001-wt-develop-qa/focus-tiger/desktop && npm run companion:constrained-gen-warm-cold
 *
 * Results: /tmp/ft-l0-lab/constrained-gen-warm-cold-<epoch>.json
 * Never writes prompt, reply, or transcript. Not wired to test:smoke.
 * Run from system Terminal.app (Metal).
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { L0_MODEL_FILENAME, L0_MODEL_MIN_BYTES } from '../companion/l0Config.js';
import { resolveL0ModelProfile } from '../companion/l0ModelProfiles.js';
import { isGgufCachedAt } from '../companion/l0Download.js';
import { resolveCompanionL0ModelDir } from '../companion/l0ModelDir.js';
import { rssMb } from '../companion/l0Metrics.js';

const LAB_ROOT = '/tmp/ft-l0-lab';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rssBytes() {
  return process.memoryUsage().rss;
}

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function defaultModelPath() {
  const fromEnv = String(process.env.FT_TOOL_CALL_GGUF || '').trim();
  if (fromEnv) return fromEnv;
  const dir = resolveCompanionL0ModelDir({
    env: process.env,
    platform: process.platform,
    homedir: os.homedir(),
    desktopRoot: path.join(__dirname, '..')
  });
  return path.join(dir, L0_MODEL_FILENAME);
}

async function disposeQuietly(model, llama) {
  try {
    if (model && typeof model.dispose === 'function') await model.dispose();
  } catch {
    /* already failed */
  }
  try {
    if (llama && typeof llama.dispose === 'function') await llama.dispose();
  } catch {
    /* already failed */
  }
}

/**
 * @param {string} modelPath
 * @returns {Promise<{ loadMs: number, rssMbBefore: number, rssMbAfterLoad: number, rssMbAfterUnload: number, gpu: string }>}
 */
async function loadUnloadOnce(modelPath) {
  const rssBefore = rssBytes();
  const { getLlama } = await import('node-llama-cpp');
  const llama = await getLlama();
  const gpu =
    llama && llama.gpu != null
      ? String(llama.gpu)
      : llama && llama.gpuType != null
        ? String(llama.gpuType)
        : 'unknown';
  const loadStarted = Date.now();
  const model = await llama.loadModel({ modelPath });
  const loadMs = Date.now() - loadStarted;
  const rssAfterLoad = rssBytes();
  await disposeQuietly(model, llama);
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    loadMs,
    rssMbBefore: rssMb(rssBefore),
    rssMbAfterLoad: rssMb(rssAfterLoad),
    rssMbAfterUnload: rssMb(rssBytes()),
    gpu
  };
}

async function main() {
  const profile = resolveL0ModelProfile();
  const modelPath = defaultModelPath();
  const loads = Math.max(1, Math.min(20, Number(process.env.FT_WARM_COLD_LOADS || 10) || 10));
  if (!isGgufCachedAt(modelPath, L0_MODEL_MIN_BYTES)) {
    process.stderr.write(`[constrained-gen-warm-cold] missing GGUF at ${modelPath}\n`);
    process.exit(2);
  }

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  /** @type {object[]} */
  const rows = [];
  let gpu = 'unknown';
  for (let i = 0; i < loads; i += 1) {
    process.stderr.write(`[constrained-gen-warm-cold] load ${i + 1}/${loads}\n`);
    const row = await loadUnloadOnce(modelPath);
    gpu = row.gpu;
    rows.push({
      i: i + 1,
      loadMs: row.loadMs,
      rssMbBefore: row.rssMbBefore,
      rssMbAfterLoad: row.rssMbAfterLoad,
      rssMbAfterUnload: row.rssMbAfterUnload
    });
  }

  const loadMs = rows.map((r) => r.loadMs);
  const rssDelta = rows.map((r) =>
    Math.round((r.rssMbAfterLoad - r.rssMbBefore) * 10) / 10
  );
  const report = {
    probe: 'constrained-gen-warm-cold',
    generatedAt: new Date().toISOString(),
    host: {
      platform: process.platform,
      arch: process.arch,
      node: process.version,
      totalMemMb: Math.round(os.totalmem() / (1024 * 1024)),
      cpus: os.cpus()?.[0]?.model || ''
    },
    model: {
      key: profile.key,
      modelId: profile.modelId,
      filename: profile.filename,
      expectedBytes: profile.expectedBytes
    },
    modelPath,
    gpu,
    loads,
    loadMsP50: percentile(loadMs, 50),
    loadMsP95: percentile(loadMs, 95),
    rssDeltaMbP50: percentile(rssDelta, 50),
    note: 'Lab load/unload of production GGUF. Not a 30-minute Electron session. No generate. No transcript.',
    rows
  };

  const out = path.join(LAB_ROOT, `constrained-gen-warm-cold-${Date.now()}.json`);
  fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${out}\n`);
  process.stdout.write(
    `p50=${report.loadMsP50}ms p95=${report.loadMsP95}ms rssDeltaP50=${report.rssDeltaMbP50}MB n=${loads}\n`
  );
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
