#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Shadow-only A/B of routing arbitration. Freeze + dest + Prompt 18 + AE.
 * Does not read ft-private. Does not score sealed-b-v2. Margin not frozen.
 *
 *   cd focus-tiger/desktop && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \\
 *     node scripts/l0-routing-arbitration-ab-lab.js
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
import { probeProductKnowledgeCatalog } from '../../src/core/confide/confideProductKnowledge.js';
import {
  KB_MOOD_VETO_LAB_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MOOD_ROWS
} from '../../src/core/confide/confideKbMoodVetoLabSet.js';
import { CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS } from '../../src/core/confide/confideMoodVetoDevsetZhV1.js';
import { KB_CATALOG_NEAR_REVIEW_LAB_ROWS } from '../../src/core/confide/confideKbCatalogNearReview.js';
import {
  PRODUCT_MINUS_MOOD_MARGIN_SWEEP,
  PRODUCT_SCORE_FLOOR_CANDIDATE,
  ROUTING_NEAR_HIT_MIN,
  decideShadowProductPathA,
  decideShadowProductPathB,
  maxClauseProductMinusMood,
  splitUtteranceByPunctuation
} from '../../src/core/confide/confideRoutingArbitrationShadow.js';

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
const LAB_DIR = '/tmp/ft-l0-lab';
const TTFT_N = 10;
const TTFT_TEXT = '接地练习在哪';

const PROMPT18_ANCHORS = Object.freeze([
  { id: 'A1', expectProduct: false, text: "Today I'm going to ride bicycles. How about you?" },
  { id: 'A2', expectProduct: false, text: 'Who is Duke number?' },
  { id: 'A3', expectProduct: false, text: 'When I see so much' },
  { id: 'A4', expectProduct: false, text: 'You are my good friend I like you how about you' },
  { id: 'A5', expectProduct: false, text: "I don't want to practice today. I'm a little tired." },
  { id: 'A6', expectProduct: true, text: 'What is ground exercise?' },
  { id: 'A7', expectProduct: true, text: 'focus vs meditation' },
  { id: 'A8', expectProduct: true, text: 'What is meditation?' },
  { id: 'A9', expectProduct: true, text: "What's the difference between focus and meditation?" },
  { id: 'A10', expectProduct: true, text: 'What is the observation wing?' },
  { id: 'A11', expectProduct: false, text: '冥想这套东西对我根本没用，我快要放弃了' },
  { id: 'A12', expectProduct: false, text: 'Where can I eat noodle?' },
  { id: 'A13', expectProduct: false, text: 'So can I talk to you?' }
]);

const AE_CATALOG = Object.freeze([
  { id: 'ae-ground', text: '接地练习在哪' },
  { id: 'ae-quiet-line', text: 'A Quiet Line 在哪' }
]);

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

function pct(hits, n) {
  if (!n) return 'n/a';
  return `${hits}/${n}=${(hits / n).toFixed(3)}`;
}

function median(values) {
  const xs = [...values].sort((a, b) => a - b);
  const mid = Math.floor(xs.length / 2);
  if (!xs.length) return null;
  if (xs.length % 2) return xs[mid];
  return (xs[mid - 1] + xs[mid]) / 2;
}

function freezeBucket(row) {
  if (row.set === 'mood' && row.lang === 'zh') return 'freeze_mood_zh';
  if (row.set === 'control' && row.group === 'mixed') return 'freeze_mixed';
  if (row.set === 'control') return 'freeze_control_other';
  return 'freeze_other';
}

function devBucket(row) {
  if (row.label === 'positive' || row.label === 'interrogative-positive') return 'dev_mood';
  if (row.label === 'counter-mixed') return 'dev_mixed';
  if (row.label === 'counter-product') return 'dev_product';
  return 'dev_other';
}

async function embedOnce(hold, text, cache) {
  if (cache.has(text)) return cache.get(text);
  const gate = await hold.classifyProductKnowledgeGate(text);
  const catalog = probeProductKnowledgeCatalog(text);
  const row = {
    productScore: Number(gate.score),
    moodScore: Number(gate.moodScore),
    nearestScore: Number.isFinite(Number(gate.nearestScore)) ? Number(gate.nearestScore) : null,
    catalogHit: Boolean(catalog.hit)
  };
  cache.set(text, row);
  return row;
}

