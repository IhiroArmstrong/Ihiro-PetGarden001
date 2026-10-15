#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Research-only: ask-feature vs vent on voided b-v2 / b-v5 + routing destset v2.
 * Same embedding as the product/mood gate. Grouped by `dim` (template).
 * Does not increment holdout quota. Does not change 0.01 or the send path.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \
 *     npm run audit:routing-intent-feasibility
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getRetrievableProductKnowledgeEntry,
  probeProductKnowledgeCatalog,
  productKnowledgeReplyPassesGuard
} from '../../src/core/confide/confideProductKnowledge.js';
import { decideKbNearMatch } from '../../src/core/confide/kbNearMatch.js';
import { resolveProductKnowledgeGateAction } from '../../src/core/confide/confideProductKnowledgeSemantic.js';
import { CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS } from '../../src/core/confide/confideRoutingDevsetZhV2.js';
import {
  PRODUCT_MINUS_MOOD_MARGIN,
  decideShadowProductPathA,
  maxClauseProductMinusMood,
  splitUtteranceByPunctuation,
  todayGateLayer
} from '../../src/core/confide/confideRoutingArbitrationShadow.js';
import { confideClassify } from '../../src/core/confide/confideClassify.js';
import { CONFIDE_EMOTION_BUCKETS } from '../../src/core/confide/confideRoutes.js';
import {
  bothIntentMetrics,
  emotionHalfMayMerge,
  goldIntentFromClass,
  intentFromProductMinusMood,
  intentFromProductPath,
  leaveOneTemplateOutMargin,
  percentileSorted,
  templateGroupOf
} from '../../src/core/confide/confideRoutingIntentFeasibility.js';
import {
  L0_EMBEDDING_MODEL_FILENAME,
  L0_EMBEDDING_MODEL_MIN_BYTES
} from '../companion/l0EmbeddingConfig.js';
import { isGgufCachedAt } from '../companion/l0Download.js';
import { loadEmbeddingHold } from '../companion/l1EmbeddingHold.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULT_DIR = path.join(os.homedir(), 'Documents', 'ft-private', 'confide-research-2026-10-15');

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

