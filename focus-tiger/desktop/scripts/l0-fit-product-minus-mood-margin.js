#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Fit product_minus_mood_margin on freeze lab set + zh destset only.
 * Not a blind run. Not product-path.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \\
 *     node desktop/scripts/l0-fit-product-minus-mood-margin.js
 */

import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  L0_EMBEDDING_MODEL_FILENAME,
  L0_EMBEDDING_MODEL_MIN_BYTES
} from '../companion/l0EmbeddingConfig.js';
import { isGgufCachedAt } from '../companion/l0Download.js';
import { loadEmbeddingHold } from '../companion/l1EmbeddingHold.js';
import {
  KB_MOOD_VETO_LAB_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MOOD_ROWS
} from '../../src/core/confide/confideKbMoodVetoLabSet.js';
import { CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS } from '../../src/core/confide/confideMoodVetoDevsetZhV1.js';
import { productClearlyOutranksMood } from '../../src/core/confide/confideRoutingArbitrationShadow.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAB_DIR = '/tmp/ft-l0-lab';
const SWEEP = Object.freeze([0, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1]);

function defaultEmbeddingPath() {
  if (process.env.FT_EMBEDDING_GGUF) return process.env.FT_EMBEDDING_GGUF;
  if (process.platform === 'darwin') {
    return path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'Focus Tiger',
      'companion-l0',
      L0_EMBEDDING_MODEL_FILENAME
    );
  }
  return path.join(__dirname, '..', '.l0-cache', L0_EMBEDDING_MODEL_FILENAME);
}

function bucketForFreeze(row) {
  if (row.set === 'mood' && row.lang === 'zh') return 'freeze_mood_zh';
  if (row.set === 'control' && row.group === 'mixed') return 'freeze_mixed';
  if (row.set === 'control') return 'freeze_control_other';
  return 'freeze_other';
}

function bucketForDev(row) {
  if (row.label === 'positive' || row.label === 'interrogative-positive') {
    return 'dev_mood';
  }
  if (row.label === 'counter-mixed') return 'dev_mixed';
  if (row.label === 'counter-product') return 'dev_product';
  return 'dev_other';
}

function rate(rows, margin) {
  if (!rows.length) return null;
  const n = rows.filter((r) =>
    productClearlyOutranksMood(r.productScore, r.moodScore, margin)
  ).length;
  return n / rows.length;
}

const destPath = defaultEmbeddingPath();
if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
  process.stderr.write(`[fit-product-minus-mood] missing embedding GGUF\n`);
  process.exit(2);
}

const hold = await loadEmbeddingHold({
  modelPath: destPath,
  env: process.env,
  onProgress: (msg) => process.stderr.write(`[fit-product-minus-mood] ${msg}\n`)
});

/** @type {{ bucket: string, productScore: number, moodScore: number, delta: number }[]} */
const scored = [];
try {
  for (const row of [...KB_MOOD_VETO_LAB_MOOD_ROWS, ...KB_MOOD_VETO_LAB_CONTROL_ROWS]) {
    const gate = await hold.classifyProductKnowledgeGate(row.text);
    scored.push({
      bucket: bucketForFreeze(row),
      productScore: Number(gate.score),
      moodScore: Number(gate.moodScore),
      delta: Number(gate.score) - Number(gate.moodScore)
    });
  }
  for (const row of CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS) {
    if (String(row.label || '').startsWith('crisis-edge')) continue;
    const gate = await hold.classifyProductKnowledgeGate(row.text);
    scored.push({
      bucket: bucketForDev(row),
      productScore: Number(gate.score),
      moodScore: Number(gate.moodScore),
      delta: Number(gate.score) - Number(gate.moodScore)
    });
  }
} finally {
  await hold.dispose();
}

const byBucket = {};
for (const row of scored) {
  if (!byBucket[row.bucket]) byBucket[row.bucket] = [];
  byBucket[row.bucket].push(row);
}

const moodPool = [...(byBucket.freeze_mood_zh || []), ...(byBucket.dev_mood || [])].filter(
  (r) => Number.isFinite(r.delta)
);
const maxMoodDelta = moodPool.reduce((m, r) => Math.max(m, r.delta), Number.NEGATIVE_INFINITY);
function moodProductPath(margin) {
  const freeze = rate(byBucket.freeze_mood_zh || [], margin);
  const dest = rate(byBucket.dev_mood || [], margin);
  return { freeze, dest };
}

let recommended = 0.05;
for (const margin of SWEEP) {
  const { freeze, dest } = moodProductPath(margin);
  if (freeze === 0 && dest === 0) {
    recommended = margin;
    break;
  }
}

const sweep = SWEEP.map((margin) => ({
  margin,
  freeze_mood_zh_product_path: rate(byBucket.freeze_mood_zh || [], margin),
  freeze_mixed_product_path: rate(byBucket.freeze_mixed || [], margin),
  freeze_control_other_product_path: rate(byBucket.freeze_control_other || [], margin),
  dev_mood_product_path: rate(byBucket.dev_mood || [], margin),
  dev_mixed_product_path: rate(byBucket.dev_mixed || [], margin),
  dev_product_product_path: rate(byBucket.dev_product || [], margin)
}));

const counts = Object.fromEntries(
  Object.entries(byBucket).map(([k, rows]) => [k, rows.length])
);

const payload = {
  probe: 'fit-product-minus-mood-margin',
  counts,
  max_mood_delta: Number.isFinite(maxMoodDelta) ? maxMoodDelta : null,
  recommended_margin: recommended,
  sweep
};

await mkdir(LAB_DIR, { recursive: true });
const jsonPath = path.join(LAB_DIR, `fit-product-minus-mood-margin-${Date.now()}.json`);
await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

process.stdout.write(
  `[fit-product-minus-mood] recommended_margin=${recommended} max_mood_delta=${
    Number.isFinite(maxMoodDelta) ? maxMoodDelta.toFixed(4) : 'n/a'
  }\n`
);
for (const [k, n] of Object.entries(counts)) {
  process.stdout.write(`[fit-product-minus-mood] ${k} n=${n}\n`);
}
for (const row of sweep) {
  process.stdout.write(
    `[fit-product-minus-mood] margin=${row.margin} freeze_mood=${row.freeze_mood_zh_product_path} freeze_mixed=${row.freeze_mixed_product_path} dev_mood=${row.dev_mood_product_path} dev_mixed=${row.dev_mixed_product_path} dev_product=${row.dev_product_product_path}\n`
  );
}
process.stdout.write(`[fit-product-minus-mood] json: ${jsonPath}\n`);
