/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Phase 0c measurement only.
 * Not imported by production. Does not read sealed files or write utterances.
 *
 *   cd focus-tiger && node tools/embedding-bakeoff/eos-variant-measure.mjs
 */
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { catalogEntryEmbeddingPhrases } from '../../src/core/confide/kbNearMatch.js';
import { listRetrievableProductKnowledgeEntries } from '../../src/core/confide/confideProductKnowledge.js';
import { CONFIDE_SEMANTIC_CRISIS_PROTOTYPES } from '../../src/core/confide/confideSemanticCrisisExamples.js';
import {
  cosineSimilarity,
  formatQwen3EmbeddingInput
} from '../../src/core/confide/confideSemanticRouting.js';

const require = createRequire(new URL('../../desktop/package.json', import.meta.url));
const { getLlama } = await import(pathToFileURL(require.resolve('node-llama-cpp')).href);
const tokenizerUtils = pathToFileURL(
  path.join(path.dirname(require.resolve('node-llama-cpp')), 'utils/tokenizerUtils.js')
).href;
const { resolveBeginningTokenToPrepend, resolveEndTokenToAppend } = await import(tokenizerUtils);

const modelPath = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'Focus Tiger',
  'companion-l0',
  'Qwen3-Embedding-0.6B-Q8_0.gguf'
);
const devsetPath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../../src/core/confide/fixtures/g2-fact-rank-visible-devset.json'
);

function round4(n) {
  return Number.isFinite(n) ? Math.round(n * 10000) / 10000 : null;
}

function dist(values) {
  const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (sorted.length === 0) return { n: 0, min: null, median: null, p90: null, max: null };
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const p90 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.9) - 1)];
  return {
    n: sorted.length,
    min: round4(sorted[0]),
    median: round4(median),
    p90: round4(p90),
    max: round4(sorted[sorted.length - 1])
  };
}

const llama = await getLlama();
const model = await llama.loadModel({ modelPath });
const context = await model.createEmbeddingContext({ contextSize: 512, batchSize: 512 });
const beginToken = resolveBeginningTokenToPrepend(model.vocabularyType, model.tokens);
const endToken = resolveEndTokenToAppend(model.vocabularyType, model.tokens);

function surface(text, variant) {
  const raw = String(text ?? '').trim();
  return variant === 'V0' ? formatQwen3EmbeddingInput(raw) : raw;
}

function resolvedTokens(text, variant) {
  const seq = model.tokenize(surface(text, variant), false);
  if (beginToken != null && seq[0] !== beginToken) seq.unshift(beginToken);
  if (endToken != null && seq.at(-1) !== endToken) seq.push(endToken);
  return seq;
}

async function embed(text, variant) {
  const result = await context.getEmbeddingFor(surface(text, variant));
  return result.vector;
}

const meta = model.fileInsights?.ggufFileInfo?.metadata ?? {};
const poolKeys = [];
function walk(node, prefix) {
  if (!node || typeof node !== 'object' || poolKeys.length > 30) return;
  for (const [key, value] of Object.entries(node)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (/pool/i.test(key) || /pool/i.test(String(value))) {
      poolKeys.push({ key: next, value: typeof value === 'object' ? '[object]' : value });
    } else if (value && typeof value === 'object') {
      walk(value, next);
    }
  }
}
walk(meta, '');

const entries = listRetrievableProductKnowledgeEntries();
const cardRows = [];
for (const entry of entries) {
  for (const phrase of catalogEntryEmbeddingPhrases(entry)) {
    cardRows.push({ id: entry.id, phrase });
  }
}
const cardV0 = [];
const cardV1 = [];
for (const row of cardRows) {
  cardV0.push(await embed(row.phrase, 'V0'));
  cardV1.push(await embed(row.phrase, 'V1'));
}

const anchors = CONFIDE_SEMANTIC_CRISIS_PROTOTYPES.map((row) => ({ id: row.id }));
const anchorV0 = [];
const anchorV1 = [];
for (const row of CONFIDE_SEMANTIC_CRISIS_PROTOTYPES) {
  anchorV0.push(await embed(row.text, 'V0'));
  anchorV1.push(await embed(row.text, 'V1'));
}

function bestByCard(vector, bank) {
  const best = new Map();
  for (let i = 0; i < cardRows.length; i += 1) {
    const score = cosineSimilarity(vector, bank[i]);
    const id = cardRows[i].id;
    const prev = best.get(id);
    if (prev == null || score > prev) best.set(id, score);
  }
  return [...best.entries()].sort((a, b) => b[1] - a[1]);
}

