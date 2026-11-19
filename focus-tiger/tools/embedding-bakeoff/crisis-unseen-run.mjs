/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * One-shot crisis unseen run. Not imported by production.
 * Stdout is counts only. Never prints item.text.
 *
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 \
 *     node tools/embedding-bakeoff/crisis-unseen-run.mjs
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { confideClassify } from '../../src/core/confide/confideClassify.js';
import { CONFIDE_ROUTE } from '../../src/core/confide/confideRoutes.js';
import {
  applyConfideSemanticCrisis,
  CONFIDE_SEMANTIC_CRISIS_MODE,
  shouldAttemptConfideSemanticCrisis
} from '../../src/core/confide/confideSemanticCrisisLayer.js';
import { confirmRhetoricalCrisisUse } from '../../src/core/confide/confideRhetoricalCrisisConfirm.js';

const SET_PATH = path.join(
  os.homedir(),
  'Documents',
  'ft-private',
  'ft-private--confide-crisis-unseen',
  'confide-crisis-unseen-2026-11-19-candidate-draft.json'
);
const PRIVATE_DIR = path.dirname(SET_PATH);
const RUNS_PATH = path.join(PRIVATE_DIR, 'crisis-unseen-runs.json');
const EXPECTED_VERSION = 'crisis-unseen-en/v1';

function round4(n) {
  return Number.isFinite(n) ? Math.round(n * 10000) / 10000 : null;
}

function emptyBucket() {
  return { n: 0, safety: 0, semanticApplied: 0, other: 0 };
}

const require = createRequire(new URL('../../desktop/package.json', import.meta.url));
const { loadEmbeddingHold } = await import(
  pathToFileURL(path.resolve('desktop/companion/l1EmbeddingHold.js')).href
);
const { L0_EMBEDDING_MODEL_FILENAME, L0_EMBEDDING_MODEL_MIN_BYTES } = await import(
  pathToFileURL(path.resolve('desktop/companion/l0EmbeddingConfig.js')).href
);
const { isGgufCachedAt } = await import(
  pathToFileURL(path.resolve('desktop/companion/l0Download.js')).href
);

if (!existsSync(SET_PATH)) {
  process.stderr.write('[crisis-unseen] missing private set\n');
  process.exit(2);
}

const raw = await readFile(SET_PATH, 'utf8');
const data = JSON.parse(raw);
const contentHash = createHash('sha256').update(raw).digest('hex');
const version = String(data.holdout_set_version || '');
if (version !== EXPECTED_VERSION) {
  process.stderr.write(`[crisis-unseen] unexpected version ${version}\n`);
  process.exit(1);
}

let ledger = { versions: {} };
if (existsSync(RUNS_PATH)) {
  ledger = JSON.parse(await readFile(RUNS_PATH, 'utf8'));
}
const prior = ledger.versions[version];
if (prior?.status === 'complete' || prior?.status === 'started') {
  process.stderr.write('[crisis-unseen] this version already used; refuse second run\n');
  process.exit(3);
}

ledger.versions[version] = {
  status: 'started',
  contentHash,
  startedAt: new Date().toISOString()
};
await mkdir(PRIVATE_DIR, { recursive: true });
await writeFile(RUNS_PATH, `${JSON.stringify(ledger, null, 2)}\n`);

const destPath = path.join(
  os.homedir(),
  'Library',
  'Application Support',
  'Focus Tiger',
  'companion-l0',
  L0_EMBEDDING_MODEL_FILENAME
);
if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
  process.stderr.write('[crisis-unseen] missing embedding GGUF\n');
  process.exit(2);
}

const hold = await loadEmbeddingHold({
  modelPath: destPath,
  env: process.env,
  onProgress: (msg) => process.stderr.write(`[crisis-unseen] ${msg}\n`)
});

const items = Array.isArray(data.items) ? data.items : [];
const byLabel = {
  explicit_self_harm: emptyBucket(),
  rhetorical: emptyBucket(),
  fatigue_or_life_stress: emptyBucket(),
  unsupported_language: emptyBucket()
};
const rows = [];

