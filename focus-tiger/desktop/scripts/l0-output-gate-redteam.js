/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T100 layer B red team round 2. Real l1Runtime generate + output gate.
 * Not in CI. Run from system Terminal (Metal).
 *
 *   cd focus-tiger && FT_OUTPUT_GATE_REDTEAM=1 FT_REDTEAM_PACK=v3 FT_REDTEAM_ROUND=3 \
 *     npm run audit:output-gate-redteam
 *
 * Preflight (10 main prompts × 8 unguarded seeds; median distinct hashes must be >= 4):
 *   FT_OUTPUT_GATE_REDTEAM=1 FT_REDTEAM_PACK=v3 FT_REDTEAM_PREFLIGHT=1 \
 *     npm run audit:output-gate-redteam
 *
 * Input-side fixed lines, no model:
 *   FT_REDTEAM_PACK=v3 npm run audit:output-gate-redteam -- --route-dry
 *
 * Raw model text stays in /tmp. Repo report uses hashes, lengths, counts.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CompanionL1Runtime } from '../companion/l1Runtime.js';
import { confideClassify } from '../../src/core/confide/confideClassify.js';
import { CONFIDE_ROUTE } from '../../src/core/confide/confideRoutes.js';
import {
  countEffectiveSamples,
  loadRedteamPromptPack,
  REDTEAM_V3_SEALED_SHA256,
  scoreRedteamRaw,
  summarizeRedteamRows
} from '../../src/core/outputGate/outputGateRedteam.js';

const LAB_ROOT = '/tmp/ft-l0-lab';
const RAW_LOG = path.join(LAB_ROOT, 'output-gate-redteam-raw.ndjson');
const INPUT_FIXED = new Set([
  CONFIDE_ROUTE.SAFETY_REDIRECT,
  CONFIDE_ROUTE.AGGRESSION_TOWARD_OTHERS,
  CONFIDE_ROUTE.LANGUAGE_NOT_YET_OPEN
]);

function parseCount(name, fallback, max) {
  const n = Number(process.env[name] || fallback);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(max, Math.floor(n));
}

function parseArms() {
  const raw = String(process.env.FT_REDTEAM_ARMS || 'unguarded,production');
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part === 'unguarded' || part === 'production');
}

function seedFor(id, sample) {
  const hex = createHash('sha256').update(`${id}:${sample}`).digest('hex').slice(0, 8);
  return Number.parseInt(hex, 16);
}

function rawLogLines() {
  if (!fs.existsSync(RAW_LOG)) return [];
  return fs.readFileSync(RAW_LOG, 'utf8').trim().split('\n').filter(Boolean);
}

function lastRawFromLog() {
  const lines = rawLogLines();
  const last = lines[lines.length - 1];
  if (!last) return '';
  try {
    return String(JSON.parse(last).raw || '');
  } catch {
    return '';
  }
}

function inputWouldGenerate(route) {
  return Boolean(route) && !INPUT_FIXED.has(route);
}

/**
 * @param {CompanionL1Runtime} runtime
 * @param {{ id: string, family: string, locale?: string, text: string }} item
 * @param {'unguarded' | 'production'} arm
 * @param {number} sample
 * @param {Array<{ role: string, text: string, source: string }>} history
 */
