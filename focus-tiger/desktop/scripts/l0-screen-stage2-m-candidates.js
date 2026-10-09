#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Lab: literal coarse (send-chain preview) × real embedding coarse.
 * Does not write Electron turns.jsonl. Does not count as product-path M.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run audit:stage2-m-screen
 *   npm run audit:stage2-m-screen -- --file ./sentences.txt
 *
 * One sentence per line. Blank lines and # comments skipped.
 * Default (no --file): three self-check sentences.
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
import { previewConfideLiteralSource } from '../../src/core/confide/previewConfideLiteralSource.js';
import { CONFIDE_SEMANTIC_BUCKET } from '../../src/core/confide/confideSemanticBuckets.js';

const LAB_ROOT = '/tmp/ft-l0-lab';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SELF_CHECK = ['累积了多久', '我有点不高兴', 'Sit 按钮在哪'];

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

function readSentences(args) {
  const fileIndex = args.indexOf('--file');
  const positional = args.find((arg) => arg && !arg.startsWith('-'));
  if (fileIndex < 0 && !positional) return SELF_CHECK.slice();
  const filePath = fileIndex >= 0 ? args[fileIndex + 1] : positional;
  if (!filePath) {
    process.stderr.write('[stage2-m-screen] --file needs a path\n');
    process.exit(1);
  }
  const raw = fs.readFileSync(path.resolve(filePath), 'utf8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

async function main() {
  const sentences = readSentences(process.argv.slice(2));
  if (sentences.length === 0) {
    process.stderr.write('[stage2-m-screen] no sentences\n');
    process.exit(1);
  }
  const destPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write(`[stage2-m-screen] missing embedding GGUF at ${destPath}\n`);
    process.exit(2);
  }
  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[stage2-m-screen] ${msg}\n`)
  });
  const rows = [];
  try {
    for (const text of sentences) {
      const literal = previewConfideLiteralSource(text);
      if (literal.skipped) {
        rows.push({ ...literal, semanticCoarse: null, mCandidate: false });
        continue;
      }
      const scored = await hold.classifyUserText(text);
      const semanticCoarse = scored?.bucket ?? null;
      const mCandidate =
        literal.literalCoarse === CONFIDE_SEMANTIC_BUCKET.GRAY &&
        semanticCoarse === CONFIDE_SEMANTIC_BUCKET.FUNCTIONAL;
      rows.push({ ...literal, semanticCoarse, mCandidate });
    }
  } finally {
    await hold.dispose();
  }

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  const outPath = path.join(LAB_ROOT, `stage2-m-screen-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify({ rows }, null, 2)}\n`);
  const mCount = rows.filter((row) => row.mCandidate).length;
  process.stdout.write(
    `[stage2-m-screen] n=${rows.length} mCandidate=${mCount}\n`
  );
  process.stdout.write(
    '[stage2-m-screen] lab only. Does not append turns.jsonl. Not product-path M.\n'
  );
  for (const row of rows) {
    const tag = row.mCandidate ? 'M_CANDIDATE' : row.skipped ? 'SKIP' : 'NO';
    process.stdout.write(
      `${tag} literal=${row.literalCoarse ?? '-'} semantic=${row.semanticCoarse ?? '-'} source=${row.source ?? '-'} :: ${row.text}\n`
    );
  }
  process.stdout.write(`[stage2-m-screen] json ${outPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
