#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * G2 fact-arrival diagnostic lab (CR-50). Not product-path. Not smoke.
 * Does **not** consume s-v* / b-v* / mood holdout quota.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \\
 *     FT_CONFIDE_G2_FACT_ARRIVAL_PATH=/absolute/path/outside/workspace.json \\
 *     node desktop/scripts/l0-g2-fact-arrival-lab.js --validate-only
 *
 * Stdout: counts only (no utterances). JSON under ~/Documents/ft-private/confide-g2-fact-arrival-lab/
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { confideClassify } from '../../src/core/confide/confideClassify.js';
import { CONFIDE_ROUTE } from '../../src/core/confide/confideRoutes.js';
import { decideKbNearMatch } from '../../src/core/confide/kbNearMatch.js';
import {
  formatG2FactArrivalStdout,
  formatG2FactArrivalValidateStdout,
  parseG2FactArrivalFile,
  factArrivalActualFromSpoken,
  redactHoldoutError,
  resolveHoldoutFilePath,
  scoreG2FactArrivalRow,
  stripG2FactArrivalItem,
  summarizeG2FactArrivalScores,
  validateG2FactArrivalCounts
} from '../../src/core/confide/confideG2FactArrivalLab.js';
import {
  getRetrievableProductKnowledgeEntry,
  probeProductKnowledgeCatalog,
  productKnowledgeReplyPassesGuard
} from '../../src/core/confide/confideProductKnowledge.js';
import { resolveConfideFactFirstSpeak } from '../../src/core/confide/confideFactFirstSpeak.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = path.resolve(__dirname, '../..');
const RESULT_DIR = path.join(
  os.homedir(),
  'Documents',
  'ft-private',
  'confide-g2-fact-arrival-lab'
);

function isValidateOnly() {
  return (
    process.argv.includes('--validate-only') ||
    process.env.FT_CONFIDE_G2_FACT_ARRIVAL_VALIDATE_ONLY === '1'
  );
}

function isSafetyPriority(route) {
  return (
    route === CONFIDE_ROUTE.SAFETY_REDIRECT || route === CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS
  );
}

async function main() {
  const validateOnly = isValidateOnly();
  let holdoutPath;
  try {
    holdoutPath = resolveHoldoutFilePath(
      process.env.FT_CONFIDE_G2_FACT_ARRIVAL_PATH,
      FOCUS_TIGER
    );
  } catch (err) {
    process.stderr.write(`[g2-fact-arrival] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  let parsed;
  try {
    const data = JSON.parse(await readFile(holdoutPath, 'utf8'));
    parsed = parseG2FactArrivalFile(data);
  } catch (err) {
    process.stderr.write(`[g2-fact-arrival] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  if (validateOnly) {
    const report = validateG2FactArrivalCounts(parsed);
    process.stdout.write(formatG2FactArrivalValidateStdout(report));
    process.exit(report.ok ? 0 : 1);
  }

  const {
    L0_EMBEDDING_MODEL_FILENAME,
    L0_EMBEDDING_MODEL_MIN_BYTES
  } = await import('../companion/l0EmbeddingConfig.js');
  const { isGgufCachedAt } = await import('../companion/l0Download.js');
  const { loadEmbeddingHold } = await import('../companion/l1EmbeddingHold.js');

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
    process.stderr.write('[g2-fact-arrival] missing embedding GGUF\n');
    process.exit(2);
  }

  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[g2-fact-arrival] ${msg}\n`)
  });

  /** @type {ReturnType<typeof scoreG2FactArrivalRow>[]} */
  const scored = [];
  try {
    for (const raw of parsed.items) {
      const meta = stripG2FactArrivalItem(raw);
      if (!meta) continue;
      const text = typeof raw.text === 'string' ? raw.text : '';
      const safetyRoute = confideClassify(text);
      if (isSafetyPriority(safetyRoute)) {
        scored.push(
          scoreG2FactArrivalRow({
            ...meta,
            actual: { kind: 'safety', cardId: null },
            safetyBlocked: true
          })
        );
        continue;
      }

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
      const moodVetoLive = process.env.FT_CONFIDE_KB_MOOD_VETO === 'live';
      const spoken = resolveConfideFactFirstSpeak({
        text,
        catalogResult: catalog,
        embeddingState: 'ready',
        semanticIsProduct: Boolean(gate.isProduct),
        nearestId: gate.nearestId,
        nearestScore: gate.nearestScore,
        helpNearestId: gate.helpNearestId,
        helpNearestScore: gate.helpNearestScore,
        recordKind: gate.recordKind,
        recordScore: gate.recordScore,
        lifeOutranksProduct: Boolean(gate.lifeOutranksProduct),
        moodOutranksProduct: gate.moodOutranksProduct === true,
        moodVetoLive
      });
      const actual = factArrivalActualFromSpoken(spoken);
      scored.push(
        scoreG2FactArrivalRow({
          ...meta,
          actual,
          safetyBlocked: false
        })
      );
    }
  } finally {
    await hold.dispose();
  }

  const summary = summarizeG2FactArrivalScores(scored);
  process.stdout.write(
    formatG2FactArrivalStdout(summary, {
      holdoutSetVersion: parsed.holdoutSetVersion,
      authorPromptId: parsed.authorPromptId
    })
  );

  const epoch = Date.now();
  await mkdir(RESULT_DIR, { recursive: true });
  const jsonPath = path.join(RESULT_DIR, `g2-fact-arrival-${epoch}.json`);
  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        probe: 'g2-fact-arrival',
        holdout_set_version: parsed.holdoutSetVersion,
        author_prompt_id: parsed.authorPromptId,
        mood_veto_live: process.env.FT_CONFIDE_KB_MOOD_VETO === 'live',
        summary
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  process.stdout.write(`[g2-fact-arrival] json: ${jsonPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`[g2-fact-arrival] ${redactHoldoutError(err)}\n`);
  process.exit(1);
});
