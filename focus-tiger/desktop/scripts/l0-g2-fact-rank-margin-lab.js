#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Rank + margin diagnostic. Not product-path. Not a new sealed holdout.
 * Replays voided G2 unseen v1/v2 and a visible development set.
 * Stdout: counts only.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \\
 *     npm run audit:g2-fact-rank-margin
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  catalogEntryEligibleForAskRole,
  classifyConfideProductAskRole
} from '../../src/core/confide/confideProductAskRole.js';
import { catalogEntryEmbeddingPhrases } from '../../src/core/confide/kbNearMatch.js';
import { listRetrievableProductKnowledgeEntries } from '../../src/core/confide/confideProductKnowledge.js';
import { cosineSimilarity, formatQwen3EmbeddingQuery } from '../../src/core/confide/confideSemanticRouting.js';
import {
  decideScoreBand,
  formatRankMarginStdout,
  rankExpectedCard,
  summarizeRankMarginRows
} from '../../src/core/confide/confideG2FactRankMargin.js';
import {
  parseG2FactArrivalFile,
  redactHoldoutError,
  stripG2FactArrivalItem
} from '../../src/core/confide/confideG2FactArrivalLab.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FOCUS_TIGER = path.resolve(__dirname, '../..');
const RESULT_DIR = path.join(os.homedir(), 'Documents', 'ft-private', 'confide-g2-fact-rank-margin-lab');
const PRIVATE_DIR = path.join(os.homedir(), 'Documents', 'ft-private', 'confide-g2-fact-arrival');
const VISIBLE_DEVSET = path.join(
  FOCUS_TIGER,
  'src/core/confide/fixtures/g2-fact-rank-visible-devset.json'
);

const VOIDED_SETS = [
  {
    key: 'unseen-v1',
    file: path.join(PRIVATE_DIR, 'diagnostic-unseen-v1.json'),
    note: 'voided-replay'
  },
  {
    key: 'unseen-v2',
    file: path.join(PRIVATE_DIR, 'diagnostic-unseen-v2.json'),
    note: 'voided-replay'
  }
];

function round4(n) {
  return Number.isFinite(n) ? Math.round(n * 10000) / 10000 : null;
}

function bestScoreByCard(catalogRows, userVector, predicate) {
  /** @type {Map<string, number>} */
  const map = new Map();
  for (const row of catalogRows) {
    if (predicate && !predicate(row)) continue;
    const score = cosineSimilarity(userVector, row.vector);
    const prev = map.get(row.id);
    if (prev == null || score > prev) map.set(row.id, score);
  }
  return map;
}

function toRankRow(meta, scoreMap) {
  const expectedCardId =
    meta.expectedKind === 'product_card' ? meta.expectedCardId : null;
  const ranked = rankExpectedCard(scoreMap, expectedCardId);
  return {
    id: meta.id,
    classId: meta.classId,
    expectedKind: meta.expectedKind,
    expectedCardId,
    rank: ranked.rank,
    expectedScore: round4(ranked.expectedScore),
    nearestWrongId: ranked.nearestWrongId,
    nearestWrongScore: round4(ranked.nearestWrongScore),
    margin: round4(ranked.margin),
    leadMargin: round4(ranked.leadMargin),
    expectedIsTop: ranked.expectedIsTop,
    topId: ranked.topId,
    topScore: round4(ranked.topScore),
    band080: decideScoreBand(ranked.topScore)
  };
}

async function loadVoidedQueries(filePath) {
  const data = JSON.parse(await readFile(filePath, 'utf8'));
  const parsed = parseG2FactArrivalFile(data);
  const queries = [];
  for (const raw of parsed.items) {
    const meta = stripG2FactArrivalItem(raw);
    if (!meta) continue;
    const text = typeof raw.text === 'string' ? raw.text : '';
    const expectedKind = String(meta.expected.kind || '').trim();
    const expectedCardId = String(
      meta.expected.card_id || meta.expected.cardId || ''
    ).trim();
    queries.push({
      id: meta.id,
      classId: meta.classId,
      expectedKind,
      expectedCardId: expectedCardId || null,
      text
    });
  }
  return {
    key: parsed.holdoutSetVersion,
    authorPromptId: parsed.authorPromptId,
    queries
  };
}

async function loadVisibleQueries() {
  const data = JSON.parse(await readFile(VISIBLE_DEVSET, 'utf8'));
  const paraphrases = (data.items || []).map((raw) => ({
    id: String(raw.id),
    classId: String(raw.class_id || raw.classId || 'visible'),
    expectedKind: String(raw.expected?.kind || ''),
    expectedCardId: String(raw.expected?.card_id || raw.expected?.cardId || '') || null,
    text: String(raw.text || ''),
    source: 'paraphrase'
  }));
  const selfQueries = [];
  for (const entry of listRetrievableProductKnowledgeEntries()) {
    const phrases = catalogEntryEmbeddingPhrases(entry);
    const phrase = phrases[0];
    if (!phrase) continue;
    selfQueries.push({
      id: `self-${entry.id}`,
      classId: 'catalog-self',
      expectedKind: 'product_card',
      expectedCardId: entry.id,
      text: phrase,
      source: 'catalog-self'
    });
  }
  return {
    key: data.set_id,
    paraphrases,
    selfQueries
  };
}