function liveActionFromGate(text, gate, catalogHit) {
  let nearAction = null;
  let nearHit = false;
  if (!catalogHit && Number.isFinite(Number(gate.nearestScore))) {
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
  return resolveProductKnowledgeGateAction({
    text,
    embeddingState: 'ready',
    semanticIsProduct: Boolean(gate.isProduct),
    catalogHit: Boolean(catalogHit || nearHit),
    nearAction,
    lifeOutranksProduct: Boolean(gate.lifeOutranksProduct),
    moodVetoLive: false
  });
}

function classOf(item) {
  return String(item.class_id || item.classId || item.class || item.label || '');
}

function fmtMetrics(m) {
  const cell = (side) => {
    const p = side.precision == null ? 'n/a' : side.precision.toFixed(3);
    const r = side.recall == null ? 'n/a' : side.recall.toFixed(3);
    const f = side.f1 == null ? 'n/a' : side.f1.toFixed(3);
    return `P=${p} R=${r} F1=${f} n=${side.support}`;
  };
  const acc = m.accuracy == null ? 'n/a' : m.accuracy.toFixed(3);
  const macro = m.macro_f1 == null ? 'n/a' : m.macro_f1.toFixed(3);
  return `acc=${acc} macroF1=${macro} ask[${cell(m.ask_feature)}] vent[${cell(m.vent)}]`;
}

async function scoreItem(hold, item) {
  const text = String(item.text || '');
  const classId = classOf(item);
  const gold = goldIntentFromClass(classId);
  const clauses = [];
  for (const part of splitUtteranceByPunctuation(text)) {
    const gate = await hold.classifyProductKnowledgeGate(part);
    const bucket = confideClassify(part);
    clauses.push({
      productScore: Number(gate.score),
      moodScore: Number(gate.moodScore),
      emotionBucket: bucket,
      functionA: decideShadowProductPathA({
        maxDelta: Number(gate.score) - Number(gate.moodScore),
        margin: PRODUCT_MINUS_MOOD_MARGIN
      })
    });
  }
  const whole = await hold.classifyProductKnowledgeGate(text);
  const catalog = probeProductKnowledgeCatalog(text);
  const todayAction = liveActionFromGate(text, whole, catalog.hit);
  const liveProduct = todayGateLayer(todayAction) !== 'mood_or_generate';
  const maxDelta = maxClauseProductMinusMood(clauses);
  const functionA = decideShadowProductPathA({
    maxDelta,
    margin: PRODUCT_MINUS_MOOD_MARGIN
  });
  return {
    id: String(item.id || ''),
    classId,
    gold,
    group: templateGroupOf(item),
    liveProduct,
    functionA,
    wholeProduct: Number(whole.score),
    wholeMood: Number(whole.moodScore),
    maxDelta,
    clauses,
    text
  };
}

function intentRows(scored) {
  return scored
    .filter((row) => row.gold)
    .map((row) => ({
      group: row.group,
      gold: row.gold,
      product: row.wholeProduct,
      mood: row.wholeMood,
      live: intentFromProductPath(row.liveProduct),
      functionA: intentFromProductPath(row.functionA),
      cvFeature: intentFromProductMinusMood(row.wholeProduct, row.wholeMood, 0)
    }));
}

function methodMetrics(rows, predKey) {
  return bothIntentMetrics(
    rows.map((row) => row.gold),
    rows.map((row) => row[predKey])
  );
}

function honestEmptyAFails(scored) {
  return scored
    .filter((row) => row.classId === 'product-honest-empty')
    .slice(0, 42)
    .filter((row) => row.functionA !== true)
    .map((row) => ({
      id: row.id,
      group: row.group,
      maxDelta: row.maxDelta,
      wholeProduct: row.wholeProduct,
      wholeMood: row.wholeMood,
      liveProduct: row.liveProduct,
      text: row.text
    }));
}

function moodFloorFromDevset(scored) {
  const moodScores = [];
  for (const row of scored) {
    if (row.classId !== 'mixed' && row.classId !== 'mixed-emotion-dominant') continue;
    for (const clause of row.clauses) {
      if (clause.functionA === true) continue;
      moodScores.push(Number(clause.moodScore));
    }
  }
  const floor = percentileSorted(moodScores, 0.05);
  return { n: moodScores.length, floor: floor == null ? null : Math.round(floor * 1000) / 1000 };
}

function mergeGateStats(scored, moodFloor) {
  let emotionHalves = 0;
  let pass = 0;
  for (const row of scored) {
    for (const clause of row.clauses) {
      if (clause.functionA === true) continue;
      emotionHalves += 1;
      if (
        emotionHalfMayMerge({
          moodScore: clause.moodScore,
          emotionBucket: clause.emotionBucket,
          moodFloor,
          emotionBuckets: CONFIDE_EMOTION_BUCKETS
        })
      ) {
        pass += 1;
      }
    }
  }
  return { emotion_halves: emotionHalves, pass, fail: emotionHalves - pass };
}

function printBlock(label, rows, cv) {
  process.stdout.write(`[intent-research] ${label} n=${rows.length}\n`);
  process.stdout.write(`[intent-research] ${label} live ${fmtMetrics(methodMetrics(rows, 'live'))}\n`);
  process.stdout.write(
    `[intent-research] ${label} functionA ${fmtMetrics(methodMetrics(rows, 'functionA'))}\n`
  );
  process.stdout.write(
    `[intent-research] ${label} groupedCV ${fmtMetrics(cv.pooled)} groups=${cv.groups} fitMarginOnTrain\n`
  );
}

async function scoreList(hold, items) {
  const scored = [];
  for (const item of items) {
    scored.push(await scoreItem(hold, item));
  }
  return scored;
}

async function main() {
  const destPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write('[intent-research] missing embedding GGUF\n');
    process.exit(2);
  }
  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[intent-research] ${msg}\n`)
  });
  const packs = [];
  try {
    const home = os.homedir();
    for (const name of ['sealed-b-v2.json', 'sealed-b-v5.json']) {
      const p = path.join(home, 'Documents', 'ft-private', 'confide-routing-blind-zh', name);
      const raw = JSON.parse(await readFile(p, 'utf8'));
      packs.push({ label: name.replace('.json', ''), scored: await scoreList(hold, raw.items || []) });
    }
    packs.push({
      label: 'route-devset-v2',
      scored: await scoreList(hold, CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS)
    });
  } finally {
    await hold.dispose();
  }

  const combined = packs.flatMap((pack) => pack.scored);
  const reports = [];
  for (const pack of [...packs, { label: 'voided-plus-devset', scored: combined }]) {
    const rows = intentRows(pack.scored);
    const cv = leaveOneTemplateOutMargin(rows);
    printBlock(pack.label, rows, cv);
    reports.push({
      label: pack.label,
      n: rows.length,
      live: methodMetrics(rows, 'live'),
      functionA: methodMetrics(rows, 'functionA'),
      grouped_cv: { groups: cv.groups, pooled: cv.pooled }
    });
  }

  const b2 = packs.find((pack) => pack.label === 'sealed-b-v2');
  const aFails = honestEmptyAFails(b2.scored);
  process.stdout.write(
    `[intent-research] honest_empty_orig42 function_a_fail=${aFails.length} (texts in private json only)\n`
  );

  const dest = packs.find((pack) => pack.label === 'route-devset-v2');
  const floorInfo = moodFloorFromDevset(dest.scored);
  const destMerge = mergeGateStats(dest.scored, floorInfo.floor ?? 0);
  process.stdout.write(
    `[intent-research] destset emotion_mood_floor_p05=${floorInfo.floor} n=${floorInfo.n} merge_gate pass=${destMerge.pass}/${destMerge.emotion_halves}\n`
  );

  await mkdir(RESULT_DIR, { recursive: true });
  const stamp = Date.now();
  const out = path.join(RESULT_DIR, `routing-intent-feasibility-${stamp}.json`);
  const failsOut = path.join(RESULT_DIR, `honest-empty-a-fail-${stamp}.json`);
  await writeFile(
    failsOut,
    `${JSON.stringify({ n: aFails.length, items: aFails }, null, 2)}\n`,
    'utf8'
  );
  await writeFile(
    out,
    `${JSON.stringify(
      {
        probe: 'routing-intent-feasibility',
        research_voided: true,
        quota_incremented: false,
        product_minus_mood_margin: PRODUCT_MINUS_MOOD_MARGIN,
        send_path_changed: false,
        destset_emotion_mood_floor_p05: floorInfo,
        destset_merge_gate: destMerge,
        reports,
        honest_empty_a_fail_n: aFails.length,
        honest_empty_a_fail_file: failsOut
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  process.stdout.write(`[intent-research] json: ${out}\n`);
}

main().catch((err) => {
  process.stderr.write(`[intent-research] ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
