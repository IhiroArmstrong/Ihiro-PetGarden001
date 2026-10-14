#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Routing arbitration v1 · first-segment shadow lab.
 * Freeze + dest only. Does not read ft-private. Does not score sealed-b-v2.
 *
 *   cd focus-tiger/desktop && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \\
 *     node scripts/l0-routing-arbitration-shadow-lab.js
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
  getRetrievableProductKnowledgeEntry,
  probeProductKnowledgeCatalog,
  productKnowledgeReplyPassesGuard
} from '../../src/core/confide/confideProductKnowledge.js';
import { decideKbNearMatch } from '../../src/core/confide/kbNearMatch.js';
import {
  KB_MOOD_VETO_LAB_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MOOD_ROWS
} from '../../src/core/confide/confideKbMoodVetoLabSet.js';
import { CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS } from '../../src/core/confide/confideMoodVetoDevsetZhV1.js';
import { KB_CATALOG_NEAR_REVIEW_LAB_ROWS } from '../../src/core/confide/confideKbCatalogNearReview.js';
import {
  resolveProductKnowledgeGateAction
} from '../../src/core/confide/confideProductKnowledgeSemantic.js';
import {
  PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE,
  PRODUCT_MINUS_MOOD_MARGIN_SWEEP,
  arbitrationLayer,
  productClearlyOutranksMood,
  simulateEmbedNotReadyDegrade,
  todayGateLayer
} from '../../src/core/confide/confideRoutingArbitrationShadow.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAB_DIR = '/tmp/ft-l0-lab';

const PROMPT18_ANCHORS = Object.freeze([
  { id: 'A1', expect: 'generate', text: "Today I'm going to ride bicycles. How about you?" },
  { id: 'A2', expect: 'generate', text: 'Who is Duke number?' },
  { id: 'A3', expect: 'generate', text: 'When I see so much' },
  { id: 'A4', expect: 'generate', text: 'You are my good friend I like you how about you' },
  { id: 'A5', expect: 'fatigue_or_generate', text: "I don't want to practice today. I'm a little tired." },
  { id: 'A6', expect: 'kb', text: 'What is ground exercise?' },
  { id: 'A7', expect: 'kb', text: 'focus vs meditation' },
  { id: 'A8', expect: 'kb', text: 'What is meditation?' },
  { id: 'A9', expect: 'kb', text: "What's the difference between focus and meditation?" },
  { id: 'A10', expect: 'honesty', text: 'What is the observation wing?' },
  { id: 'A11', expect: 'mood', text: '冥想这套东西对我根本没用，我快要放弃了' },
  { id: 'A12', expect: 'generate', text: 'Where can I eat noodle?' },
  { id: 'A13', expect: 'generate', text: 'So can I talk to you?' }
]);

const TTFT_PRODUCT_TEXT = '接地练习在哪';

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

function pct(n, d) {
  if (!d) return 'n/a';
  return `${n}/${d}=${(n / d).toFixed(3)}`;
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

function rateProductPath(rows, margin) {
  if (!rows.length) return { n: 0, hits: 0, rate: null };
  const hits = rows.filter((r) =>
    productClearlyOutranksMood(r.productScore, r.moodScore, margin)
  ).length;
  return { n: rows.length, hits, rate: hits / rows.length };
}

async function scoreUtterance(hold, text) {
  const t0 = Date.now();
  const gate = await hold.classifyProductKnowledgeGate(text);
  const classifyMs = Date.now() - t0;
  const catalog = probeProductKnowledgeCatalog(text);
  let nearAction = null;
  let nearHit = false;
  if (!catalog.hit && Number.isFinite(Number(gate.nearestScore))) {
    const near = decideKbNearMatch({
      nearestId: gate.nearestId,
      nearestScore: gate.nearestScore
    });
    nearAction = near.action;
    if (near.action === 'hit' && near.id) {
      const entry = getRetrievableProductKnowledgeEntry(near.id);
      nearHit = Boolean(entry && productKnowledgeReplyPassesGuard(entry.shortAnswerEn));
    }
  }
  const todayAction = resolveProductKnowledgeGateAction({
    text,
    embeddingState: 'ready',
    semanticIsProduct: Boolean(gate.isProduct),
    catalogHit: Boolean(catalog.hit || nearHit),
    nearAction,
    lifeOutranksProduct: Boolean(gate.lifeOutranksProduct),
    moodVetoLive: false
  });
  const productScore = Number(gate.score);
  const moodScore = Number(gate.moodScore);
  const delta = productScore - moodScore;
  return {
    productScore,
    moodScore,
    delta,
    classifyMs,
    today: todayGateLayer(todayAction),
    todayAction,
    newAt0: arbitrationLayer(productClearlyOutranksMood(productScore, moodScore, 0)),
    newAtCandidate: arbitrationLayer(
      productClearlyOutranksMood(productScore, moodScore, PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE)
    )
  };
}

const destPath = defaultEmbeddingPath();
if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
  process.stderr.write('[routing-arb-shadow] missing embedding GGUF\n');
  process.exit(2);
}

