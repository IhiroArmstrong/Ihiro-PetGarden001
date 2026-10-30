/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T66 step 2 · Phase A novelty lab (real Qwen3 embedding · Terminal.app · Metal).
 *
 *   cd focus-tiger && npm run audit:mindflow-nebula-step2-phase-a
 *   cd focus-tiger/desktop && npm run companion:mindflow-nebula-step2-phase-a
 *
 * Writes: /tmp/ft-l0-lab/mindflow-nebula-step2-<epoch>.json (no utterances)
 * Not in test:smoke. Exit 2 when embedding GGUF missing.
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
  MINDFLOW_NEBULA_STEP2_BOARD_FIXTURES,
  MINDFLOW_NEBULA_STEP2_NEGATIVE_FIXTURES
} from '../../src/core/mindflowNebula/mindflowNebulaStep2BoardFixtures.js';
import {
  evaluateMindflowNebulaStep2PhaseA,
  summarizeMindflowNebulaStep2PhaseAForExport
} from '../../src/core/mindflowNebula/mindflowNebulaStep2PhaseAEval.js';

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
  return path.join(os.homedir(), '.focus-tiger', 'companion-l0', L0_EMBEDDING_MODEL_FILENAME);
}

async function main() {
  const modelPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(modelPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    console.error('[mindflow-step2-phase-a] missing embedding GGUF:', modelPath);
    process.exit(2);
  }

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  const hold = await loadEmbeddingHold({
    modelPath,
    onProgress: (msg) => console.error(`[mindflow-step2-phase-a] ${msg}`)
  });

  /** @type {import('../../src/core/mindflowNebula/mindflowNebulaStep2PhaseAEval.js').MindflowNebulaStep2BoardVectors[]} */
  const boards = [];
  for (const fixture of MINDFLOW_NEBULA_STEP2_BOARD_FIXTURES) {
    const calibrationVectors = [];
    for (const line of fixture.calibration) {
      calibrationVectors.push(await hold.embedText(line));
    }
    const paraphraseVectors = [];
    for (const line of fixture.paraphrase) {
      paraphraseVectors.push(await hold.embedText(line));
    }
    boards.push({
      id: fixture.id,
      calibrationVectors,
      paraphraseVectors
    });
  }

  const negativeVectors = [];
  for (const line of MINDFLOW_NEBULA_STEP2_NEGATIVE_FIXTURES) {
    negativeVectors.push(await hold.embedText(line));
  }

  await hold.dispose?.();

  const report = evaluateMindflowNebulaStep2PhaseA({ boards, negativeVectors });
  const exported = summarizeMindflowNebulaStep2PhaseAForExport(report);
  exported.generatedAt = new Date().toISOString();
  exported.embeddingModel = path.basename(modelPath);

  const outPath = path.join(LAB_ROOT, `mindflow-nebula-step2-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(exported, null, 2)}\n`, 'utf8');

  console.log(`phaseAPassed=${exported.phaseAPassed}`);
  console.log(`failures=${exported.failures.length}`);
  console.log(`json=${outPath}`);
  process.exit(exported.phaseAPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('[mindflow-step2-phase-a] fatal', err instanceof Error ? err.message : err);
  process.exit(1);
});
