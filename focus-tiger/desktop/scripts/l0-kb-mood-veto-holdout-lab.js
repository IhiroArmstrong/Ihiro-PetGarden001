#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Mood-veto **holdout** lab. Not product-path. Not smoke. Does not print utterances.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \\
 *     FT_CONFIDE_MOOD_HOLDOUT_PATH=/absolute/path/outside/workspace.json \\
 *     node desktop/scripts/l0-kb-mood-veto-holdout-lab.js
 *
 * Missing / unreadable path → 未封存 (never falls back to the in-repo devset).
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
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
import { confideClassify } from '../../src/core/confide/confideClassify.js';
import { CONFIDE_ROUTE } from '../../src/core/confide/confideRoutes.js';
import {
  moodAsideOutranksProductLibrary,
  resolveProductKnowledgeGateAction
} from '../../src/core/confide/confideProductKnowledgeSemantic.js';
import {
  CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION,
  authorizeHoldoutRun,
  formatHoldoutSummaryStdout,
  parseHoldoutFile,
  redactHoldoutError,
  resolveHoldoutFilePath,
  scoreHoldoutRow,
  stripHoldoutItem,
  summarizeHoldoutScores
} from '../../src/core/confide/confideMoodVetoHoldoutLab.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = path.resolve(__dirname, '../..');
const LAB_DIR = '/tmp/ft-l0-lab';
const RUN_LOG = path.join(LAB_DIR, 'mood-veto-holdout-runs.json');

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

function isSafetyPriority(route) {
  return route === CONFIDE_ROUTE.SAFETY_REDIRECT || route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS;
}

async function main() {
  let holdoutPath;
  try {
    holdoutPath = resolveHoldoutFilePath(process.env.FT_CONFIDE_MOOD_HOLDOUT_PATH, FOCUS_TIGER);
  } catch (err) {
    process.stderr.write(`[mood-veto-holdout] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  const destPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write('[mood-veto-holdout] missing embedding GGUF\n');
    process.exit(2);
  }

  try {
    authorizeHoldoutRun(RUN_LOG, CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION);
  } catch (err) {
    process.stderr.write(`[mood-veto-holdout] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  let parsed;
  try {
    const data = JSON.parse(await readFile(holdoutPath, 'utf8'));
    parsed = parseHoldoutFile(data);
  } catch (err) {
    process.stderr.write(`[mood-veto-holdout] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[mood-veto-holdout] ${msg}\n`)
  });

  /** @type {ReturnType<typeof scoreHoldoutRow>[]} */
  const scored = [];
  try {
    for (const raw of parsed.items) {
      const meta = stripHoldoutItem(raw);
      if (!meta) continue;
      const text = typeof raw.text === 'string' ? raw.text : '';
      const safetyRoute = confideClassify(text);
      let gateAction = null;
      let reachedGate = false;
      if (!isSafetyPriority(safetyRoute)) {
        reachedGate = true;
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
        const moodOutranksProduct = moodAsideOutranksProductLibrary(
          gate.score,
          gate.moodScore
        );
        gateAction = resolveProductKnowledgeGateAction({
          text,
          embeddingState: 'ready',
          semanticIsProduct: Boolean(gate.isProduct),
          catalogHit: Boolean(catalog.hit || nearHit),
          nearAction,
          lifeOutranksProduct: Boolean(gate.lifeOutranksProduct),
          moodOutranksProduct,
          moodVetoLive: true
        });
      }
      scored.push(
        scoreHoldoutRow({
          ...meta,
          safetyRoute,
          gateAction,
          reachedGate
        })
      );
    }
  } finally {
    await hold.dispose();
  }

  const summary = summarizeHoldoutScores(scored);
  const epoch = Date.now();
  await mkdir(LAB_DIR, { recursive: true });
  const jsonPath = path.join(LAB_DIR, `kb-mood-veto-holdout-${epoch}.json`);
  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        probe: 'kb-mood-veto-holdout',
        brief_version: CONFIDE_MOOD_HOLDOUT_BRIEF_VERSION,
        summary
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  process.stdout.write(formatHoldoutSummaryStdout(summary));
  process.stdout.write(`[mood-veto-holdout] json: ${jsonPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`[mood-veto-holdout] ${redactHoldoutError(err)}\n`);
  process.exit(1);
});