const freezeProbe = KB_MOOD_VETO_LAB_MOOD_ROWS.filter((r) => r.lang === 'zh').slice(0, 8);
const cold = freezeProbe.map((row) => {
  const degraded = simulateEmbedNotReadyDegrade(
    { text: row.text, catalogHit: false },
    resolveProductKnowledgeGateAction
  );
  return { waited: false, action: degraded.action, embed_not_ready: degraded.embed_not_ready };
});
const coldWaited = cold.filter((r) => r.waited).length;

const loadStarted = Date.now();
const hold = await loadEmbeddingHold({
  modelPath: destPath,
  env: process.env,
  onProgress: (msg) => process.stderr.write(`[routing-arb-shadow] ${msg}\n`)
});
const loadMs = Date.now() - loadStarted;

/** @type {object[]} */
const freezeScored = [];
/** @type {object[]} */
const devScored = [];
/** @type {object[]} */
const extraScored = [];
let ttftColdMs = null;
let ttftHotMs = null;

try {
  const coldTtft = await scoreUtterance(hold, TTFT_PRODUCT_TEXT);
  ttftColdMs = coldTtft.classifyMs;
  const hotTtft = await scoreUtterance(hold, TTFT_PRODUCT_TEXT);
  ttftHotMs = hotTtft.classifyMs;

  for (const row of [...KB_MOOD_VETO_LAB_MOOD_ROWS, ...KB_MOOD_VETO_LAB_CONTROL_ROWS]) {
    const scored = await scoreUtterance(hold, row.text);
    freezeScored.push({
      ...scored,
      bucket: freezeBucket(row),
      lang: row.lang,
      set: row.set,
      group: row.group,
      text: row.text
    });
  }
  for (const row of CONFIDE_MOOD_VETO_DEVSET_ZH_V1_ITEMS) {
    if (String(row.label || '').startsWith('crisis-edge')) continue;
    const scored = await scoreUtterance(hold, row.text);
    devScored.push({
      ...scored,
      bucket: devBucket(row),
      id: row.id,
      label: row.label,
      text: row.text
    });
  }
  const extraTexts = [
    ...PROMPT18_ANCHORS.map((r) => r.text),
    ...KB_CATALOG_NEAR_REVIEW_LAB_ROWS.map((r) => r.text)
  ];
  const seenExtra = new Set();
  for (const text of extraTexts) {
    if (seenExtra.has(text)) continue;
    seenExtra.add(text);
    extraScored.push({ text, ...(await scoreUtterance(hold, text)) });
  }
} finally {
  await hold.dispose();
}

function bucketRows(list, name) {
  return list.filter((r) => r.bucket === name);
}

const freezeMoodZh = bucketRows(freezeScored, 'freeze_mood_zh');
const freezeMixed = bucketRows(freezeScored, 'freeze_mixed');
const devMood = bucketRows(devScored, 'dev_mood');
const devMixed = bucketRows(devScored, 'dev_mixed');
const devProduct = bucketRows(devScored, 'dev_product');

const curve = PRODUCT_MINUS_MOOD_MARGIN_SWEEP.map((margin) => ({
  margin,
  freeze_mood_zh: rateProductPath(freezeMoodZh, margin),
  dev_mood: rateProductPath(devMood, margin),
  dev_mixed: rateProductPath(devMixed, margin),
  dev_product: rateProductPath(devProduct, margin)
}));

const freezeMixedReport = freezeMixed.map((r) => ({
  lang: r.lang,
  delta: r.delta,
  today: r.today,
  newAt0: r.newAt0,
  newAtCandidate: r.newAtCandidate,
  productScore: r.productScore,
  moodScore: r.moodScore
}));

const destMixedRows = devMixed.map((r) => ({
  id: r.id,
  text: r.text,
  delta: Number(r.delta.toFixed(4)),
  product_gt_mood: r.delta > 0,
  today: r.today,
  newAt0: r.newAt0,
  newAtCandidate: r.newAtCandidate
}));

