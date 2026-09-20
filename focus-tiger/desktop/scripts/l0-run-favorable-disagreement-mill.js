/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab: run the 60-candidate favorable-disagreement mill with real Qwen3-Embedding.
 * Not smoke. Does not patch regex. Does not authorize Stage 2.
 *
 *   cd focus-tiger/desktop && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run companion:favorable-disagreement-mill
 *
 * Writes /tmp/ft-l0-lab/favorable-disagreement-mill-<epoch>.{csv,json}
 */

import fs from 'node:fs';
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
  CONFIDE_STAGE2_CHALLENGE_CANDIDATES,
  favorableDisagreementMillCsvHeader,
  formatFavorableDisagreementMillCsvRow,
  millFavorableDisagreement,
  summarizeFavorableDisagreementMill
} from '../../src/core/confide/confideFavorableDisagreementMill.js';

const LAB_ROOT = '/tmp/ft-l0-lab';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function defaultEmbeddingPath() {
  const fromEnv = String(process.env.FT_EMBEDDING_GGUF || '').trim();
  if (fromEnv) return fromEnv;
  if (process.env.FT_COMPANION_L1_MODEL_DIR || process.env.FT_COMPANION_L0_MODEL_DIR) {
    const dir = process.env.FT_COMPANION_L1_MODEL_DIR || process.env.FT_COMPANION_L0_MODEL_DIR;
    return path.join(dir, L0_EMBEDDING_MODEL_FILENAME);
  }
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

function pct(n) {
  return `${n}%`;
}

async function main() {
  const destPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write(
      `[favorable-disagreement-mill] missing embedding GGUF at ${destPath}\n`
    );
    process.exit(2);
  }

  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[favorable-disagreement-mill] ${msg}\n`)
  });

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  /** @type {object[]} */
  const milled = [];

  try {
    for (const candidate of CONFIDE_STAGE2_CHALLENGE_CANDIDATES) {
      const scored = await hold.classifyUserText(candidate.text);
      milled.push(
        millFavorableDisagreement(candidate, {
          semanticCoarse: scored.bucket,
          scoreA: scored.scoreA,
          scoreB: scored.scoreB,
          grayMargin: scored.grayMargin
        })
      );
    }
  } finally {
    await hold.dispose();
  }

  const summary = summarizeFavorableDisagreementMill(milled);
  const stamp = Date.now();
  const csvPath = path.join(LAB_ROOT, `favorable-disagreement-mill-${stamp}.csv`);
  const jsonPath = path.join(LAB_ROOT, `favorable-disagreement-mill-${stamp}.json`);
  const csv = [
    favorableDisagreementMillCsvHeader(),
    ...milled.map((row) => formatFavorableDisagreementMillCsvRow(row))
  ].join('\n');
  fs.writeFileSync(csvPath, `${csv}\n`);
  fs.writeFileSync(
    jsonPath,
    `${JSON.stringify({ probe: 'favorable-disagreement-mill', summary, rows: milled }, null, 2)}\n`
  );

  process.stdout.write(
    `[favorable-disagreement-mill] pool=${summary.pool} favorable=${summary.favorable}\n`
  );
  process.stdout.write(
    `[favorable-disagreement-mill] synthetic=${summary.bySource.synthetic} real=${summary.bySource.real} adversarial=${summary.bySource.adversarial} historical=${summary.bySource.historical}\n`
  );
  process.stdout.write(
    `[favorable-disagreement-mill] methods A=${summary.byMethod.A} B=${summary.byMethod.B} C=${summary.byMethod.C}\n`
  );
  process.stdout.write(
    `[favorable-disagreement-mill] literal baseline ${pct(summary.literalBaselinePct)} · semantic accuracy ${pct(summary.semanticAccuracyPct)}\n`
  );
  process.stdout.write(
    `[favorable-disagreement-mill] real minimum (${summary.realMinimum}): ${summary.realMinimumPass ? 'PASS' : 'FAIL'}\n`
  );
  process.stdout.write(
    '[favorable-disagreement-mill] reminder: machine yes is not PO confirmation; synthetic cannot replace real-chat CSV.\n'
  );
  process.stdout.write('[favorable-disagreement-mill] MUST NOT print Stage 2 go-ahead.\n');

  for (const row of milled.filter((item) => item.is_favorable_disagreement === 'yes')) {
    process.stdout.write(
      `KEEP ${row.sample_id} ${row.source}/${row.source_detail} literal=${row.literal_bucket} semantic=${row.semantic_bucket} :: ${row.text}\n`
    );
  }
  for (const row of milled.filter((item) => item.is_favorable_disagreement !== 'yes')) {
    process.stdout.write(
      `DROP ${row.sample_id} ${row.drop_reason} literal=${row.literal_bucket} semantic=${row.semantic_bucket} :: ${row.text}\n`
    );
  }
  process.stdout.write(`[favorable-disagreement-mill] csv ${csvPath}\n`);
  process.stdout.write(`[favorable-disagreement-mill] json ${jsonPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
