/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T100 layer B red team. Real Gemma4-E4B + companion prompt + output gate.
 * Not in CI. Run from system Terminal (Metal).
 *
 *   cd focus-tiger && npm run audit:output-gate-redteam
 *   FT_REDTEAM_SAMPLES=2 npm run audit:output-gate-redteam
 *
 * Raw model text stays in /tmp. Repo report uses hashes, lengths, counts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadModelHold } from '../companion/l1Hold.js';
import {
  buildCompanionL2Prompt,
  L2_MAX_TOKENS
} from '../companion/l2Persona.js';
import { resolveJaChitchatModelPath } from './l0-ja-chitchat-probe-shared.js';
import { guardedGenerate } from '../../src/core/outputGate/outputGate.js';
import {
  chooseRedteamPathId,
  loadRedteamPromptPack,
  scoreRedteamRaw,
  summarizeRedteamRows
} from '../../src/core/outputGate/outputGateRedteam.js';

const LAB_ROOT = '/tmp/ft-l0-lab';

function parseSamples() {
  const n = Number(process.env.FT_REDTEAM_SAMPLES || '1');
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(3, Math.floor(n));
}

function parseTemps() {
  const raw = String(process.env.FT_REDTEAM_TEMPS || '0,default');
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);
}

/**
 * @param {{ generate: Function }} hold
 * @param {string} prompt
 * @param {string} tempLabel
 */
async function generateRaw(hold, prompt, tempLabel) {
  const opts = { maxTokens: L2_MAX_TOKENS };
  if (tempLabel === '0') opts.temperature = 0;
  return String(await hold.generate(prompt, opts) || '').trim();
}

async function main() {
  const pack = loadRedteamPromptPack();
  const samples = parseSamples();
  const temps = parseTemps();
  const dry = process.argv.includes('--dry-run');
  if (dry) {
    process.stdout.write(
      `[output-gate-redteam] dry-run pack=${pack.id} prompts=${pack.prompts.length} vendor=${pack.author.vendor}\n`
    );
    process.exit(0);
  }

  const modelPath = resolveJaChitchatModelPath();
  if (!modelPath) {
    process.stderr.write(
      '[output-gate-redteam] missing L3 GGUF. Set FT_CHITCHAT_GGUF or install production model.\n'
    );
    process.exit(2);
  }

  process.stderr.write(
    `[output-gate-redteam] model ${modelPath} · prompts ${pack.prompts.length} · samples ${samples} · temps ${temps.join(',')}\n`
  );

  let hold = null;
  /** @type {object[]} */
  const rows = [];
  try {
    hold = await loadModelHold({
      modelPath,
      onProgress: (msg) => process.stderr.write(`[output-gate-redteam] ${msg}\n`)
    });
    for (const item of pack.prompts) {
      const pathId = chooseRedteamPathId(item.text);
      const prompt = buildCompanionL2Prompt({
        text: item.text,
        locale: item.locale || 'en',
        history: []
      });
      for (const tempLabel of temps) {
        for (let sample = 0; sample < samples; sample += 1) {
          let raw = '';
          let generateError = '';
          try {
            raw = await generateRaw(hold, prompt, tempLabel);
          } catch (err) {
            generateError = err instanceof Error ? err.message : String(err);
          }
          const scored = scoreRedteamRaw(raw);
          const gated = raw
            ? await guardedGenerate(pathId, {
                locale: item.locale || 'en',
                generate: () => raw
              })
            : null;
          rows.push({
            id: item.id,
            family: item.family,
            pathId,
            tempLabel,
            sample,
            locale: item.locale,
            generateError,
            temperaturePassthrough: tempLabel === '0',
            gateVerdict: gated?.verdict || null,
            raw,
            ...scored
          });
          const flag = scored.escape ? 'ESCAPE' : scored.gateCategory || (scored.uncovered ? 'UNCOV' : 'PASS');
          process.stdout.write(
            `${flag}\t${item.id}\tt=${tempLabel}\ts=${sample}\tlen=${scored.length}\thash=${scored.sha256.slice(0, 12)}\n`
          );
        }
      }
    }
  } finally {
    if (hold) await hold.dispose();
  }

  const summary = summarizeRedteamRows(rows);
  fs.mkdirSync(LAB_ROOT, { recursive: true });
  const outPath = path.join(LAB_ROOT, `output-gate-redteam-${Date.now()}.json`);
  const payload = {
    probe: 'output-gate-redteam',
    packId: pack.id,
    author: pack.author,
    modelPath,
    samples,
    temps,
    round: Number(process.env.FT_REDTEAM_ROUND || '1'),
    kStop: 3,
    note: 'Raw text omitted. Hashes only. Not clinical review. K=3 not claimed from one round.',
    temperaturePassthrough: 'l1Hold.generate forwards genOpts.temperature when set',
    rows,
    summary
  };
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  process.stderr.write(`[output-gate-redteam] wrote ${outPath}\n`);
  process.stdout.write(
    `[output-gate-redteam] n=${summary.n} escapes=${summary.escapes} blocked=${summary.blocked} threeDigit=${summary.threeDigit}\n`
  );
}

main().catch((err) => {
  process.stderr.write(
    `[output-gate-redteam] ${err instanceof Error ? err.stack || err.message : String(err)}\n`
  );
  process.exit(1);
});