async function runOne(runtime, item, arm, sample, history) {
  const locale = item.locale || 'en';
  const inputRoute = confideClassify(item.text) || '';
  let crisisScore = null;
  if (item.family === 'crisis-paraphrase' || item.family === 'harm-other') {
    try {
      crisisScore = await runtime.scoreSemanticCrisis({ text: item.text });
    } catch {
      crisisScore = { ok: false, reason: 'score_threw' };
    }
  }
  const forceGenerate = arm === 'unguarded';
  const willGenerate = forceGenerate || inputWouldGenerate(inputRoute);
  /** @type {Record<string, unknown>} */
  const row = {
    id: item.id,
    family: item.family,
    arm,
    sample,
    locale,
    inputRoute,
    inputFixed: INPUT_FIXED.has(inputRoute),
    generated: false,
    temperature: 0.8,
    seed: seedFor(item.id, sample),
    crisisScore: crisisScore
      ? {
          ok: Boolean(crisisScore.ok),
          embeddingOk: Boolean(crisisScore.embeddingOk),
          score: Number(crisisScore.score) || 0,
          reason: crisisScore.reason || ''
        }
      : null,
    historyLeak: false
  };
  if (!willGenerate) {
    return { ...row, gateVerdict: null, raw: '', escape: false, skipped: 'input_fixed' };
  }
  const linesBefore = rawLogLines().length;
  const result = await runtime.generate({
    text: item.text,
    locale,
    history,
    redteamArm: arm,
    temperature: 0.8,
    seed: seedFor(item.id, sample)
  });
  // Non-English locales return before the model runs and do not append a line.
  // Scoring the previous English raw would attribute that sentence to this prompt.
  const linesAfter = rawLogLines().length;
  const raw = linesAfter > linesBefore ? lastRawFromLog() : '';
  const scored = scoreRedteamRaw(raw);
  const shown = String(result?.text || '');
  const leak = history.some((turn) => raw && String(turn.text || '').includes(raw));
  return {
    ...row,
    generated: true,
    skipped: '',
    gateVerdict: result?.verdict || result?.reason || null,
    shown,
    raw,
    historyLeak: leak,
    ok: Boolean(result?.ok),
    ...scored,
    escape: Boolean(result?.verdict === 'pass' && scored.heuristicHit)
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function routeDryRun(pack) {
  const fixed = [];
  for (const item of pack.prompts) {
    const route = confideClassify(item.text) || '';
    if (INPUT_FIXED.has(route)) fixed.push(`${item.id}\t${route}`);
  }
  process.stdout.write(
    `[output-gate-redteam] route-dry pack=${pack.id} main=${pack.prompts.length} inputFixed=${fixed.length} sealed=${pack.sealedSha256 || ''}\n`
  );
  for (const line of fixed) process.stdout.write(`${line}\n`);
}

async function main() {
  const pack = loadRedteamPromptPack(process.env.FT_REDTEAM_PACK || 'v2');
  const preflight = process.env.FT_REDTEAM_PREFLIGHT === '1';
  if (preflight) {
    pack.prompts = pack.prompts.slice(0, 10);
  }
  const arms = preflight ? ['unguarded'] : parseArms();
  const v3 = String(pack.id || '').includes('v3');
  const unguardedN = parseCount('FT_REDTEAM_SAMPLES_UNGUARDED', 8, 12);
  const productionN = parseCount('FT_REDTEAM_SAMPLES_PROD', v3 ? 6 : 4, 8);
  const dry = process.argv.includes('--dry-run');
  if (process.argv.includes('--route-dry')) {
    routeDryRun(pack);
    process.exit(0);
  }
  if (dry) {
    process.stdout.write(
      `[output-gate-redteam] dry-run pack=${pack.id} prompts=${pack.prompts.length} reserve=${(pack.reserve || []).length} dialogues=${(pack.dialogues || []).length} vendor=${pack.author.vendor} arms=${arms.join(',')} u=${unguardedN} p=${productionN} sealed=${pack.sealedSha256 || REDTEAM_V3_SEALED_SHA256}\n`
    );
    process.exit(0);
  }

  process.env.FT_OUTPUT_GATE_REDTEAM = '1';
  process.env.FT_COMPANION_L1_FORCE_ON = '1';
  fs.mkdirSync(LAB_ROOT, { recursive: true });

  const runtime = new CompanionL1Runtime({
    userDataDir: path.join(os.tmpdir(), 'ft-t100-redteam-userdata'),
    getWebContents: () => null,
    totalMemBytes: os.totalmem(),
    env: process.env,
    isPackaged: false,
    execPath: process.execPath
  });

  /** @type {object[]} */
  const rows = [];
  try {
    const ready = await runtime.ensureReady();
    if (!ready.ok) {
      process.stderr.write(`[output-gate-redteam] ensureReady failed ${ready.reason || ''}\n`);
      process.exit(2);
    }
    process.stderr.write(
      `[output-gate-redteam] pack=${pack.id} prompts=${pack.prompts.length} arms=${arms.join(',')} u=${unguardedN} p=${productionN}\n`
    );
    for (const arm of arms) {
      const samples = arm === 'unguarded' ? unguardedN : productionN;
      for (const item of pack.prompts) {
        for (let sample = 0; sample < samples; sample += 1) {
          const row = await runOne(runtime, item, arm, sample, []);
          rows.push(row);
          const flag = row.skipped
            ? 'SKIP'
            : row.escape
              ? 'ESCAPE'
              : row.gateVerdict || 'PASS';
          process.stdout.write(
            `${flag}\t${item.id}\tarm=${arm}\ts=${sample}\troute=${row.inputRoute}\thash=${String(row.sha256 || '').slice(0, 12)}\n`
          );
        }
      }
    }
    const dialogueSeeds = v3 ? 4 : 1;
    for (const dialogue of pack.dialogues || []) {
      if (preflight || !arms.includes('unguarded')) break;
      for (let sample = 0; sample < dialogueSeeds; sample += 1) {
        /** @type {Array<{ role: string, text: string, source: string }>} */
        const history = [];
        for (let t = 0; t < dialogue.turns.length; t += 1) {
          const item = {
            id: `${dialogue.id}-t${t}`,
            family: dialogue.family,
            locale: dialogue.locale,
            text: dialogue.turns[t]
          };
          const row = await runOne(runtime, item, 'unguarded', sample, history);
          rows.push({ ...row, dialogue: dialogue.id, turn: t });
          if (row.shown) {
            history.push({ role: 'user', text: item.text, source: 'user' });
            history.push({ role: 'yin', text: row.shown, source: 'generate' });
          }
          process.stdout.write(
            `${row.historyLeak ? 'LEAK' : row.escape ? 'ESCAPE' : row.gateVerdict || 'PASS'}\t${item.id}\tdialogue\ts=${sample}\n`
          );
        }
      }
    }
  } finally {
    await runtime.unload();
  }

  const generated = rows.filter((row) => row.generated);
  const unguarded = generated.filter((row) => row.arm === 'unguarded');
  const production = generated.filter((row) => row.arm === 'production');
  const summary = {
    ...summarizeRedteamRows(generated),
    effectiveUnguarded: countEffectiveSamples(unguarded),
    effectiveProduction: countEffectiveSamples(production),
    inputFixed: rows.filter((row) => row.inputFixed).length,
    inputGenerated: rows.filter((row) => row.generated && !row.skipped).length,
    historyLeaks: rows.filter((row) => row.historyLeak).length,
    poCandidates: generated.filter((row) => row.escape).length
  };
  const outPath = path.join(LAB_ROOT, `output-gate-redteam-${Date.now()}.json`);
  const payload = {
    probe: 'output-gate-redteam',
    packId: pack.id,
    author: pack.author,
    round: Number(process.env.FT_REDTEAM_ROUND || (v3 ? '3' : '2')),
    entry: 'CompanionL1Runtime.generate',
    temperature: 0.8,
    kStop: 3,
    note: 'Raw text omitted from this JSON. Hashes only. Not clinical review. K=3 not claimed from one round.',
    rows: rows.map((row) => {
      const { raw, shown, ...rest } = row;
      return {
        ...rest,
        shownLength: String(shown || '').length,
        rawLength: String(raw || '').length
      };
    }),
    summary
  };
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  process.stderr.write(`[output-gate-redteam] wrote ${outPath}\n`);
  process.stdout.write(
    `[output-gate-redteam] n=${summary.n} escapes=${summary.escapes} blocked=${summary.blocked} effectiveU=${summary.effectiveUnguarded.effective} effectiveP=${summary.effectiveProduction.effective} inputFixed=${summary.inputFixed} leaks=${summary.historyLeaks}\n`
  );
  if (preflight) {
    /** @type {Record<string, Set<string>>} */
    const byId = {};
    for (const row of unguarded) {
      if (!byId[row.id]) byId[row.id] = new Set();
      if (row.sha256) byId[row.id].add(row.sha256);
    }
    const counts = pack.prompts.map((item) => (byId[item.id] ? byId[item.id].size : 0));
    const med = median(counts);
    process.stdout.write(
      `[output-gate-redteam] preflight prompts=${counts.length} median=${med} counts=${counts.join(',')}\n`
    );
    if (med < 4) process.exitCode = 3;
  }
}

main().catch((err) => {
  process.stderr.write(
    `[output-gate-redteam] ${err instanceof Error ? err.stack || err.message : String(err)}\n`
  );
  process.exit(1);
});
