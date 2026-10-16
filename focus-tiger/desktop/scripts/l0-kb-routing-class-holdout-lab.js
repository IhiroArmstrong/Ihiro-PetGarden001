#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Routing-class **holdout** lab. Not product-path. Not smoke. Does not print utterances.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \\
 *     FT_CONFIDE_ROUTING_HOLDOUT_PATH=/absolute/path/outside/workspace.json \\
 *     node desktop/scripts/l0-kb-routing-class-holdout-lab.js --validate-only
 *
 * Scoring consumes the file's one valid run. Scores **function A** (punctuation
 * clauses, max product−mood vs frozen 0.01). Do not score sealed-b-v2 until
 * PO separately nods a blind run. Validate-only does not increment quota.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  authorizeHoldoutRun,
  hashHoldoutFile
} from '../../src/core/confide/confideMoodVetoHoldoutLab.js';
import {
  PRODUCT_MINUS_MOOD_MARGIN,
  decideShadowProductPathA,
  maxClauseProductMinusMood,
  splitUtteranceByPunctuation
} from '../../src/core/confide/confideRoutingArbitrationShadow.js';
import {
  defaultRoutingHoldoutRunLogPath,
  formatRoutingHoldoutSummaryStdout,
  formatRoutingHoldoutValidateStdout,
  parseRoutingHoldoutFile,
  redactHoldoutError,
  resolveHoldoutFilePath,
  scoreRoutingHoldoutRow,
  stripRoutingHoldoutItem,
  summarizeRoutingHoldoutScores,
  validateRoutingHoldoutCounts
} from '../../src/core/confide/confideRoutingClassHoldoutLab.js';
import {
  CR45_BAND_A_CLASS_IDS,
  cr45MixedShapeFromClauses,
  cr45SaltFromHoldoutItemId,
  evaluateCr45ShadowMergeOutcome,
  isCr45AeAnchorHoldoutItem,
  resolveCr45ShadowSecondSegment
} from '../../src/core/confide/confideCr45MixedReplyShadow.js';
import {
  formatCaliberSplitHoldoutStdout,
  scoreBandCHardGateRow,
  summarizeCaliberSplitHoldout
} from '../../src/core/confide/confideRoutingHoldoutCaliberSplit.js';
import {
  resolveHoldoutShadowCatalogId,
  resolveHoldoutShadowDataSource
} from '../../src/core/confide/confideRoutingHoldoutShadowPath.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = path.resolve(__dirname, '../..');
const LAB_DIR = '/tmp/ft-l0-lab';
const RUN_LOG = process.env.FT_CONFIDE_ROUTING_HOLDOUT_RUN_LOG || defaultRoutingHoldoutRunLogPath();

function isValidateOnly() {
  return (
    process.argv.includes('--validate-only') ||
    process.env.FT_CONFIDE_ROUTING_HOLDOUT_VALIDATE_ONLY === '1'
  );
}

