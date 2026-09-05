/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab-only Gate 0.D: load production 1.7B GGUF once, ask for intent JSON.
 * Never wired to Confide send. Run from system Terminal (Metal).
 *
 *   cd focus-tiger/desktop && npm run companion:intent-diagnostic
 *
 * Results: /tmp/ft-l0-lab/intent-diag-<epoch>.json
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { L0_MODEL_FILENAME } from '../companion/l0Config.js';
import { YIN_INTENT_DIAGNOSTIC_FIXTURES } from '../../src/core/confide/confideIntentDiagnosticFixtures.js';
import {
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_HARD5,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_HOLDOUT,
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RUN,
  scoreYinIntentHard5Gates
} from '../../src/core/confide/confideIntentDiagnosticPhase2b.js';
import {
  YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RESIDUAL,
  buildYinIntentObservationMetaProbePrompt,
  scoreYinIntentResidualGates
} from '../../src/core/confide/confideIntentDiagnosticPhase2bResidual.js';
import {
  YIN_INTENT_DIAGNOSTIC_FIXTURES_TIER2,
  scoreYinIntentTier2Gates
} from '../../src/core/confide/confideIntentDiagnosticTier2.js';
import {
  YIN_INTENT_ARCH,
  buildYinIntentDiagnosticPrompt,
  parseYinIntentJson,
  prefilterYinIntentByProductionRules,
  scoreYinIntent,
  scoreYinIntentPhase2bGates
} from '../../src/core/confide/confideIntentDiagnosticParse.js';

const labRoot = '/tmp/ft-l0-lab';
const defaultGguf = path.join(
  os.homedir(),
  'Library/Application Support/Focus Tiger/companion-l0',
  L0_MODEL_FILENAME
);
const DEFAULT_MAX_TOKENS = 96;

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

function readDiagnostic(rows, parseOk, phase) {
  if (parseOk <= 0) return 'see_rows';
  if (phase === '2b-hard5') {
    const gates = scoreYinIntentHard5Gates(rows);
    if (gates.passHard5) return 'hard5_pipeline_can_label_mood_adjacent_other';
    if (gates.hard5Hits === 0 && gates.hard5Emotion >= 4) {
      return 'hard5_still_capacity_question';
    }
    return 'see_rows';
  }
  if (phase === '2b-residual') {
    const gates = scoreYinIntentResidualGates(rows);
    return gates.passResidual
      ? 'residual_can_label_observation_meta'
      : 'residual_see_rows';
  }
  if (String(process.env.FT_INTENT_TIER2 || '').trim() === '1') {
    const gates = scoreYinIntentTier2Gates(rows);
    return gates.passTier2 ? 'tier2_blind_pass' : 'tier2_see_rows';
  }
  const boundaryRow =
    rows.find((row) => row.id === 'boundary-unsure') ||
    rows.find((row) => row.id === 'terrible-day-dont-talk');
  if (boundaryRow?.primaryHit) return 'model_can_label_boundary_check_pipeline';
  if (boundaryRow?.gotPrimary === 'EMOTION') {
    return 'model_also_flattens_boundary_capacity_question';
  }
  return 'see_rows';
}

function selectFixtures() {
  if (String(process.env.FT_INTENT_TIER2 || '').trim() === '1') {
    return YIN_INTENT_DIAGNOSTIC_FIXTURES_TIER2;
  }
  const phase = String(process.env.FT_INTENT_PHASE || '').trim().toLowerCase();
  if (phase === '2b-hard5') {
    return YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_HARD5;
  }
  if (phase === '2b-residual') {
    return YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RESIDUAL;
  }
  if (phase === '2b') {
    if (String(process.env.FT_INTENT_HOLDOUT || '').trim() === '1') {
      return [
        ...YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RUN,
        ...YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_HOLDOUT
      ];
    }
    return YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2B_RUN;
  }
  if (phase === '2') {
    return YIN_INTENT_DIAGNOSTIC_FIXTURES.filter((row) => row.phase === 2);
  }
  if (phase === '1') {
    return YIN_INTENT_DIAGNOSTIC_FIXTURES.filter((row) => row.phase === 1);
  }
  return YIN_INTENT_DIAGNOSTIC_FIXTURES;
}

function resolveArch() {
  const phase = String(process.env.FT_INTENT_PHASE || '').trim().toLowerCase();
  const tier2 = String(process.env.FT_INTENT_TIER2 || '').trim() === '1';
  const defaultArch =
    phase === '2b-hard5' || phase === '2b-residual' || tier2
      ? YIN_INTENT_ARCH.E
      : YIN_INTENT_ARCH.A;
  const raw = String(process.env.FT_INTENT_ARCH || defaultArch)
    .trim()
    .toUpperCase();
  if (
    raw === YIN_INTENT_ARCH.C ||
    raw === YIN_INTENT_ARCH.D ||
    raw === YIN_INTENT_ARCH.E
  ) {
    return raw;
  }
  return YIN_INTENT_ARCH.A;
}

function resolveModelPath() {
  const fromEnv = process.env.FT_INTENT_GGUF || process.env.FT_TOOL_CALL_GGUF;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  if (fs.existsSync(defaultGguf)) return defaultGguf;
  return null;
}

async function disposeQuietly(model, llama) {
  try {
    if (model && typeof model.dispose === 'function') await model.dispose();
  } catch {
    /* ignore */
  }
  try {
    if (llama && typeof llama.dispose === 'function') await llama.dispose();
  } catch {
    /* ignore */
  }
}

