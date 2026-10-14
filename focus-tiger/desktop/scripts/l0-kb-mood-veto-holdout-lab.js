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
 * Validate-only (no quota, no embedding):
 *   ... node desktop/scripts/l0-kb-mood-veto-holdout-lab.js --validate-only
 *
 * Missing / unreadable path → 未封存 (never falls back to the in-repo devset).
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  authorizeHoldoutRun,
  defaultHoldoutResultDir,
  defaultHoldoutRunLogPath,
  formatHoldoutSummaryStdout,
  formatHoldoutValidateStdout,
  hashHoldoutFile,
  parseHoldoutFile,
  recordHoldoutRunOutcome,
  redactHoldoutError,
  resolveHoldoutFilePath,
  scoreHoldoutRow,
  stripHoldoutItem,
  summarizeHoldoutScores,
  validateHoldoutCounts
} from '../../src/core/confide/confideMoodVetoHoldoutLab.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = path.resolve(__dirname, '../..');
const RESULT_DIR = defaultHoldoutResultDir();
const RUN_LOG = process.env.FT_CONFIDE_MOOD_HOLDOUT_RUN_LOG || defaultHoldoutRunLogPath();

function isValidateOnly() {
  return (
    process.argv.includes('--validate-only') ||
    process.env.FT_CONFIDE_MOOD_HOLDOUT_VALIDATE_ONLY === '1'
  );
}

async function main() {
  const validateOnly = isValidateOnly();
  let holdoutPath;
  try {
    holdoutPath = resolveHoldoutFilePath(process.env.FT_CONFIDE_MOOD_HOLDOUT_PATH, FOCUS_TIGER);
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

  if (validateOnly) {
    const report = validateHoldoutCounts(parsed);
    process.stdout.write(formatHoldoutValidateStdout(report));
    process.exit(report.ok ? 0 : 1);
  }

  const {
    L0_EMBEDDING_MODEL_FILENAME,
    L0_EMBEDDING_MODEL_MIN_BYTES
  } = await import('../companion/l0EmbeddingConfig.js');
  const { isGgufCachedAt } = await import('../companion/l0Download.js');
  const { loadEmbeddingHold } = await import('../companion/l1EmbeddingHold.js');
  const {
    getRetrievableProductKnowledgeEntry,
    probeProductKnowledgeCatalog,
    productKnowledgeReplyPassesGuard
  } = await import('../../src/core/confide/confideProductKnowledge.js');
  const { decideKbNearMatch } = await import('../../src/core/confide/kbNearMatch.js');
  const { confideClassify } = await import('../../src/core/confide/confideClassify.js');
  const { CONFIDE_ROUTE } = await import('../../src/core/confide/confideRoutes.js');
  const {
    moodAsideOutranksProductLibrary,
    resolveProductKnowledgeGateAction
  } = await import('../../src/core/confide/confideProductKnowledgeSemantic.js');

  const destPath = process.env.FT_EMBEDDING_GGUF
    ? process.env.FT_EMBEDDING_GGUF
    : process.platform === 'darwin'
      ? path.join(
          os.homedir(),
          'Library',
          'Application Support',
          'Focus Tiger',
          'companion-l0',
          L0_EMBEDDING_MODEL_FILENAME
        )
      : path.join(__dirname, '..', '.l0-cache', L0_EMBEDDING_MODEL_FILENAME);

  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write('[mood-veto-holdout] missing embedding GGUF\n');
    process.exit(2);
  }

  try {
    authorizeHoldoutRun(RUN_LOG, parsed.holdoutSetVersion, {
      filePath: holdoutPath,
      contentSha256: hashHoldoutFile(holdoutPath),
      authorPromptId: parsed.authorPromptId
    });
  } catch (err) {
    process.stderr.write(`[mood-veto-holdout] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  const isSafetyPriority = (route) =>
    route === CONFIDE_ROUTE.SAFETY_REDIRECT || route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS;

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
  recordHoldoutRunOutcome(RUN_LOG, parsed.holdoutSetVersion, holdoutPath, {
    safety_first_ok: summary.safety_first_ok,
    safety_handled: summary.columns.safety_handled,
    safety_leak_to_gate: summary.columns.safety_leak_to_gate,
    safety_miss: summary.columns.safety_miss
  });
  const epoch = Date.now();
  await mkdir(RESULT_DIR, { recursive: true });
  const jsonPath = path.join(RESULT_DIR, `kb-mood-veto-holdout-${epoch}.json`);
  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        probe: 'kb-mood-veto-holdout',
        brief_version: parsed.briefVersion,
        holdout_set_version: parsed.holdoutSetVersion,
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
