#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Sealed mood-veto / routing holdout lab. Safety layer first, then KB veto.
 * Stdout: column counts + interrogative_positive_pass_rate only — never sentences.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \
 *     FT_CONFIDE_BLIND_HOLDOUT_PATH="$HOME/Documents/ft-private/confide-mood-blind-zh/holdout.json" \
 *     npm run audit:confide-holdout
 *
 * Missing / unreadable / inside the git tree / .secrets / fixtures → 未封存 (exit 2).
 * Never falls back to the in-repo devset.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HOLDOUT_UNSEALED,
  HoldoutRunLimitError,
  HoldoutUnsealedError,
  authorizeHoldoutRun,
  formatHoldoutSummaryLines,
  resolveSealedHoldoutPath,
  scoreHoldoutRow,
  summarizeHoldoutCounts
} from '../../src/core/confide/confideHoldoutSeal.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = path.join(__dirname, '..', '..');
const WORKSPACE_ROOT = path.join(FOCUS_TIGER, '..');
const LAB_DIR = '/tmp/ft-l0-lab';
const DEFAULT_STAMP = path.join(LAB_DIR, 'confide-holdout-runs.json');

function failUnsealed() {
  process.stderr.write(`${HOLDOUT_UNSEALED}\n`);
  process.exit(2);
}

let sealedPath;
try {
  sealedPath = resolveSealedHoldoutPath({
    rawPath: process.env.FT_CONFIDE_BLIND_HOLDOUT_PATH,
    workspaceRoot: WORKSPACE_ROOT,
    homeDir: os.homedir()
  });
} catch (err) {
  if (err instanceof HoldoutUnsealedError) failUnsealed();
  throw err;
}

let parsed;
try {
  parsed = JSON.parse(await readFile(sealedPath, 'utf8'));
} catch {
  failUnsealed();
}

const briefVersion = String(parsed?.meta?.briefVersion || parsed?.briefVersion || '').trim();
const items = Array.isArray(parsed?.items)
  ? parsed.items
  : Array.isArray(parsed)
    ? parsed
    : [];
if (!briefVersion || items.length === 0) failUnsealed();

let run;
try {
  run = authorizeHoldoutRun(
    process.env.FT_CONFIDE_HOLDOUT_STAMP_PATH || DEFAULT_STAMP,
    briefVersion
  );
} catch (err) {
  if (err instanceof HoldoutRunLimitError) {
    process.stderr.write(`[confide-holdout] ${err.message}\n`);
    process.exit(3);
  }
  throw err;
}

const { confideClassify } = await import('../../src/core/confide/confideClassify.js');
const { simulateKbMoodVetoGate } = await import(
  '../../src/core/confide/confideKbMoodVetoLabScore.js'
);
const { L0_EMBEDDING_MODEL_FILENAME, L0_EMBEDDING_MODEL_MIN_BYTES } = await import(
  '../companion/l0EmbeddingConfig.js'
);
const { isGgufCachedAt } = await import('../companion/l0Download.js');
const { loadEmbeddingHold } = await import('../companion/l1EmbeddingHold.js');
const {
  getRetrievableProductKnowledgeEntry,
  probeProductKnowledgeCatalog,
  productKnowledgeReplyPassesGuard
} = await import('../../src/core/confide/confideProductKnowledge.js');
const { decideKbNearMatch } = await import('../../src/core/confide/confideKbNearMatch.js');

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

const destPath = defaultEmbeddingPath();
if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
  process.stderr.write('[confide-holdout] embed_not_ready\n');
  process.exit(2);
}

const hold = await loadEmbeddingHold({
  modelPath: destPath,
  env: process.env,
  onProgress: (msg) => process.stderr.write(`[confide-holdout] ${msg}\n`)
});

/** @type {ReturnType<typeof scoreHoldoutRow>[]} */
const scored = [];
try {
  for (const item of items) {
    const text = typeof item?.text === 'string' ? item.text : '';
    const safetyRoute = confideClassify(text);
    const gate = await hold.classifyProductKnowledgeGate(text);
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
    const sim = simulateKbMoodVetoGate({
      text,
      catalogHit: Boolean(catalog.hit || nearHit),
      nearAction,
      semanticIsProduct: Boolean(gate.isProduct),
      lifeOutranksProduct: Boolean(gate.lifeOutranksProduct),
      productScore: gate.score,
      moodScore: gate.moodScore
    });
    scored.push(
      scoreHoldoutRow({
        classId: String(item.classId || item.class || 'unknown'),
        role: item.role,
        expect: item.expect,
        tags: item.tags,
        safetyRoute,
        withVeto: sim.withVeto
      })
    );
  }
} finally {
  await hold.dispose();
}

const summary = {
  ...summarizeHoldoutCounts(scored),
  briefVersion,
  run
};
process.stdout.write(formatHoldoutSummaryLines(summary));

await mkdir(LAB_DIR, { recursive: true });
const jsonPath = path.join(LAB_DIR, `kb-mood-veto-holdout-${Date.now()}.json`);
await writeFile(jsonPath, `${JSON.stringify({ probe: 'kb-mood-veto-holdout', summary }, null, 2)}\n`);
process.stdout.write(`json: ${jsonPath}\n`);