const requiredTwoCol = [
  ...KB_CATALOG_NEAR_REVIEW_LAB_ROWS.map((r) => ({
    tag: `catalog-${r.role}`,
    text: r.text
  })),
  ...freezeMixed.map((r) => ({ tag: 'freeze-mixed', text: r.text })),
  ...PROMPT18_ANCHORS.map((r) => ({ tag: r.id, text: r.text, expect: r.expect }))
];

function findScored(text) {
  return (
    freezeScored.find((s) => s.text === text) ||
    extraScored.find((s) => s.text === text) ||
    devScored.find((s) => s.text === text)
  );
}

const twoCol = requiredTwoCol.map((row) => {
  const scored = findScored(row.text);
  return {
    tag: row.tag,
    expect: row.expect || null,
    today: scored?.today ?? null,
    newAt0: scored?.newAt0 ?? null,
    newAtCandidate: scored?.newAtCandidate ?? null,
    delta: scored ? Number(scored.delta.toFixed(4)) : null
  };
});

const a13 = PROMPT18_ANCHORS.map((anchor) => {
  const scored = findScored(anchor.text);
  return {
    id: anchor.id,
    expect: anchor.expect,
    today: scored?.today ?? 'unscored_need_embed',
    newAt0: scored?.newAt0 ?? null,
    newAtCandidate: scored?.newAtCandidate ?? null,
    delta: scored ? Number(scored.delta.toFixed(4)) : null
  };
});

const payload = {
  probe: 'routing-arbitration-shadow',
  margin_frozen: false,
  margin_candidate: PRODUCT_MINUS_MOOD_MARGIN_CANDIDATE,
  loadMs,
  ttft: {
    product_text: TTFT_PRODUCT_TEXT,
    cold_ms: ttftColdMs,
    hot_ms: ttftHotMs,
    hot_delta_vs_today_ms: 0,
    note: 'New function reuses classifyProductKnowledgeGate; extra compare is <1ms.'
  },
  cold_start: {
    probed: cold.length,
    waited: coldWaited,
    embed_not_ready: true
  },
  counts: {
    freeze_mood_zh: freezeMoodZh.length,
    freeze_mixed: freezeMixed.length,
    dev_mood: devMood.length,
    dev_mixed: devMixed.length,
    dev_product: devProduct.length
  },
  curve,
  freeze_mixed: freezeMixedReport,
  dest_mixed: destMixedRows,
  two_col_required: twoCol,
  prompt18: a13
};

await mkdir(LAB_DIR, { recursive: true });
const jsonPath = path.join(LAB_DIR, `routing-arbitration-shadow-${Date.now()}.json`);
await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

process.stdout.write('[routing-arb-shadow] curve (product path rate)\n');
process.stdout.write(
  'margin\tfreeze_mood_zh\tdev_mood\tdev_mixed\tdev_product\n'
);
for (const row of curve) {
  process.stdout.write(
    `${row.margin}\t${pct(row.freeze_mood_zh.hits, row.freeze_mood_zh.n)}\t${pct(row.dev_mood.hits, row.dev_mood.n)}\t${pct(row.dev_mixed.hits, row.dev_mixed.n)}\t${pct(row.dev_product.hits, row.dev_product.n)}\n`
  );
}
process.stdout.write('[routing-arb-shadow] freeze_mixed deltas (no dest leak)\n');
for (const row of freezeMixedReport) {
  process.stdout.write(
    `[routing-arb-shadow] freeze_mixed lang=${row.lang} delta=${row.delta.toFixed(4)} today=${row.today} new0=${row.newAt0} newCand=${row.newAtCandidate}\n`
  );
}
process.stdout.write('[routing-arb-shadow] dest_mixed rows\n');
for (const row of destMixedRows) {
  process.stdout.write(
    `[routing-arb-shadow] ${row.id} delta=${row.delta} today=${row.today} new0=${row.newAt0} newCand=${row.newAtCandidate} | ${row.text}\n`
  );
}
process.stdout.write('[routing-arb-shadow] Prompt18\n');
for (const row of a13) {
  process.stdout.write(
    `[routing-arb-shadow] ${row.id} expect=${row.expect} today=${row.today} new0=${row.newAt0} newCand=${row.newAtCandidate} delta=${row.delta}\n`
  );
}
process.stdout.write(
  `[routing-arb-shadow] cold_start waited=${coldWaited}/${cold.length} embed_not_ready=yes\n`
);
process.stdout.write(
  `[routing-arb-shadow] ttft cold_ms=${ttftColdMs} hot_ms=${ttftHotMs} hot_delta_vs_today_ms=0 load_ms=${loadMs}\n`
);
process.stdout.write(`[routing-arb-shadow] json: ${jsonPath}\n`);
