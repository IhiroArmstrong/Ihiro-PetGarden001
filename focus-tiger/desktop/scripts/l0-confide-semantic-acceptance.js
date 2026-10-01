/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab-only: real Qwen3-Embedding GGUF freeze table (Prompt 7).
 * Leave-one-out A/B 50 + highlighted anchors. Not wired to test:smoke.
 *
 *   cd focus-tiger && npm run test:confide-semantic-acceptance
 *   cd focus-tiger/desktop && npm run companion:semantic-acceptance
 *   FT_EMBEDDING_GGUF=/path/to/Qwen3-Embedding-0.6B-Q8_0.gguf npm run companion:semantic-acceptance
 *
 * Results: /tmp/ft-l0-lab/semantic-acceptance-<epoch>.json
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  L0_EMBEDDING_MODEL_EXPECTED_BYTES,
  L0_EMBEDDING_MODEL_FILENAME,
  L0_EMBEDDING_MODEL_MIN_BYTES,
  L0_EMBEDDING_MODEL_URLS
} from '../companion/l0EmbeddingConfig.js';
import { ensureGgufDownloaded, isGgufCachedAt } from '../companion/l0Download.js';
import { loadEmbeddingHold } from '../companion/l1EmbeddingHold.js';
import {
  buildConfideSemanticAcceptanceCases,
  evaluateConfideSemanticAcceptance
} from '../../src/core/confide/confideSemanticAcceptanceEvaluate.js';
import { resolveConfideSemanticRoutingConfig } from '../../src/core/confide/confideSemanticRoutingConfig.js';

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

function formatScore(value) {
  return Number(value).toFixed(4);
}

function formatFailDetail(row) {
  return [
    `expected=${row.expectedBucket}`,
    `actual=${row.actualBucket}`,
    `scoreA=${formatScore(row.scoreA)}`,
    `scoreB=${formatScore(row.scoreB)}`,
    `centroidA=${formatScore(row.cosineCentroidA)}`,
    `centroidB=${formatScore(row.cosineCentroidB)}`
  ].join(' ');
}

function tryRecoverCompletePart(destPath) {
  if (isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) return destPath;
  const partPath = `${destPath}.part`;
  if (!fs.existsSync(partPath)) return null;
  let bytes = fs.statSync(partPath).size;
  if (bytes < L0_EMBEDDING_MODEL_EXPECTED_BYTES) return null;
  if (bytes > L0_EMBEDDING_MODEL_EXPECTED_BYTES) {
    const fd = fs.openSync(partPath, 'r+');
    fs.ftruncateSync(fd, L0_EMBEDDING_MODEL_EXPECTED_BYTES);
    fs.closeSync(fd);
    bytes = L0_EMBEDDING_MODEL_EXPECTED_BYTES;
    process.stderr.write(
      `[confide-semantic-acceptance] truncated oversize .part to ${bytes} bytes\n`
    );
  }
  if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
  fs.renameSync(partPath, destPath);
  return destPath;
}

