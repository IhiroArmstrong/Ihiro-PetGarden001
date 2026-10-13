#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Catalog / near-hit mood review lab (stage one). Not product-path. Not smoke.
 * Does not write Electron turns.jsonl. Does not change any reply.
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 node desktop/scripts/l0-kb-catalog-near-review-lab.js
 * Optional: FT_EMBEDDING_GGUF=/path
 * Results: /tmp/ft-l0-lab/kb-catalog-near-review-lab-<epoch>.json + .md
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
import { resolveProductKnowledgeGateAction } from '../../src/core/confide/confideProductKnowledgeSemantic.js';
import {
  KB_CATALOG_NEAR_REVIEW_LAB_ROWS,
  reviewCatalogNearHitForMoodAside,
  summarizeKbCatalogNearReviewLab
} from '../../src/core/confide/confideKbCatalogNearReview.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAB_DIR = '/tmp/ft-l0-lab';

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

function fmt(n) {
  return Number.isFinite(Number(n)) ? Number(n).toFixed(4) : 'n/a';
}

const destPath = defaultEmbeddingPath();
if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
  process.stderr.write(`[kb-catalog-near-review-lab] missing embedding GGUF at ${destPath}\n`);
  process.exit(2);
}

const loadStarted = Date.now();
const hold = await loadEmbeddingHold({
  modelPath: destPath,
  env: process.env,
  onProgress: (msg) => process.stderr.write(`[kb-catalog-near-review-lab] ${msg}\n`)
});
const loadMs = Date.now() - loadStarted;

/** @type {object[]} */
const scored = [];
try {
  for (const row of KB_CATALOG_NEAR_REVIEW_LAB_ROWS) {
    const gate = await hold.classifyProductKnowledgeGate(row.text);
    const catalog = probeProductKnowledgeCatalog(row.text);
    let nearAction = null;
    let nearHit = false;
    let nearId = null;
    if (!catalog.hit && Number.isFinite(Number(gate.nearestScore))) {
      const near = decideKbNearMatch({
        nearestId: gate.nearestId,
        nearestScore: gate.nearestScore
      });
      nearAction = near.action;
      if (near.action === 'hit' && near.id) {
        const entry = getRetrievableProductKnowledgeEntry(near.id);
        nearHit = Boolean(entry && productKnowledgeReplyPassesGuard(entry.shortAnswerEn));
        if (nearHit) nearId = near.id;
      }
    }
    const catalogOrNearHit = Boolean(catalog.hit || nearHit);
    const baseline = resolveProductKnowledgeGateAction({
      text: row.text,
      embeddingState: 'ready',
      semanticIsProduct: Boolean(gate.isProduct),
      catalogHit: catalogOrNearHit,
      nearAction,
      lifeOutranksProduct: Boolean(gate.lifeOutranksProduct)
    });
    const review = reviewCatalogNearHitForMoodAside({
      action: baseline,
      moodOutranksProduct: gate.moodOutranksProduct
    });
    scored.push({
      ...row,
      productScore: gate.score,
      moodScore: gate.moodScore,
      nearestId: catalog.hit ? catalog.id : nearId,
      nearestScore: gate.nearestScore,
      catalogLiteralHit: Boolean(catalog.hit),
      nearHit,
      nearAction,
      baseline,
      wouldRelease: review.wouldRelease,
      moodKnown: review.moodKnown
    });
  }
} finally {
  await hold.dispose();
}

const summary = summarizeKbCatalogNearReviewLab(scored);
const epoch = Date.now();
await mkdir(LAB_DIR, { recursive: true });
const jsonPath = path.join(LAB_DIR, `kb-catalog-near-review-lab-${epoch}.json`);
const mdPath = path.join(LAB_DIR, `kb-catalog-near-review-lab-${epoch}.md`);
await writeFile(
  jsonPath,
  `${JSON.stringify(
    {
      probe: 'kb-catalog-near-review-lab',
      coldStart: { holdLoadMs: loadMs },
      summary,
      rows: scored
    },
    null,
    2
  )}\n`,
  'utf8'
);

const lines = [
  `# KB catalog near review lab · ${new Date(epoch).toISOString()}`,
  '',
  'Shadow table only. Replies are unchanged. This file does not authorize stage two.',
  '',
  `Leaks the review would release: ${summary.leak.wouldRelease}/${summary.leak.n} (today still hit: ${summary.leak.baselineHit}).`,
  `Control false releases: ${summary.control.falseRelease.length}.`,
  `Badge caught by the mood review: ${summary.badge.moodReviewWouldRelease.length} (the mood review does not cover the badge sentence).`,
  '',
  '| role | lang | today | would release | mood | product | nearest | text |',
  '|---|---|---|---|---|---|---|---|'
];
for (const r of scored) {
  lines.push(
    `| ${r.role} | ${r.lang} | ${r.baseline} | ${r.wouldRelease ? 'yes' : 'no'} | ${fmt(r.moodScore)} | ${fmt(r.productScore)} | ${r.nearestId || ''} | ${String(r.text).replace(/\|/g, '\\|')} |`
  );
}
await writeFile(mdPath, `${lines.join('\n')}\n`, 'utf8');

process.stdout.write(
  `leaks wouldRelease ${summary.leak.wouldRelease}/${summary.leak.n} baselineHit=${summary.leak.baselineHit} stillHit=${summary.leak.stillHit.length} notHit=${summary.leak.notHit.length}\n`
);
process.stdout.write(
  `control falseRelease=${summary.control.falseRelease.length} baselineHit=${summary.control.baselineHit}/${summary.control.n}\n`
);
process.stdout.write(
  `badge moodReviewWouldRelease=${summary.badge.moodReviewWouldRelease.length} moodReviewCoversBadge=false\n`
);
process.stdout.write(`json: ${jsonPath}\nmd: ${mdPath}\n`);
process.stdout.write(
  '[kb-catalog-near-review-lab] lab only. Stage two needs its own PO nod.\n'
);
