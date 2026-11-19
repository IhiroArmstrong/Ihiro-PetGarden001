/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Route X isolation lab (real Qwen3 embedding · Terminal.app · Metal).
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run audit:noticing-one-line-isolation
 *
 * Writes: /tmp/ft-l0-lab/noticing-one-line-isolation-<epoch>.json (no utterances)
 * Not in test:smoke. Exit 2 when embedding GGUF missing.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CONFIDE_SEMANTIC_CRISIS_PROTOTYPES } from '../../src/core/confide/confideSemanticCrisisExamples.js';
import { NOTICING_ONE_LINE_ISOLATION_FIXTURES } from '../../src/core/noticingOneLine/noticingOneLineIsolationFixtures.js';
import {
  evaluateNoticingOneLineIsolation,
  summarizeNoticingOneLineIsolationForExport
} from '../../src/core/noticingOneLine/noticingOneLineIsolationEval.js';
import { isGgufCachedAt } from '../companion/l0Download.js';
import {
  L0_EMBEDDING_MODEL_FILENAME,
  L0_EMBEDDING_MODEL_MIN_BYTES
} from '../companion/l0EmbeddingConfig.js';
import { loadEmbeddingHold } from '../companion/l1EmbeddingHold.js';

const LAB_ROOT = '/tmp/ft-l0-lab';

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
    console.error('[noticing-isolation] missing embedding GGUF:', modelPath);
    process.exit(2);
  }

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  const hold = await loadEmbeddingHold({
    modelPath,
    onProgress: (msg) => console.error(`[noticing-isolation] ${msg}`)
  });

  /** @type {import('../../src/core/noticingOneLine/noticingOneLineIsolationEval.js').NoticingOneLineIsolationClassVectors[]} */
  const classes = [];
  for (const fixture of NOTICING_ONE_LINE_ISOLATION_FIXTURES) {
    const calibrationVectors = [];
    for (const line of fixture.calibration) {
      calibrationVectors.push(await hold.embedText(line));
    }
    const paraphraseVectors = [];
    for (const line of fixture.paraphrase) {
      paraphraseVectors.push(await hold.embedText(line));
    }
    classes.push({
      id: fixture.id,
      calibrationVectors,
      paraphraseVectors
    });
  }

  /** @type {{ id: string, vector: number[] }[]} */
  const crisisProtoVectors = [];
  const crisisCalibration = [];
  for (const proto of CONFIDE_SEMANTIC_CRISIS_PROTOTYPES) {
    const vector = await hold.embedText(proto.text);
    crisisProtoVectors.push({ id: proto.id, vector });
    crisisCalibration.push(vector);
  }
  classes.push({
    id: 'crisis',
    calibrationVectors: crisisCalibration,
    paraphraseVectors: []
  });

  await hold.dispose?.();

  const report = evaluateNoticingOneLineIsolation({
    classes,
    crisisProtoVectors
  });
  const exported = summarizeNoticingOneLineIsolationForExport(report);
  exported.generatedAt = new Date().toISOString();
  exported.embeddingModel = path.basename(modelPath);

  const outPath = path.join(LAB_ROOT, `noticing-one-line-isolation-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(exported, null, 2)}\n`, 'utf8');

  console.log(`isolationPassed=${exported.isolationPassed}`);
  console.log(`failures=${exported.failures.length}`);
  console.log(`json=${outPath}`);
  process.exit(exported.isolationPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('[noticing-isolation] fatal', err instanceof Error ? err.message : err);
  process.exit(1);
});