async function main() {
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
    process.stderr.write('[g2-rank-margin] missing embedding GGUF\n');
    process.exit(2);
  }

  process.stderr.write('[g2-rank-margin] loading embedding hold (catalog as documents, no Instruct)\n');
  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[g2-rank-margin] ${msg}\n`)
  });

  const catalogRows = [];
  for (const entry of listRetrievableProductKnowledgeEntries()) {
    for (const phrase of catalogEntryEmbeddingPhrases(entry)) {
      catalogRows.push({
        id: entry.id,
        entry,
        vector: await hold.embedText(phrase)
      });
    }
  }
  const catalogCardCount = new Set(catalogRows.map((r) => r.id)).size;
  process.stderr.write(
    `[g2-rank-margin] catalog phrases=${catalogRows.length} cards=${catalogCardCount}\n`
  );

  const visible = await loadVisibleQueries();
  const jobs = [];
  for (const spec of VOIDED_SETS) {
    if (!existsSync(spec.file)) {
      process.stderr.write(`[g2-rank-margin] missing ${spec.key}, skip\n`);
      continue;
    }
    try {
      const loaded = await loadVoidedQueries(spec.file);
      jobs.push({
        label: spec.key,
        note: spec.note,
        authorPromptId: loaded.authorPromptId,
        queries: loaded.queries
      });
    } catch (err) {
      process.stderr.write(`[g2-rank-margin] ${spec.key} ${redactHoldoutError(err)}\n`);
      process.exit(1);
    }
  }
  jobs.push({
    label: 'visible-paraphrase',
    note: 'visible-development',
    authorPromptId: visible.key,
    queries: visible.paraphrases
  });
  jobs.push({
    label: 'visible-catalog-self',
    note: 'visible-development',
    authorPromptId: visible.key,
    queries: visible.selfQueries
  });

  const modes = [
    { name: 'no_instruct', prefix: false },
    { name: 'query_instruct', prefix: true }
  ];

  const report = {
    probe: 'g2-fact-rank-margin',
    not_pass_evidence: true,
    no_new_sealed_holdout: true,
    catalog_card_count: catalogCardCount,
    catalog_phrase_count: catalogRows.length,
    sets: {}
  };

  try {
    for (const job of jobs) {
      report.sets[job.label] = { note: job.note, n: job.queries.length, modes: {} };
      for (const mode of modes) {
        const allRows = [];
        const shapeRows = [];
        for (const q of job.queries) {
          const askRole = classifyConfideProductAskRole(q.text);
          const queryText = mode.prefix ? formatQwen3EmbeddingQuery(q.text) : q.text;
          const userVector = await hold.embedText(queryText);
          const allMap = bestScoreByCard(catalogRows, userVector, null);
          const shapeMap = bestScoreByCard(catalogRows, userVector, (row) =>
            catalogEntryEligibleForAskRole(row.entry, askRole)
          );
          const meta = {
            id: q.id,
            classId: q.classId,
            expectedKind: q.expectedKind,
            expectedCardId: q.expectedCardId
          };
          allRows.push({ ...toRankRow(meta, allMap), askRole, pool: 'all_cards' });
          shapeRows.push({
            ...toRankRow(meta, shapeMap.size ? shapeMap : allMap),
            askRole,
            pool: 'same_shape_or_all_if_empty'
          });
        }
        const block = {
          all_cards: summarizeRankMarginRows(allRows),
          same_shape: summarizeRankMarginRows(shapeRows)
        };
        report.sets[job.label].modes[mode.name] = {
          all_cards: block.all_cards,
          same_shape: block.same_shape
        };
        process.stdout.write(
          formatRankMarginStdout(`${job.label} / ${mode.name} / all-cards`, block.all_cards)
        );
        process.stdout.write(
          formatRankMarginStdout(`${job.label} / ${mode.name} / same-shape`, block.same_shape)
        );
      }
    }
  } finally {
    await hold.dispose?.();
  }

  await mkdir(RESULT_DIR, { recursive: true });
  const outPath = path.join(RESULT_DIR, `g2-fact-rank-margin-${Date.now()}.json`);
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`[g2-rank-margin] json ${outPath}\n`);
  process.stdout.write('[g2-rank-margin] no utterances written; not a new sealed batch\n');
}

main().catch((err) => {
  process.stderr.write(`[g2-rank-margin] ${err?.message || 'fail'}\n`);
  process.exit(1);
});