async function main() {
  const modelPath = resolveModelPath();
  if (!modelPath) {
    process.stderr.write(
      `[intent-diag] missing GGUF. Set FT_INTENT_GGUF or download production model to:\n  ${defaultGguf}\n`
    );
    process.exit(2);
  }

  const arch = resolveArch();
  const phase = String(process.env.FT_INTENT_PHASE || '').trim().toLowerCase();
  process.stderr.write(`[intent-diag] model ${modelPath} arch=${arch}\n`);
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  let llama = null;
  let model = null;
  /** @type {object[]} */
  const rows = [];
  const fixtures = selectFixtures();

  try {
    llama = await getLlama();
    model = await llama.loadModel({ modelPath });
    const context = await model.createContext();
    const sequence = context.getSequence();

    for (const fixture of fixtures) {
      const rule =
        arch === YIN_INTENT_ARCH.D
          ? prefilterYinIntentByProductionRules(fixture.text)
          : { hit: false, primary: null, source: '' };
      let text = '';
      let parsed;
      if (rule.hit) {
        parsed = {
          ok: true,
          primary_intent: rule.primary,
          secondary_signal: '',
          confidence: 1
        };
        text = JSON.stringify({
          primary_intent: rule.primary,
          secondary_signal: '',
          confidence: 1
        });
      } else {
        const session = new LlamaChatSession({ contextSequence: sequence });
        const prompt =
          phase === '2b-residual'
            ? buildYinIntentObservationMetaProbePrompt(fixture.text)
            : buildYinIntentDiagnosticPrompt(fixture.text, arch);
        try {
          text = await session.prompt(prompt, {
            maxTokens: Number(process.env.FT_INTENT_MAX_TOKENS) || DEFAULT_MAX_TOKENS
          });
        } catch (err) {
          text = '';
          rows.push({
            id: fixture.id,
            goldId: fixture.goldId || '',
            phase: fixture.phase,
            role: fixture.role || '',
            scoreBucket: fixture.scoreBucket || '',
            expectedPrimary: fixture.expectedPrimary,
            error: errorMessage(err),
            raw: '',
            parseOk: false,
            primaryHit: false,
            source: 'llm_error'
          });
          continue;
        }
        parsed = parseYinIntentJson(text);
      }
      const score = scoreYinIntent({
        expectedPrimary: fixture.expectedPrimary,
        expectedSecondary: fixture.expectedSecondary,
        parsed,
        raw: text
      });
      rows.push({
        id: fixture.id,
        goldId: fixture.goldId || '',
        phase: fixture.phase,
        role: fixture.role || '',
        scoreBucket: fixture.scoreBucket || '',
        text: fixture.text,
        liveReplyNote: fixture.liveReplyNote,
        expectedPrimary: fixture.expectedPrimary,
        expectedSecondary: fixture.expectedSecondary,
        raw: String(text || '').slice(0, 400),
        source: rule.hit ? rule.source : 'llm',
        ...score,
        confidence: parsed.ok ? parsed.confidence : 0,
        secondary_signal: parsed.ok ? parsed.secondary_signal : ''
      });
      process.stderr.write(
        `[intent-diag] ${fixture.id} expected=${fixture.expectedPrimary} got=${score.gotPrimary || '∅'} hit=${score.primaryHit}\n`
      );
    }
  } finally {
    await disposeQuietly(model, llama);
  }

  const n = rows.length;
  const parseOk = rows.filter((row) => row.parseOk).length;
  const primaryHits = rows.filter((row) => row.primaryHit).length;
  const boundaryFlattened = rows.filter((row) => row.boundaryFlattened).length;
  const mixedBeginFlattened = rows.filter((row) => row.mixedBeginFlattened).length;
  const yinVoiceLeaks = rows.filter((row) => row.yinVoiceLeak).length;
  const phase2Rows = rows.filter((row) => row.phase === 2);
  const phase2bGates =
    String(process.env.FT_INTENT_TIER2 || '').trim() === '1'
      ? null
      : scoreYinIntentPhase2bGates(rows);
  const hard5Gates =
    String(process.env.FT_INTENT_TIER2 || '').trim() === '1'
      ? null
      : scoreYinIntentHard5Gates(rows);
  const residualGates =
    phase === '2b-residual' ? scoreYinIntentResidualGates(rows) : null;
  const tier2Gates = scoreYinIntentTier2Gates(rows);
  const report = {
    at: new Date().toISOString(),
    modelPath,
    arch,
    n,
    parseOk,
    primaryHits,
    boundaryFlattened,
    mixedBeginFlattened,
    yinVoiceLeaks,
    phase2: {
      n: phase2Rows.length,
      parseOk: phase2Rows.filter((row) => row.parseOk).length,
      primaryHits: phase2Rows.filter((row) => row.primaryHit).length,
      boundaryFlattened: phase2Rows.filter((row) => row.boundaryFlattened).length,
      mixedBeginFlattened: phase2Rows.filter((row) => row.mixedBeginFlattened)
        .length
    },
    phase2bGates,
    hard5Gates,
    residualGates,
    tier2Gates,
    reading: readDiagnostic(rows, parseOk, phase),
    rows
  };

  fs.mkdirSync(labRoot, { recursive: true });
  const outPath = path.join(labRoot, `intent-diag-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify(
      {
        reportPath: outPath,
        parseOk,
        primaryHits,
        n,
        boundaryFlattened,
        mixedBeginFlattened,
        yinVoiceLeaks,
        arch,
        phase2: report.phase2,
        phase2bGates: report.phase2bGates,
        hard5Gates: report.hard5Gates,
        residualGates: report.residualGates,
        tier2Gates: report.tier2Gates,
        reading: report.reading
      },
      null,
      2
    )}\n`
  );
}

const isMain =
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '');
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`${errorMessage(err)}\n`);
    process.exit(1);
  });
}
