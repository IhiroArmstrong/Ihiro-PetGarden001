#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * KB product gate mood veto lab (stage one). Not product-path. Not smoke.
 * Does not write Electron turns.jsonl. Does not change any reply.
 *   cd focus-tiger && FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 node desktop/scripts/l0-kb-mood-veto-lab.js
 * Optional: FT_EMBEDDING_GGUF=/path · FT_KB_MOOD_VETO_JA_REVIEWED=1 once a native speaker signed off.
 * Results: /tmp/ft-l0-lab/kb-mood-veto-lab-<epoch>.json + .md
 */

import { mkdir, writeFile } from 'node:fs/promises';
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
  getRetrievableProductKnowledgeEntry,
  probeProductKnowledgeCatalog,
  productKnowledgeReplyPassesGuard
} from '../../src/core/confide/confideProductKnowledge.js';
import { decideKbNearMatch } from '../../src/core/confide/kbNearMatch.js';
import {
  KB_MOOD_VETO_LAB_CONTROL_ROWS,
  KB_MOOD_VETO_LAB_MOOD_ROWS
} from '../../src/core/confide/confideKbMoodVetoLabSet.js';
import {
  simulateKbMoodVetoGate,
  summarizeKbMoodVetoLab
} from '../../src/core/confide/confideKbMoodVetoLabScore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAB_DIR = '/tmp/ft-l0-lab';
const MARGIN_SWEEP = Object.freeze([0, 0.02, 0.05]);

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

function fmt(n) {
  return Number.isFinite(Number(n)) ? Number(n).toFixed(4) : 'n/a';
}

