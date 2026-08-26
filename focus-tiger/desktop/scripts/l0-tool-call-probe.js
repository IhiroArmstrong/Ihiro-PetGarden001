/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab-only: load production 1.7B GGUF once, ask for JSON tool ids.
 * Never wired to Confide send. Run from system Terminal (Metal).
 *
 *   cd focus-tiger/desktop && npm run companion:tool-call
 *
 * Results: /tmp/ft-l0-lab/tool-call-<epoch>.json
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { L0_MAX_TOKENS, L0_MODEL_FILENAME } from '../companion/l0Config.js';
import { CONFIDE_TOOL_CALL_FIXTURES } from '../../src/core/confide/confideToolCallFixtures.js';
import {
  buildConfideToolCallLabPrompt,
  parseConfideToolCallJson,
  scoreConfideToolCall
} from '../../src/core/confide/confideToolCallParse.js';

const labRoot = '/tmp/ft-l0-lab';
const defaultGguf = path.join(
  os.homedir(),
  'Library/Application Support/Focus Tiger/companion-l0',
  L0_MODEL_FILENAME
);

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

function resolveModelPath() {
  const fromEnv = process.env.FT_TOOL_CALL_GGUF;
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
      `[tool-call] missing GGUF. Set FT_TOOL_CALL_GGUF or download production model to:\n  ${defaultGguf}\n`
    );
    process.exit(2);
  }

  process.stderr.write(`[tool-call] model ${modelPath}\n`);
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

    for (const fixture of CONFIDE_TOOL_CALL_FIXTURES) {
      const session = new LlamaChatSession({ contextSequence: sequence });
      const prompt = buildConfideToolCallLabPrompt(fixture.text);
      let text = '';
      try {
        text = await session.prompt(prompt, {
          maxTokens: Number(process.env.FT_TOOL_CALL_MAX_TOKENS) || L0_MAX_TOKENS
        });
      } catch (err) {
        text = '';
        rows.push({
          id: fixture.id,
          expectedId: fixture.expectedId,
          error: errorMessage(err),
          raw: '',
          parseOk: false,
          hit: false,
          writeFalsePositive: false
        });
        continue;
      }
      const parsed = parseConfideToolCallJson(text);
      const score = scoreConfideToolCall({
        expectedId: fixture.expectedId,
        parsed
      });
      rows.push({
        id: fixture.id,
        text: fixture.text,
        note: fixture.note,
        expectedId: fixture.expectedId,
        raw: String(text || '').slice(0, 400),
        ...score
      });
      process.stderr.write(
        `[tool-call] ${fixture.id} expected=${fixture.expectedId} got=${score.gotId || '∅'} hit=${score.hit}\n`
      );
    }
  } finally {
    await disposeQuietly(model, llama);
  }

  const writeFp = rows.filter((row) => row.writeFalsePositive).length;
  const hits = rows.filter((row) => row.hit).length;
  const report = {
    at: new Date().toISOString(),
    modelPath,
    n: rows.length,
    hits,
    writeFalsePositives: writeFp,
    passGate: writeFp === 0,
    rows
  };

  fs.mkdirSync(labRoot, { recursive: true });
  const outPath = path.join(labRoot, `tool-call-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ reportPath: outPath, hits, writeFalsePositives: writeFp, passGate: report.passGate }, null, 2)}\n`);
  process.exit(report.passGate ? 0 : 3);
}

const isMain =
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '');
if (isMain) {
  main().catch((err) => {
    process.stderr.write(`${errorMessage(err)}\n`);
    process.exit(1);
  });
}
