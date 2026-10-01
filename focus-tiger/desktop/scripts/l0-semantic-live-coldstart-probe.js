/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab: Prompt 8 cold-start — embed_not_ready before gate ready, ok after.
 *
 *   cd focus-tiger && npm run test:semantic-live-coldstart-probe
 *   cd focus-tiger/desktop && npm run companion:semantic-live-coldstart-probe
 *
 * Results: /tmp/ft-l0-lab/semantic-live-coldstart-<epoch>.json + turns.jsonl
 * Not wired to test:smoke. Run from system Terminal (Metal).
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
import { createSemanticShadowEmbeddingGate } from '../companion/l1SemanticShadowEmbeddingGate.js';
import {
  formatSemanticLiveAuditLines,
  summarizeConfideSemanticLive
} from '../../src/core/confide/auditConfideSemanticShadow.js';
import {
  isSemanticLiveColdstartProbePass,
  runSemanticLiveColdstartProbe
} from '../../src/core/confide/semanticLiveColdstartProbe.js';

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
  const embeddingPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(embeddingPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write(
      `[semantic-live-coldstart-probe] missing embedding GGUF at ${embeddingPath}\n`
    );
    process.exit(2);
  }

  const gate = createSemanticShadowEmbeddingGate();
  let embedHold = null;
  /** @type {object[]} */
  let rows = [];
  /** @type {object[]} */
  let coldRows = [];
  /** @type {object[]} */
  let readyRows = [];

  try {
    embedHold = await loadEmbeddingHold({
      modelPath: embeddingPath,
      env: process.env,
      onProgress: (msg) =>
        process.stderr.write(`[semantic-live-coldstart-probe] ${msg}\n`)
    });

    const probe = await runSemanticLiveColdstartProbe({
      gate,
      classifyUserText: (text) => embedHold.classifyUserText(text)
    });
    rows = probe.rows;
    coldRows = probe.coldRows;
    readyRows = probe.readyRows;
  } finally {
    if (embedHold) await embedHold.dispose();
  }

  const liveSummary = summarizeConfideSemanticLive(rows);
  const pass = isSemanticLiveColdstartProbePass({
    liveCount: liveSummary.liveCount,
    failOpenCount: liveSummary.failOpenCount,
    semanticOkCount: liveSummary.semanticOkCount,
    coldRows: coldRows.length,
    readyRows: readyRows.length
  });

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  const stamp = Date.now();
  const turnsPath = path.join(LAB_ROOT, `semantic-live-coldstart-turns-${stamp}.jsonl`);
  const outPath = path.join(LAB_ROOT, `semantic-live-coldstart-${stamp}.json`);
  fs.writeFileSync(turnsPath, `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
  fs.writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        probe: 'semantic-live-coldstart',
        embeddingPath,
        turnsPath,
        rows,
        liveSummary,
        pass
      },
      null,
      2
    )}\n`
  );

  process.stdout.write('[semantic-live-coldstart-probe] rows\n');
  for (const row of rows) {
    process.stdout.write(
      `${row.ok ? 'PASS' : 'FAIL'}\t${row.reason}\t${row.text}\tsemantic=${row.semanticCoarse ?? 'null'}\n`
    );
  }
  process.stdout.write('\n--- audit ---\n');
  process.stdout.write(`${formatSemanticLiveAuditLines(liveSummary)}\n`);
  process.stdout.write(`pass=${pass ? 'YES' : 'NO'}\n`);
  process.stderr.write(`[semantic-live-coldstart-probe] wrote ${outPath}\n`);
  process.stderr.write(`[semantic-live-coldstart-probe] wrote ${turnsPath}\n`);
  process.stderr.write(
    `[semantic-live-coldstart-probe] audit with: npm run audit:confide-semantic-shadow -- --file ${turnsPath}\n`
  );

  if (!pass) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  process.stderr.write(
    `[semantic-live-coldstart-probe] ${err instanceof Error ? err.stack || err.message : String(err)}\n`
  );
  process.exit(1);
});
