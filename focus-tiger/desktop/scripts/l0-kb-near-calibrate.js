#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * One-shot scores for the near-match anchors. Not product-path. Not smoke.
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run audit:kb-near-calibrate
 */

import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  L0_EMBEDDING_MODEL_FILENAME,
  L0_EMBEDDING_MODEL_MIN_BYTES
} from '../companion/l0EmbeddingConfig.js';
import { isGgufCachedAt } from '../companion/l0Download.js';
import { loadEmbeddingHold } from '../companion/l1EmbeddingHold.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LINES = [
  ['A1', 'Today I am going to ride bicycles. How about you?'],
  ['A2', 'Who is Duke number?'],
  ['A3', 'When I see so much'],
  ['A6', 'What is ground exercise?'],
  ['A7', 'focus vs meditation'],
  ['A8', 'What is meditation?'],
  ['A9', "What's the difference between focus and meditation?"],
  ['A10', 'What is the observation wing?'],
  ['A11', '冥想这套东西对我根本没用，我快要放弃了'],
  ['S1', '有没有适合现在坐一会儿的练习？'],
  ['S2', '想结束刚才的练习'],
  ['S4', '有没有让自己回到当下的练习？'],
  ['S5', '想找个短一点的专注练习'],
  ['S6', '想看看之前做过的练习'],
  ['S7', '想看看阿寅以前记下的东西']
];

function defaultEmbeddingPath() {
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

const destPath = defaultEmbeddingPath();
if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
  process.stderr.write(`[kb-near-calibrate] missing embedding GGUF at ${destPath}\n`);
  process.exit(2);
}

const hold = await loadEmbeddingHold({
  modelPath: destPath,
  env: process.env,
  onProgress: (msg) => process.stderr.write(`[kb-near-calibrate] ${msg}\n`)
});
try {
  for (const [id, text] of LINES) {
    const row = await hold.classifyProductKnowledgeGate(text);
    process.stdout.write(
      `${id} nearest=${row.nearestId} score=${Number(row.nearestScore).toFixed(4)} :: ${text}\n`
    );
  }
} finally {
  await hold.dispose();
}
