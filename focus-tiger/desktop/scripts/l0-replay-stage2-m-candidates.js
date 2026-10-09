#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Lab: same literal + embedding screen as stage2-m-screen, then the live
 * Stage 2 route override only. No Hybrid, no reply, no turns.jsonl.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run audit:stage2-m-replay
 *   npm run audit:stage2-m-replay -- --file ./sentences.txt
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
import { decideStage2MReplay } from '../../src/core/confide/stage2MReplayDecide.js';

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
    process.stderr.write('[stage2-m-replay] --file needs a path\n');
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
    process.stderr.write('[stage2-m-replay] no sentences\n');
    process.exit(1);
  }
  const destPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write(`[stage2-m-replay] missing embedding GGUF at ${destPath}\n`);
    process.exit(2);
  }
  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[stage2-m-replay] ${msg}\n`)
  });
  const rows = [];
  try {
    for (const text of sentences) {
      const literal = previewConfideLiteralSource(text);
      if (literal.skipped) {
        rows.push(decideStage2MReplay({ ...literal, semanticCoarse: null }));
        continue;
      }
      const scored = await hold.classifyUserText(text);
      rows.push(decideStage2MReplay({
        ...literal,
        semanticCoarse: scored?.bucket ?? null
      }));
    }
  } finally {
    await hold.dispose();
  }

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  const outPath = path.join(LAB_ROOT, `stage2-m-replay-${Date.now()}.json`);
  const still = rows.filter((row) => row.stillGrayToFunctional).length;
  const routeChanged = rows.filter((row) => row.routeChanged).length;
  const mCount = rows.filter((row) => row.mCandidate).length;
  fs.writeFileSync(outPath, `${JSON.stringify({
    n: rows.length,
    mCandidate: mCount,
    stillGrayToFunctional: still,
    routeChanged,
    rows
  }, null, 2)}\n`);
  process.stdout.write(
    `[stage2-m-replay] n=${rows.length} mCandidate=${mCount} stillGrayToFunctional=${still} routeChanged=${routeChanged}\n`
  );
  process.stdout.write(
    '[stage2-m-replay] lab only. Does not append turns.jsonl. Not product-path M.\n'
  );
  for (const row of rows) {
    let tag = 'NOT_M';
    if (row.skipped) tag = 'SKIP';
    else if (row.stillGrayToFunctional) tag = 'STABLE';
    else if (row.routeChanged && row.mCandidate) tag = 'ROUTE_CHANGED';
    process.stdout.write(
      `${tag} literal=${row.literalCoarse ?? '-'} semantic=${row.semanticCoarse ?? '-'} route=${row.literalRoute ?? '-'} replay=${row.replayRoute ?? '-'} override=${row.override ?? '-'} :: ${row.text}\n`
    );
  }
  process.stdout.write(`[stage2-m-replay] json ${outPath}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