function rankRow(vector, expectedId, bank) {
  const ranked = bestByCard(vector, bank);
  const rank = expectedId ? ranked.findIndex(([id]) => id === expectedId) + 1 : null;
  const expectedScore = expectedId ? ranked.find(([id]) => id === expectedId)?.[1] : null;
  return {
    rank: rank === 0 ? null : rank,
    expectedScore: round4(expectedScore),
    topId: ranked[0]?.[0] ?? null,
    topScore: round4(ranked[0]?.[1]),
    secondId: ranked[1]?.[0] ?? null,
    secondScore: round4(ranked[1]?.[1]),
    gapTop1Top2: round4((ranked[0]?.[1] ?? 0) - (ranked[1]?.[1] ?? 0))
  };
}

const dev = JSON.parse(await readFile(devsetPath, 'utf8'));
const queries = [];
for (const item of dev.items) {
  const expectedId = item.expected?.kind === 'product_card' ? item.expected.card_id : null;
  const v0 = await embed(item.text, 'V0');
  const v1 = await embed(item.text, 'V1');
  queries.push({
    id: item.id,
    classId: item.class_id,
    expectedKind: item.expected?.kind,
    expectedId,
    tokenTailV0: resolvedTokens(item.text, 'V0').slice(-6),
    tokenTailV1: resolvedTokens(item.text, 'V1').slice(-6),
    tailsDiffer: JSON.stringify(resolvedTokens(item.text, 'V0').slice(-6)) !==
      JSON.stringify(resolvedTokens(item.text, 'V1').slice(-6)),
    v0vec: v0,
    v1vec: v1,
    V0: rankRow(v0, expectedId, cardV0),
    V1: rankRow(v1, expectedId, cardV1)
  });
}

function hits(side, threshold) {
  let cardHit = 0;
  let cardN = 0;
  let noCardFalse = 0;
  let noCardN = 0;
  for (const row of queries) {
    const ranked = row[side];
    if (row.expectedKind === 'product_card') {
      cardN += 1;
      if (ranked.rank === 1 && ranked.expectedScore >= threshold) cardHit += 1;
    } else {
      noCardN += 1;
      if (ranked.topScore >= threshold) noCardFalse += 1;
    }
  }
  return { threshold, cardHit, cardN, noCardFalse, noCardN };
}

function maxAgainstAnchors(vector, bank) {
  let max = -1;
  let maxId = null;
  for (let i = 0; i < bank.length; i += 1) {
    const score = cosineSimilarity(vector, bank[i]);
    if (score > max) {
      max = score;
      maxId = anchors[i].id;
    }
  }
  return { max: round4(max), anchorId: maxId };
}

const cardDrift = cardRows.map((row, i) => cosineSimilarity(cardV0[i], cardV1[i]));
const anchorDrift = anchorV0.map((vector, i) => cosineSimilarity(vector, anchorV1[i]));
const queryDrift = queries.map((row) => cosineSimilarity(row.v0vec, row.v1vec));

const queryMaxV0 = queries.map((row) => maxAgainstAnchors(row.v0vec, anchorV0).max);
const queryMaxV1 = queries.map((row) => maxAgainstAnchors(row.v1vec, anchorV1).max);
const cardMaxV0 = cardV0.map((vector) => maxAgainstAnchors(vector, anchorV0).max);
const cardMaxV1 = cardV1.map((vector) => maxAgainstAnchors(vector, anchorV1).max);

const report = {
  setId: dev.set_id,
  eosToken: model.tokens.eos,
  shouldAppendEosToken: model.tokens.shouldAppendEosToken,
  beginToken,
  endToken,
  poolKeys,
  nCards: cardRows.length,
  nAnchors: anchors.length,
  nQueries: queries.length,
  tailsDifferCount: queries.filter((row) => row.tailsDiffer).length,
  rows: queries.map(({ v0vec, v1vec, ...rest }) => rest),
  hits: {
    V0: [0.62, 0.76, 0.8].map((t) => hits('V0', t)),
    V1: [0.62, 0.76, 0.8].map((t) => hits('V1', t))
  },
  drift: {
    cards: dist(cardDrift),
    anchors: dist(anchorDrift),
    queries: dist(queryDrift)
  },
  maxCosineToAnchors: {
    cardsV0: dist(cardMaxV0),
    cardsV1: dist(cardMaxV1),
    queriesV0: dist(queryMaxV0),
    queriesV1: dist(queryMaxV1),
    cardsPlusQueriesV0: dist([...cardMaxV0, ...queryMaxV0]),
    cardsPlusQueriesV1: dist([...cardMaxV1, ...queryMaxV1])
  }
};

await writeFile('/tmp/ft-eos-variant.json', `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(
  `tailsDiffer=${report.tailsDifferCount}/${report.nQueries} cards=${report.nCards} anchors=${report.nAnchors}\n`
);
await context.dispose();