async function scorePacked(hold, text, cache) {
  const clauses = [];
  for (const part of splitUtteranceByPunctuation(text)) {
    clauses.push({ text: part, ...(await embedOnce(hold, part, cache)) });
  }
  const whole = await embedOnce(hold, text, cache);
  const maxDelta = maxClauseProductMinusMood(clauses);
  return { text, clauses, whole, maxDelta };
}

function productA(packed, margin) {
  return decideShadowProductPathA({ maxDelta: packed.maxDelta, margin });
}

function productB(packed, margin) {
  return decideShadowProductPathB({
    clauses: packed.clauses,
    margin,
    floor: PRODUCT_SCORE_FLOOR_CANDIDATE,
    nearMin: ROUTING_NEAR_HIT_MIN
  }).productPath;
}

function rate(rows, margin, fn) {
  const hits = rows.filter((row) => fn(row, margin)).length;
  return { n: rows.length, hits, rate: rows.length ? hits / rows.length : null };
}

function anchorHits(packedAnchors, margin, fn, expectProduct) {
  const rows = packedAnchors.filter((row) => row.expectProduct === expectProduct);
  const hits = rows.filter((row) => fn(row, margin) === expectProduct).length;
  return { n: rows.length, hits };
}

async function loadHold() {
  const destPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write('[routing-arb-ab] missing embedding GGUF\n');
    process.exit(2);
  }
  return loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[routing-arb-ab] ${msg}\n`)
  });
}

async function timeAbClassify(hold, text) {
  const t0 = Date.now();
  const cache = new Map();
  await scorePacked(hold, text, cache);
  return Date.now() - t0;
}

const cache = new Map();
const hold = await loadHold();
const freezePacked = [];
const devPacked = [];
const promptPacked = [];
const leakPacked = [];
const aePacked = [];
/** @type {number[]} */
let hotMs = [];

try {
  for (const row of [...KB_MOOD_VETO_LAB_MOOD_ROWS, ...KB_MOOD_VETO_LAB_CONTROL_ROWS]) {
    freezePacked.push({
      bucket: freezeBucket(row),
      ...(await scorePacked(hold, row.text, cache))
    });
  }
  for (const row of CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS) {
    if (String(row.label || '').startsWith('crisis-edge')) continue;
    devPacked.push({
      bucket: devBucket(row),
      classId: row.class,
      ...(await scorePacked(hold, row.text, cache))
    });
  }
  for (const row of PROMPT18_ANCHORS) {
    promptPacked.push({
      id: row.id,
      expectProduct: row.expectProduct,
      ...(await scorePacked(hold, row.text, cache))
    });
  }
  for (const row of KB_CATALOG_NEAR_REVIEW_LAB_ROWS.filter((r) => r.role === 'leak')) {
    leakPacked.push(await scorePacked(hold, row.text, cache));
  }
  for (const row of AE_CATALOG) {
    aePacked.push({ id: row.id, ...(await scorePacked(hold, row.text, cache)) });
  }
  for (let i = 0; i < TTFT_N; i++) {
    hotMs.push(await timeAbClassify(hold, TTFT_TEXT));
  }
} finally {
  await hold.dispose();
}

const coldMs = [];
for (let i = 0; i < TTFT_N; i++) {
  const coldHold = await loadHold();
  try {
    coldMs.push(await timeAbClassify(coldHold, TTFT_TEXT));
  } finally {
    await coldHold.dispose();
  }
}

const freezeMoodZh = freezePacked.filter((r) => r.bucket === 'freeze_mood_zh');
const freezeMixed = freezePacked.filter((r) => r.bucket === 'freeze_mixed');
const devMood = devPacked.filter((r) => r.bucket === 'dev_mood');
const devMixed = devPacked.filter((r) => r.bucket === 'dev_mixed');
const devProduct = devPacked.filter((r) => r.bucket === 'dev_product');

function curveRow(margin, fn) {
  const moodFreeze = rate(freezeMoodZh, margin, fn);
  const moodDev = rate(devMood, margin, fn);
  const mixed = rate(devMixed, margin, fn);
  const product = rate(devProduct, margin, fn);
  const p18ok =
    anchorHits(promptPacked, margin, fn, true).hits +
    anchorHits(promptPacked, margin, fn, false).hits;
  const leaks = rate(leakPacked, margin, fn);
  const ae = rate(aePacked, margin, fn);
  return {
    margin,
    freeze_mood_zh: moodFreeze,
    dev_mood: moodDev,
    mood_false_product: {
      hits: moodFreeze.hits + moodDev.hits,
      n: moodFreeze.n + moodDev.n
    },
    dev_mixed: mixed,
    dev_product: product,
    prompt18_match: { hits: p18ok, n: promptPacked.length },
    catalog_leak_product: leaks,
    ae_catalog_product: ae
  };
}

const curveA = PRODUCT_MINUS_MOOD_MARGIN_SWEEP.map((margin) => curveRow(margin, productA));
const curveB = PRODUCT_MINUS_MOOD_MARGIN_SWEEP.map((margin) => curveRow(margin, productB));

function promptDetail(fn, margin) {
  return promptPacked.map((row) => ({
    id: row.id,
    expectProduct: row.expectProduct,
    productPath: fn(row, margin),
    maxDelta: Number(row.maxDelta.toFixed(4)),
    via: decideShadowProductPathB({
      clauses: row.clauses,
      margin,
      floor: PRODUCT_SCORE_FLOOR_CANDIDATE,
      nearMin: ROUTING_NEAR_HIT_MIN
    }).via
  }));
}

const payload = {
  probe: 'routing-arbitration-ab',
  margin_frozen: false,
  product_score_floor_candidate: PRODUCT_SCORE_FLOOR_CANDIDATE,
  near_hit_min: ROUTING_NEAR_HIT_MIN,
  ttft: {
    n: TTFT_N,
    text: TTFT_TEXT,
    cold_ms: coldMs,
    hot_ms: hotMs,
    cold_median: median(coldMs),
    cold_max: Math.max(...coldMs),
    hot_median: median(hotMs),
    hot_max: Math.max(...hotMs)
  },
  freeze_mixed_n: freezeMixed.length,
  curve_a: curveA,
  curve_b: curveB,
  prompt18_a_at_0: promptDetail(productA, 0),
  prompt18_b_at_0: promptDetail(productB, 0),
  prompt18_a_at_05: promptDetail(productA, 0.05),
  prompt18_b_at_05: promptDetail(productB, 0.05)
};

await mkdir(LAB_DIR, { recursive: true });
const jsonPath = path.join(LAB_DIR, `routing-arbitration-ab-${Date.now()}.json`);
await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

function printCurve(name, rows) {
  process.stdout.write(
    `[routing-arb-ab] ${name} margin\tfreeze_mood\tdev_mood\tmood_false\tdev_product\tdev_mixed\tp18\tleak7\tae2\n`
  );
  for (const row of rows) {
    process.stdout.write(
      `${row.margin}\t${pct(row.freeze_mood_zh.hits, row.freeze_mood_zh.n)}\t${pct(row.dev_mood.hits, row.dev_mood.n)}\t${pct(row.mood_false_product.hits, row.mood_false_product.n)}\t${pct(row.dev_product.hits, row.dev_product.n)}\t${pct(row.dev_mixed.hits, row.dev_mixed.n)}\t${pct(row.prompt18_match.hits, row.prompt18_match.n)}\t${pct(row.catalog_leak_product.hits, row.catalog_leak_product.n)}\t${pct(row.ae_catalog_product.hits, row.ae_catalog_product.n)}\n`
    );
  }
}

printCurve('A', curveA);
printCurve('B', curveB);
process.stdout.write(
  `[routing-arb-ab] freeze_mood_zh n=${freezeMoodZh.length} dev_mood n=${devMood.length} (mood_false combines both)\n`
);
process.stdout.write(
  `[routing-arb-ab] ttft cold n=${TTFT_N} median=${median(coldMs)} max=${Math.max(...coldMs)} ms\n`
);
process.stdout.write(
  `[routing-arb-ab] ttft hot n=${TTFT_N} median=${median(hotMs)} max=${Math.max(...hotMs)} ms\n`
);
process.stdout.write(`[routing-arb-ab] json: ${jsonPath}\n`);
