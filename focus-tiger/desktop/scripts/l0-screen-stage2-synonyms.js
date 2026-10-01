/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab: screen Prompt 12 synonym variants with real Qwen3-Embedding.
 * Not smoke. Does not patch regex.
 *
 *   cd focus-tiger/desktop && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run companion:stage2-synonym-screen
 *
 * Writes /tmp/ft-l0-lab/stage2-synonym-screen-<epoch>.csv
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
  CONFIDE_STAGE2_SYNONYM_CANDIDATES,
  formatStage2SuggestedCsvRow,
  screenStage2FavorableCandidate,
  stage2SuggestedCsvHeader
} from '../../src/core/confide/confideStage2FavorableScreen.js';

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

async function main() {
  const destPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write(
      `[stage2-synonym-screen] missing embedding GGUF at ${destPath}\n`
    );
    process.exit(2);
  }

  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[stage2-synonym-screen] ${msg}\n`)
  });

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  const kept = [];
  const dropped = [];

  try {
    for (const candidate of CONFIDE_STAGE2_SYNONYM_CANDIDATES) {
      const scored = await hold.classifyUserText(candidate.text);
      const screened = screenStage2FavorableCandidate({
        ...candidate,
        semanticCoarse: scored.bucket,
        scoreA: scored.scoreA,
        scoreB: scored.scoreB,
        grayMargin: scored.grayMargin
      });
      const row = { candidate, screened, scored };
      if (screened.keep) kept.push(row);
      else dropped.push(row);
    }
  } finally {
    await hold.dispose();
  }

  const csvPath = path.join(LAB_ROOT, `stage2-synonym-screen-${Date.now()}.csv`);
  const csv = [
    stage2SuggestedCsvHeader(),
    ...kept.map((row) => formatStage2SuggestedCsvRow(row.screened, row.candidate))
  ].join('\n');
  fs.writeFileSync(csvPath, `${csv}\n`);

  process.stdout.write(
    `[stage2-synonym-screen] pool=${CONFIDE_STAGE2_SYNONYM_CANDIDATES.length} kept=${kept.length} dropped=${dropped.length}\n`
  );
  process.stdout.write(
    '[stage2-synonym-screen] reminder: accelerated rows cannot replace real-chat CSV (floor ≥5–10 labeled disagreements).\n'
  );
  for (const row of kept) {
    process.stdout.write(
      `KEEP ${row.candidate.id} literal=${row.screened.literalCoarse} semantic=${row.screened.semanticCoarse} :: ${row.candidate.text}\n`
    );
  }
  for (const row of dropped) {
    process.stdout.write(
      `DROP ${row.candidate.id} ${row.screened.dropReason} literal=${row.screened.literalCoarse} semantic=${row.scored.bucket} :: ${row.candidate.text}\n`
    );
  }
  process.stdout.write(`[stage2-synonym-screen] csv ${csvPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
