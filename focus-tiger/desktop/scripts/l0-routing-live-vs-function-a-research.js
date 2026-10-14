#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Research-only: live send-chain gate vs function A @ frozen 0.01.
 * Uses voided b-v2 / b-v5 and in-repo routing destset v2. No quota.
 * Does not change PRODUCT_MINUS_MOOD_MARGIN or the send path.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \
 *     npm run audit:routing-live-vs-function-a
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
import {
  CONFIDE_SEALED_B_HOLDOUT_CLASS_IDS,
  resolveSealedBExpectedPath,
  scoreRoutingHoldoutRow,
  summarizeRoutingHoldoutScores
} from '../../src/core/confide/confideRoutingClassHoldoutLab.js';
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

async function scoreItem(hold, item) {
  const text = String(item.text || '');
  const classId = classOf(item);
  const expect = String(item.expect || '');
  const expectedPath = resolveSealedBExpectedPath(classId, expect);
  const clauses = [];
  let lastGate = null;
  for (const part of splitUtteranceByPunctuation(text)) {
    const gate = await hold.classifyProductKnowledgeGate(part);
    lastGate = gate;
    clauses.push({
      productScore: Number(gate.score),
      moodScore: Number(gate.moodScore)
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
    classId,
    expectedPath,
    live: scoreRoutingHoldoutRow({ classId, expectedPath, productPath: liveProduct }),
    functionA: scoreRoutingHoldoutRow({ classId, expectedPath, productPath: functionA }),
    maxDelta,
    wholeProduct: Number(whole.score),
    wholeMood: Number(whole.moodScore),
    catalogHit: Boolean(catalog.hit),
    todayAction,
    lastGateProduct: lastGate ? Number(lastGate.score) : null
  };
}

function honestEmptyDiagnosis(rows) {
  const orig42 = rows.slice(0, 42);
  let liveFail = 0;
  let aFail = 0;
  let bothFail = 0;
  let aPassLiveFail = 0;
  let livePassAFail = 0;
  let noProductSignal = 0;
  let marginTie = 0;
  let liveFloorMiss = 0;
  for (const row of orig42) {
    const liveOk = row.live.pass === true;
    const aOk = row.functionA.pass === true;
    if (!liveOk) liveFail += 1;
    if (!aOk) aFail += 1;
    if (!liveOk && !aOk) bothFail += 1;
    if (aOk && !liveOk) aPassLiveFail += 1;
    if (liveOk && !aOk) livePassAFail += 1;
    if (!aOk && Number(row.maxDelta) <= 0) noProductSignal += 1;
    if (!aOk && Number(row.maxDelta) > 0 && Number(row.maxDelta) <= PRODUCT_MINUS_MOOD_MARGIN) {
      marginTie += 1;
    }
    if (!liveOk && Number(row.wholeProduct) < 0.42) liveFloorMiss += 1;
  }
  let likely;
  if (noProductSignal >= bothFail / 2 && bothFail > 0) {
    likely = 'label_noise';
  } else if (aPassLiveFail > livePassAFail) {
    likely = 'live_function';
  } else {
    likely = 'function_a';
  }
  return {
    n_original_honest_empty: orig42.length,
    live_fail: liveFail,
    function_a_fail: aFail,
    both_fail: bothFail,
    a_pass_live_fail: aPassLiveFail,
    live_pass_a_fail: livePassAFail,
    no_product_signal: noProductSignal,
    margin_tie: marginTie,
    live_floor_miss: liveFloorMiss,
    likely
  };
}

function printSummary(label, liveSum, aSum) {
  process.stdout.write(`[routing-research] ${label} margin=${PRODUCT_MINUS_MOOD_MARGIN}\n`);
  for (const id of CONFIDE_SEALED_B_HOLDOUT_CLASS_IDS) {
    const live = liveSum.by_class[id];
    const fnA = aSum.by_class[id];
    const lr = live.pass_rate == null ? 'n/a' : live.pass_rate.toFixed(3);
    const ar = fnA.pass_rate == null ? 'n/a' : fnA.pass_rate.toFixed(3);
    process.stdout.write(
      `[routing-research] ${label} ${id} live ${live.n_pass}/${live.n}=${lr} functionA ${fnA.n_pass}/${fnA.n}=${ar}\n`
    );
  }
}

async function scoreList(hold, items, label) {
  const liveRows = [];
  const aRows = [];
  const honest = [];
  for (const item of items) {
    const scored = await scoreItem(hold, item);
    liveRows.push(scored.live);
    aRows.push(scored.functionA);
    if (scored.classId === 'product-honest-empty') {
      honest.push(scored);
    }
  }
  return {
    label,
    n: items.length,
    live: summarizeRoutingHoldoutScores(liveRows),
    functionA: summarizeRoutingHoldoutScores(aRows),
    honest_empty: honestEmptyDiagnosis(honest)
  };
}

async function main() {
  const destPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write('[routing-research] missing embedding GGUF\n');
    process.exit(2);
  }
  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[routing-research] ${msg}\n`)
  });
  const reports = [];
  try {
    const home = os.homedir();
    for (const name of ['sealed-b-v2.json', 'sealed-b-v5.json']) {
      const p = path.join(home, 'Documents', 'ft-private', 'confide-routing-blind-zh', name);
      const raw = JSON.parse(await readFile(p, 'utf8'));
      reports.push(await scoreList(hold, raw.items || [], name.replace('.json', '')));
    }
    reports.push(await scoreList(hold, CONFIDE_ROUTING_DEVSET_ZH_V2_ITEMS, 'route-devset-v2'));
  } finally {
    await hold.dispose();
  }
  for (const report of reports) {
    printSummary(report.label, report.live, report.functionA);
    const h = report.honest_empty;
    process.stdout.write(
      `[routing-research] ${report.label} honest_empty_orig42 live_fail=${h.live_fail} a_fail=${h.function_a_fail} both=${h.both_fail} no_product_signal=${h.no_product_signal} likely=${h.likely}\n`
    );
  }
  await mkdir(RESULT_DIR, { recursive: true });
  const out = path.join(RESULT_DIR, `routing-live-vs-function-a-${Date.now()}.json`);
  await writeFile(
    out,
    `${JSON.stringify(
      {
        probe: 'routing-live-vs-function-a',
        research_voided: true,
        quota_incremented: false,
        product_minus_mood_margin: PRODUCT_MINUS_MOOD_MARGIN,
        send_path_changed: false,
        reports
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  process.stdout.write(`[routing-research] json: ${out}\n`);
}

main().catch((err) => {
  process.stderr.write(`[routing-research] ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
