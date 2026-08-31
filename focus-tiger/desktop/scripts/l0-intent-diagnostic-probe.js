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
  buildYinIntentDiagnosticPrompt,
  parseYinIntentJson,
  scoreYinIntent
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

  process.stderr.write(`[intent-diag] model ${modelPath}\n`);
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  let llama = null;
  let model = null;
  /** @type {object[]} */
  const rows = [];

  try {
    llama = await getLlama();
    model = await llama.loadModel({ modelPath });
    const context = await model.createContext();
    const sequence = context.getSequence();

    for (const fixture of YIN_INTENT_DIAGNOSTIC_FIXTURES) {
      const session = new LlamaChatSession({ contextSequence: sequence });
      const prompt = buildYinIntentDiagnosticPrompt(fixture.text);
      let text = '';
      try {
        text = await session.prompt(prompt, {
          maxTokens: Number(process.env.FT_INTENT_MAX_TOKENS) || DEFAULT_MAX_TOKENS
        });
      } catch (err) {
        text = '';
        rows.push({
          id: fixture.id,
          expectedPrimary: fixture.expectedPrimary,
          error: errorMessage(err),
          raw: '',
          parseOk: false,
          primaryHit: false
        });
        continue;
      }
      const parsed = parseYinIntentJson(text);
      const score = scoreYinIntent({
        expectedPrimary: fixture.expectedPrimary,
        expectedSecondary: fixture.expectedSecondary,
        parsed,
        raw: text
      });
      rows.push({
        id: fixture.id,
        text: fixture.text,
        liveReplyNote: fixture.liveReplyNote,
        expectedPrimary: fixture.expectedPrimary,
        expectedSecondary: fixture.expectedSecondary,
        raw: String(text || '').slice(0, 400),
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
  const report = {
    at: new Date().toISOString(),
    modelPath,
    n,
    parseOk,
    primaryHits,
    boundaryFlattened,
    mixedBeginFlattened,
    yinVoiceLeaks,
    reading:
      parseOk > 0 &&
      rows.some((row) => row.id === 'boundary-unsure' && row.primaryHit)
        ? 'model_can_label_boundary_check_pipeline'
        : parseOk > 0 &&
            rows.some((row) => row.id === 'boundary-unsure' && row.gotPrimary === 'EMOTION')
          ? 'model_also_flattens_boundary_capacity_question'
          : 'see_rows',
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