const destPath = defaultEmbeddingPath();
if (!isGgufCachedAt(destPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
  process.stderr.write(`[kb-mood-veto-lab] missing embedding GGUF at ${destPath}\n`);
  process.exit(2);
}

const loadStarted = Date.now();
const hold = await loadEmbeddingHold({
  modelPath: destPath,
  env: process.env,
  onProgress: (msg) => process.stderr.write(`[kb-mood-veto-lab] ${msg}\n`)
});
const loadMs = Date.now() - loadStarted;

/** @type {object[]} */
const scored = [];
try {
  for (const row of [...KB_MOOD_VETO_LAB_MOOD_ROWS, ...KB_MOOD_VETO_LAB_CONTROL_ROWS]) {
    const gate = await hold.classifyProductKnowledgeGate(row.text);
    const catalog = probeProductKnowledgeCatalog(row.text);
    let nearAction = null;
    let nearHit = false;
    if (!catalog.hit && Number.isFinite(Number(gate.nearestScore))) {
      const near = decideKbNearMatch({
        nearestId: gate.nearestId,
        nearestScore: gate.nearestScore
      });
      nearAction = near.action;
      if (near.action === 'hit' && near.id) {
        const entry = getRetrievableProductKnowledgeEntry(near.id);
        nearHit = Boolean(entry && productKnowledgeReplyPassesGuard(entry.shortAnswerEn));
      }
    }
    const base = {
      text: row.text,
      catalogHit: Boolean(catalog.hit || nearHit),
      nearAction,
      semanticIsProduct: Boolean(gate.isProduct),
      lifeOutranksProduct: Boolean(gate.lifeOutranksProduct),
      productScore: gate.score,
      moodScore: gate.moodScore
    };
    const sim = simulateKbMoodVetoGate(base);
    /** @type {Record<string, string>} */
    const sweep = {};
    for (const margin of MARGIN_SWEEP) {
      sweep[String(margin)] = simulateKbMoodVetoGate({ ...base, margin }).withVeto;
    }
    scored.push({
      ...row,
      productScore: gate.score,
      moodScore: gate.moodScore,
      lifeScore: gate.lifeScore,
      nearestId: gate.nearestId,
      nearestScore: gate.nearestScore,
      catalogHit: base.catalogHit,
      nearAction,
      moodOutranksProduct: sim.moodOutranksProduct,
      baseline: sim.baseline,
      withVeto: sim.withVeto,
      sweep
    });
  }
} finally {
  await hold.dispose();
}

const jaNativeReviewed = process.env.FT_KB_MOOD_VETO_JA_REVIEWED === '1';
const summary = summarizeKbMoodVetoLab(scored, { jaNativeReviewed });
/** @type {Record<string, object>} */
const sweepSummary = {};
for (const margin of MARGIN_SWEEP) {
  const key = String(margin);
  sweepSummary[key] = summarizeKbMoodVetoLab(
    scored.map((r) => ({ ...r, withVeto: r.sweep[key] })),
    { jaNativeReviewed }
  );
}

const epoch = Date.now();
await mkdir(LAB_DIR, { recursive: true });
const jsonPath = path.join(LAB_DIR, `kb-mood-veto-lab-${epoch}.json`);
const mdPath = path.join(LAB_DIR, `kb-mood-veto-lab-${epoch}.md`);
const coldStart = {
  holdLoadMs: loadMs,
  moodPrecomputeMs: hold.moodPrecomputeMs,
  moodLibrarySize: hold.librarySizeMood
};
await writeFile(
  jsonPath,
  `${JSON.stringify({ probe: 'kb-mood-veto-lab', coldStart, summary, sweepSummary, rows: scored }, null, 2)}\n`,
  'utf8'
);

const lines = [
  `# KB mood veto lab · ${new Date(epoch).toISOString()}`,
  '',
  `Cold start: mood library ${coldStart.moodLibrarySize} lines, +${coldStart.moodPrecomputeMs} ms (hold load ${loadMs} ms).`,
  `Japanese: ${jaNativeReviewed ? 'native-reviewed' : 'provisional (not native-reviewed)'}.`,
  '',
  '| set | group | lang | productScore | moodScore | lifeScore | today | with veto | text |',
  '|---|---|---|---|---|---|---|---|---|'
];
for (const r of scored) {
  lines.push(
    `| ${r.set} | ${r.group} | ${r.lang} | ${fmt(r.productScore)} | ${fmt(r.moodScore)} | ${fmt(r.lifeScore)} | ${r.baseline} | ${r.withVeto} | ${String(r.text).replace(/\|/g, '\\|')} |`
  );
}
await writeFile(mdPath, `${lines.join('\n')}\n`, 'utf8');

for (const lang of ['zh', 'en', 'ja']) {
  const m = summary.mood[lang];
  process.stdout.write(
    `mood ${lang}: ${m.vetoSkip}/${m.n} = ${(m.rate * 100).toFixed(1)}% (need ${(m.minRate * 100).toFixed(0)}%) baselineSkip=${m.baselineSkip} ${m.passed ? 'PASS' : 'FAIL'}${lang === 'ja' && summary.jaProvisional ? ' (provisional)' : ''}\n`
  );
}
process.stdout.write(
  `control: n=${summary.control.n} (need ${summary.control.minN}) falseVetoes=${summary.control.falseVetoes.length} baselineSkips=${summary.control.baselineSkips.length} mixedNotProduct=${summary.control.mixedNotProduct.length} ${summary.control.passed ? 'PASS' : 'FAIL'}\n`
);
for (const margin of MARGIN_SWEEP) {
  const s = sweepSummary[String(margin)];
  process.stdout.write(
    `margin ${margin}: zh=${s.mood.zh.vetoSkip}/${s.mood.zh.n} en=${s.mood.en.vetoSkip}/${s.mood.en.n} ja=${s.mood.ja.vetoSkip}/${s.mood.ja.n} falseVetoes=${s.control.falseVetoes.length}\n`
  );
}
process.stdout.write(`cold start: +${coldStart.moodPrecomputeMs} ms for ${coldStart.moodLibrarySize} mood vectors\n`);
process.stdout.write(`json: ${jsonPath}\nmd: ${mdPath}\n`);
process.stdout.write('[kb-mood-veto-lab] lab only. Stage two needs its own PO nod.\n');
