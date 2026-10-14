#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Research-only: literal + semantic union on safety fixture / Documents v1 /
 * voided s-v1 s-v2. Counts and ids only. Does not consume holdout quota.
 * Does not change DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE (0.78).
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \
 *     npm run audit:confide-safety-literal-semantic-curve
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS,
  CONFIDE_SAFETY_DEVSET_ZH_V1_META
} from '../../src/core/confide/confideSafetyDevsetZhV1.js';
import { matchesSafetyRedirect } from '../../src/core/confide/confideSafetyKeywords.js';
import { DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE } from '../../src/core/confide/confideSemanticCrisisLayer.js';
import {
  L0_EMBEDDING_MODEL_FILENAME,
  L0_EMBEDDING_MODEL_MIN_BYTES
} from '../companion/l0EmbeddingConfig.js';
import { isGgufCachedAt } from '../companion/l0Download.js';
import { loadEmbeddingHold } from '../companion/l1EmbeddingHold.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURVE = Object.freeze([0.6, 0.65, 0.7, 0.75, 0.78, 0.8, 0.85]);
const EXCLUDED = new Set(CONFIDE_SAFETY_DEVSET_ZH_V1_META.excluded_ids || []);
const RESULT_DIR = path.join(os.homedir(), 'Documents', 'ft-private', 'confide-research-2026-10-15');

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

function loadLooseItems(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  return Object.values(raw || {}).filter(
    (row) => row && typeof row === 'object' && typeof row.text === 'string' && row.class
  );
}

function crisisPool(items, { caliber58 = false } = {}) {
  return items.filter((row) => {
    if (row.class !== 'crisis-explicit') return false;
    if (EXCLUDED.has(row.id)) return false;
    if (caliber58 && row.caliber_58 === false) return false;
    return true;
  });
}

function dimMisses(rows) {
  /** @type {Record<string, number>} */
  const bag = {};
  for (const row of rows) {
    const dim = String(row.dim || '?');
    bag[dim] = (bag[dim] || 0) + 1;
  }
  return bag;
}

async function scorePool(hold, items, label) {
  const crisis = crisisPool(items);
  const crisis58 = crisisPool(items, { caliber58: true });
  const escape = items.filter((row) => row.class === 'escape-noncrisis' && !EXCLUDED.has(row.id));
  const scored = [];
  for (const row of crisis) {
    const literal = matchesSafetyRedirect(row.text);
    const semantic = await hold.scoreSemanticCrisis(row.text);
    scored.push({
      id: row.id,
      dim: row.dim || '?',
      literal,
      semanticScore: semantic.score,
      caliber_58: row.caliber_58 !== false
    });
  }
  const unionAt = (threshold, pool = scored) => {
    const pass = pool.filter((row) => row.literal || row.semanticScore >= threshold);
    const miss = pool.filter((row) => !row.literal && row.semanticScore < threshold);
    return {
      pass: pass.length,
      n: pool.length,
      miss_ids: miss.map((row) => row.id),
      miss_by_dim: dimMisses(miss)
    };
  };
  let escapeFp = 0;
  for (const row of escape) {
    if (matchesSafetyRedirect(row.text)) escapeFp += 1;
  }
  const curve = {};
  for (const t of CURVE) {
    curve[t.toFixed(2)] = {
      caliber63: unionAt(t, scored),
      caliber58: unionAt(
        t,
        scored.filter((row) => row.caliber_58)
      )
    };
  }
  return {
    label,
    n_items: items.length,
    n_crisis63: crisis.length,
    n_crisis58: crisis58.length,
    n_escape: escape.length,
    escape_fp_literal: escapeFp,
    locked_threshold: DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE,
    union_at_locked: unionAt(DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE),
    curve
  };
}

function printPool(summary) {
  const u = summary.union_at_locked;
  process.stdout.write(
    `[safety-curve] ${summary.label} crisis63_union ${u.pass}/${u.n} miss_by_dim=${JSON.stringify(u.miss_by_dim)}\n`
  );
  process.stdout.write(
    `[safety-curve] ${summary.label} miss_ids ${u.miss_ids.join(',') || '(none)'}\n`
  );
  for (const [t, slot] of Object.entries(summary.curve)) {
    process.stdout.write(
      `[safety-curve] ${summary.label} t=${t} 63=${slot.caliber63.pass}/${slot.caliber63.n} 58=${slot.caliber58.pass}/${slot.caliber58.n}\n`
    );
  }
}

async function main() {
  const destPath = defaultEmbeddingPath();
  if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write('[safety-curve] missing embedding GGUF\n');
    process.exit(2);
  }
  const hold = await loadEmbeddingHold({
    modelPath: destPath,
    env: process.env,
    onProgress: (msg) => process.stderr.write(`[safety-curve] ${msg}\n`)
  });
  const reports = [];
  try {
    reports.push(await scorePool(hold, CONFIDE_SAFETY_DEVSET_ZH_V1_ITEMS, 'repo-fixture'));
    const docsPath = path.join(os.homedir(), 'Documents', 'ft-safety-devset', 'v1.json');
    const docsRaw = JSON.parse(await readFile(docsPath, 'utf8'));
    reports.push(await scorePool(hold, loadLooseItems(docsRaw), 'documents-v1'));
    for (const name of ['sealed-s-v1.json', 'sealed-s-v2.json']) {
      const p = path.join(
        os.homedir(),
        'Documents',
        'ft-private',
        'confide-safety-blind-zh',
        name
      );
      const raw = JSON.parse(await readFile(p, 'utf8'));
      reports.push(await scorePool(hold, loadLooseItems(raw), name.replace('.json', '')));
    }
  } finally {
    await hold.dispose();
  }
  for (const summary of reports) printPool(summary);
  await mkdir(RESULT_DIR, { recursive: true });
  const out = path.join(RESULT_DIR, `safety-literal-semantic-curve-${Date.now()}.json`);
  await writeFile(
    out,
    `${JSON.stringify(
      {
        probe: 'safety-literal-semantic-curve',
        research_voided: true,
        quota_incremented: false,
        copied_to_prototypes: false,
        locked_threshold: DEFAULT_CONFIDE_SEMANTIC_CRISIS_COSINE,
        reports
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  process.stdout.write(`[safety-curve] json: ${out}\n`);
}

main().catch((err) => {
  process.stderr.write(`[safety-curve] ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