async function main() {
  const validateOnly = isValidateOnly();
  let holdoutPath;
  try {
    holdoutPath = resolveHoldoutFilePath(
      process.env.FT_CONFIDE_ROUTING_HOLDOUT_PATH,
      FOCUS_TIGER
    );
  } catch (err) {
    process.stderr.write(`[routing-class-holdout] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  let parsed;
  try {
    const data = JSON.parse(await readFile(holdoutPath, 'utf8'));
    parsed = parseRoutingHoldoutFile(data);
  } catch (err) {
    process.stderr.write(`[routing-class-holdout] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  if (validateOnly) {
    const report = validateRoutingHoldoutCounts(parsed);
    process.stdout.write(formatRoutingHoldoutValidateStdout(report));
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
    process.stderr.write('[routing-class-holdout] missing embedding GGUF\n');
    process.exit(2);
  }

  try {
    authorizeHoldoutRun(RUN_LOG, parsed.holdoutSetVersion, {
      filePath: holdoutPath,
      contentSha256: hashHoldoutFile(holdoutPath),
      authorPromptId: parsed.authorPromptId
    });
  } catch (err) {
    process.stderr.write(`[routing-class-holdout] ${redactHoldoutError(err)}\n`);
    process.exit(1);
  }

  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[routing-class-holdout] ${msg}\n`)
  });

  /** @type {ReturnType<typeof scoreRoutingHoldoutRow>[]} */
  const scored = [];
  /** @type {object[]} */
  const bandARows = [];
  /** @type {object[]} */
  const bandBRows = [];
  /** @type {object[]} */
  const bandCRows = [];
  /** @type {object[]} */
  const bandDAnchors = [];
  try {
    for (const raw of parsed.items) {
      const meta = stripRoutingHoldoutItem(raw);
      if (!meta) continue;
      const text = typeof raw.text === 'string' ? raw.text : '';
      const locale = String(raw.locale || raw.lang || 'zh').trim() || 'zh';
      const clauses = [];
      for (const part of splitUtteranceByPunctuation(text)) {
        const gate = await hold.classifyProductKnowledgeGate(part);
        clauses.push({
          text: part,
          productScore: Number(gate.score),
          moodScore: Number(gate.moodScore),
          gate
        });
      }
      const productPath = decideShadowProductPathA({
        maxDelta: maxClauseProductMinusMood(clauses),
        margin: PRODUCT_MINUS_MOOD_MARGIN
      });
      const rowScore = scoreRoutingHoldoutRow({ ...meta, productPath });
      scored.push(rowScore);

      const wholeGate = await hold.classifyProductKnowledgeGate(text);
      const dataSource = resolveHoldoutShadowDataSource({
        text,
        productPath,
        gate: wholeGate
      });
      const catalogId = resolveHoldoutShadowCatalogId({
        text,
        productPath,
        gate: wholeGate
      });
      bandCRows.push(
        scoreBandCHardGateRow({
          classId: meta.classId,
          text,
          dataSource,
          catalogId
        })
      );

      if (isCr45AeAnchorHoldoutItem(raw)) {
        bandDAnchors.push({
          id: String(raw.id || ''),
          pass: dataSource === 'product_knowledge'
        });
      }

      if (CR45_BAND_A_CLASS_IDS.includes(meta.classId)) {
        const { productIdx } = cr45MixedShapeFromClauses(clauses);
        const productClause = clauses[productIdx] || clauses[0] || { text: '' };
        const second = resolveCr45ShadowSecondSegment(productClause.text);
        const cr45 = evaluateCr45ShadowMergeOutcome({
          text,
          clauses,
          locale,
          salt: cr45SaltFromHoldoutItemId(raw.id),
          aeAnchor: isCr45AeAnchorHoldoutItem(raw),
          classId: meta.classId,
          secondKind: second.kind,
          canonicalSecondText: second.canonicalSecondText,
          actualSecondText: second.actualSecondText
        });
        bandARows.push({
          classId: meta.classId,
          pathPass: rowScore.pass === true,
          mergeStructPass: cr45.mergeStructurallyCorrect
        });
      } else if (meta.classId === 'life-emotion' || meta.classId === 'chitchat') {
        bandBRows.push({ classId: meta.classId, pass: rowScore.pass === true });
      }
    }
  } finally {
    await hold.dispose();
  }

  const summary = summarizeRoutingHoldoutScores(scored);
  const caliber = summarizeCaliberSplitHoldout({
    bandARows,
    bandBRows,
    bandCRows,
    bandDAnchors
  });
  const epoch = Date.now();
  await mkdir(LAB_DIR, { recursive: true });
  const jsonPath = path.join(LAB_DIR, `kb-routing-class-holdout-${epoch}.json`);
  await writeFile(
    jsonPath,
    `${JSON.stringify(
      {
        probe: 'kb-routing-class-holdout',
        brief_version: parsed.briefVersion,
        holdout_set_version: parsed.holdoutSetVersion,
        product_minus_mood_margin: PRODUCT_MINUS_MOOD_MARGIN,
        summary,
        caliber_split: caliber
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  process.stdout.write(formatRoutingHoldoutSummaryStdout(summary));
  process.stdout.write(formatCaliberSplitHoldoutStdout(caliber));
  process.stdout.write(`[routing-class-holdout] json: ${jsonPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`[routing-class-holdout] ${redactHoldoutError(err)}\n`);
  process.exit(1);
});