async function resolveModelPath() {
  const destPath = defaultEmbeddingPath();
  const recovered = tryRecoverCompletePart(destPath);
  if (recovered && isGgufCachedAt(recovered, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    return recovered;
  }
  if (isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    return destPath;
  }
  if (String(process.env.FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD || '') === '1') {
    return null;
  }
  process.stderr.write(
    `[confide-semantic-acceptance] downloading embedding GGUF → ${destPath}\n`
  );
  const dl = await ensureGgufDownloaded(destPath, L0_EMBEDDING_MODEL_URLS, {
    minBytes: L0_EMBEDDING_MODEL_MIN_BYTES,
    onProgress: ({ received, total }) => {
      if (!Number.isFinite(total) || total <= 0) return;
      const pct = Math.floor((received / total) * 100);
      if (pct % 10 === 0) {
        process.stderr.write(
          `[confide-semantic-acceptance] download ${pct}% (${received}/${total})\n`
        );
      }
    }
  });
  return dl.path;
}

async function main() {
  const routing = resolveConfideSemanticRoutingConfig(process.env);
  const cases = buildConfideSemanticAcceptanceCases();
  const modelPath = await resolveModelPath();
  if (!modelPath) {
    process.stderr.write(
      '[confide-semantic-acceptance] missing embedding GGUF. Set FT_EMBEDDING_GGUF or allow download to companion-l0.\n'
    );
    process.exit(2);
  }

  process.stderr.write(
    `[confide-semantic-acceptance] model ${modelPath} · cases ${cases.length} · leave-one-out · grayMargin=${routing.grayMargin} topK=${routing.topK}\n`
  );

  const hold = await loadEmbeddingHold({
    modelPath,
    env: process.env,
    onProgress: (msg) => {
      process.stderr.write(`[confide-semantic-acceptance] ${msg}\n`);
    }
  });

  try {
    const summary = evaluateConfideSemanticAcceptance({
      cases,
      vectorsA: hold.vectorsA,
      vectorsB: hold.vectorsB,
      grayMargin: routing.grayMargin,
      topK: routing.topK
    });

    process.stdout.write(
      `[confide-semantic-acceptance] mode=gguf-leave-one-out count=${summary.libraryTotal}\n\n`
    );

    for (const row of summary.rows) {
      const status = row.pass ? 'PASS' : 'FAIL';
      const mark = row.isAnchor ? 'ANCHOR' : row.library;
      const extra = row.pass
        ? `actual=${row.actualBucket} scoreA=${formatScore(row.scoreA)} scoreB=${formatScore(row.scoreB)}`
        : formatFailDetail(row);
      process.stdout.write(`${status}\t${row.id}\t${mark}\t${row.text}\t${extra}\n`);
    }

    process.stdout.write('\n--- anchors ---\n');
    for (const row of summary.rows.filter((item) => item.isAnchor)) {
      const status = row.pass ? 'PASS' : 'FAIL';
      process.stdout.write(
        `${status}\t${row.id}\t${row.text}\t${row.pass ? `actual=${row.actualBucket}` : formatFailDetail(row)}\n`
      );
    }

    const allAnchorsPass = summary.anchorPass === summary.anchorTotal;
    const libraryLine = `${summary.libraryPass}/${summary.libraryTotal}`;
    const anchorLine = `锚点 ${summary.anchorPass}/${summary.anchorTotal} ${allAnchorsPass ? 'PASS' : 'FAIL'}`;
    process.stdout.write('\n--- summary ---\n');
    process.stdout.write(`${libraryLine} · ${anchorLine}\n`);
    if (!allAnchorsPass) {
      process.stdout.write('ANCHOR FAIL (any of 累积了多久 / 忙啥 / 忙什么)\n');
    }
    if (summary.failRows.length) {
      process.stdout.write('\n--- FAIL detail ---\n');
      for (const row of summary.failRows) {
        process.stdout.write(
          `${row.isAnchor ? 'ANCHOR ' : ''}${row.id}\t${row.text}\t${formatFailDetail(row)}\n`
        );
      }
    }

    fs.mkdirSync(LAB_ROOT, { recursive: true });
    const outPath = path.join(LAB_ROOT, `semantic-acceptance-${Date.now()}.json`);
    fs.writeFileSync(
      outPath,
      `${JSON.stringify(
        {
          probe: 'confide-semantic-acceptance',
          modelPath,
          grayMargin: routing.grayMargin,
          topK: routing.topK,
          libraryPass: summary.libraryPass,
          libraryTotal: summary.libraryTotal,
          anchorPass: summary.anchorPass,
          anchorTotal: summary.anchorTotal,
          failRows: summary.failRows
        },
        null,
        2
      )}\n`
    );
    process.stderr.write(`[confide-semantic-acceptance] wrote ${outPath}\n`);

    if (summary.libraryPass !== summary.libraryTotal || !allAnchorsPass) {
      process.exitCode = 1;
    }
  } finally {
    await hold.dispose();
  }
}

main().catch((err) => {
  process.stderr.write(
    `[confide-semantic-acceptance] ${err instanceof Error ? err.stack || err.message : String(err)}\n`
  );
  process.exit(1);
});