try {
  for (const item of items) {
    const text = String(item.text || '');
    const literal = confideClassify(text) || CONFIDE_ROUTE.FALLBACK;
    const attempt = shouldAttemptConfideSemanticCrisis({
      literalRoute: literal,
      text,
      wideViewport: true,
      embeddingReady: true,
      mode: CONFIDE_SEMANTIC_CRISIS_MODE.LIVE
    });
    let score = null;
    let protoId = null;
    let applied = false;
    let wouldApply = false;
    let rhetorical = confirmRhetoricalCrisisUse(text);
    let finalRoute = literal;
    if (attempt) {
      const scored = await hold.scoreSemanticCrisis(text);
      score = round4(scored.score);
      protoId = scored.protoId;
      const appliedRow = applyConfideSemanticCrisis({
        literalRoute: literal,
        score: scored.score,
        threshold: scored.threshold,
        mode: CONFIDE_SEMANTIC_CRISIS_MODE.LIVE,
        embeddingOk: true,
        text
      });
      applied = appliedRow.applied;
      wouldApply = appliedRow.wouldApply;
      finalRoute = appliedRow.route || literal;
    }
    const label = String(item.label || 'unknown');
    if (!byLabel[label]) byLabel[label] = emptyBucket();
    const bucket = byLabel[label];
    bucket.n += 1;
    if (finalRoute === CONFIDE_ROUTE.SAFETY_REDIRECT) bucket.safety += 1;
    else bucket.other += 1;
    if (applied) bucket.semanticApplied += 1;
    rows.push({
      id: item.id,
      lang: item.lang,
      label,
      severity: item.severity,
      expectedRoute: item.expected_route,
      countsTowardRecall: item.counts_toward_recall === true,
      literal,
      attempt,
      score,
      protoId,
      rhetorical,
      applied,
      wouldApply,
      finalRoute
    });
  }
} finally {
  await hold.dispose?.();
}

const recall = rows.filter((r) => r.countsTowardRecall);
const recallHit = recall.filter((r) => r.finalRoute === CONFIDE_ROUTE.SAFETY_REDIRECT);
const rhetoricalFp = rows.filter(
  (r) => r.label === 'rhetorical' && r.finalRoute === CONFIDE_ROUTE.SAFETY_REDIRECT
);
const fatigueFp = rows.filter(
  (r) => r.label === 'fatigue_or_life_stress' && r.finalRoute === CONFIDE_ROUTE.SAFETY_REDIRECT
);

const report = {
  probe: 'crisis-unseen-en-v1',
  holdoutSetVersion: version,
  contentHash,
  n: rows.length,
  threshold: 0.78,
  recall: { hit: recallHit.length, n: recall.length },
  rhetoricalFp: { hit: rhetoricalFp.length, n: byLabel.rhetorical.n },
  fatigueFp: { hit: fatigueFp.length, n: byLabel.fatigue_or_life_stress.n },
  byLabel,
  langRoutes: rows
    .filter((r) => r.label === 'unsupported_language')
    .reduce((acc, r) => {
      acc[`${r.lang}:${r.finalRoute}`] = (acc[`${r.lang}:${r.finalRoute}`] || 0) + 1;
      return acc;
    }, {}),
  rows
};

const outPath = path.join(PRIVATE_DIR, `crisis-unseen-en-v1-run-${Date.now()}.json`);
await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`);
ledger.versions[version] = {
  status: 'complete',
  contentHash,
  completedAt: new Date().toISOString(),
  resultFile: path.basename(outPath),
  recall: report.recall,
  rhetoricalFp: report.rhetoricalFp,
  fatigueFp: report.fatigueFp
};
await writeFile(RUNS_PATH, `${JSON.stringify(ledger, null, 2)}\n`);

process.stdout.write(
  `[crisis-unseen] recall ${recallHit.length}/${recall.length} rhetoricalFp ${rhetoricalFp.length}/${byLabel.rhetorical.n} fatigueFp ${fatigueFp.length}/${byLabel.fatigue_or_life_stress.n}\n`
);
process.stdout.write(`[crisis-unseen] json ${outPath}\n`);
process.stdout.write('[crisis-unseen] no utterances written\n');
