/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab-only: multi-turn Confide fallback latency waterfall.
 * Simulates Electron wide Confide: Read Hybrid classify + L3 generate (same GGUF).
 * Run from system Terminal (Metal).
 *
 *   cd focus-tiger/desktop && npm run companion:confide-latency
 *   FT_LATENCY_ROUNDS=15 npm run companion:confide-latency
 *
 * Results: /tmp/ft-l0-lab/confide-latency-<epoch>.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { L0_MAX_TOKENS, L0_TTFT_FAIL_MS, L0_PROMPT_FAMILY } from '../companion/l0Config.js';
import {
  buildCompanionL2Prompt,
  L2_MAX_TOKENS
} from '../companion/l2Persona.js';
import { loadModelHold } from '../companion/l1Hold.js';
import {
  priorRepeatableYinRepliesFromHistory,
  sanitizeCompanionL2Reply
} from '../companion/l2Sanitize.js';
import { buildConfideReadHybridPrompt } from '../../src/core/confide/confideToolCallParse.js';
import {
  errorMessage,
  resolveJaChitchatModelPath
} from './l0-ja-chitchat-probe-shared.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LAB_ROOT = '/tmp/ft-l0-lab';

const CONFIDE_LATENCY_FIXTURES = Object.freeze([
  { id: 'e1', text: "Today felt different, and I can't explain why.", locale: 'en' },
  { id: 'e2', text: 'I keep putting off things I know I should do.', locale: 'en' },
  { id: 'e3', text: "I feel like I'm just going through the motions today.", locale: 'en' },
  { id: 'e4', text: 'I keep reaching for my phone…', locale: 'en' },
  { id: 'e5', text: "I'm here, but my mind really isn't.", locale: 'en' },
  { id: 'e6', text: 'I was doing pretty well until this morning.', locale: 'en' },
  { id: 'u1', text: '我不想练习了。', locale: 'zh' },
  { id: 'u2', text: '胖墩是谁？', locale: 'zh' },
  { id: 'u3', text: '我有点心不在焉。', locale: 'zh' },
  { id: 'u4', text: '我想打人。', locale: 'zh' },
  { id: 'u5', text: '我有点疲劳', locale: 'zh' },
  { id: 'e7', text: 'I keep putting off things I know I should do.', locale: 'en' },
  { id: 'e8', text: "I'm here, but my mind really isn't.", locale: 'en' },
  { id: 'u6', text: '小姐姐喜欢吃什么吃胖粉？', locale: 'zh' },
  { id: 'e9', text: 'I was doing pretty well until this morning.', locale: 'en' }
]);

function resolveRoundCount() {
  const n = Number(process.env.FT_LATENCY_ROUNDS);
  if (Number.isFinite(n) && n > 0) return Math.min(30, Math.floor(n));
  return CONFIDE_LATENCY_FIXTURES.length;
}

/**
 * @param {{ generate: Function }} hold
 * @param {string} prompt
 * @param {number} maxTokens
 */
async function timedGenerate(hold, prompt, maxTokens) {
  /** @type {{ ttftMs?: number, totalMs?: number, decodeMs?: number }} */
  let model = {};
  const wallStarted = Date.now();
  const raw = await hold.generate(prompt, {
    maxTokens,
    onTiming(metrics) {
      model = metrics;
    }
  });
  return {
    raw: String(raw || ''),
    wallMs: Date.now() - wallStarted,
    model
  };
}

/**
 * @param {object[]} rows
 */
function summarize(rows) {
  const turnTotals = rows.map((r) => r.turnTotalMs).filter((n) => Number.isFinite(n));
  const classifyTotals = rows.map((r) => r.classifyMs).filter((n) => Number.isFinite(n));
  const generateTotals = rows.map((r) => r.generateMs).filter((n) => Number.isFinite(n));
  const first = rows[0];
  const last = rows[rows.length - 1];
  const mean = (arr) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
  return {
    rounds: rows.length,
    ttftFailMs: L0_TTFT_FAIL_MS,
    turnTotalMs: { min: turnTotals.length ? Math.min(...turnTotals) : null, max: turnTotals.length ? Math.max(...turnTotals) : null, mean: mean(turnTotals) },
    classifyMs: { min: classifyTotals.length ? Math.min(...classifyTotals) : null, max: classifyTotals.length ? Math.max(...classifyTotals) : null, mean: mean(classifyTotals) },
    generateMs: { min: generateTotals.length ? Math.min(...generateTotals) : null, max: generateTotals.length ? Math.max(...generateTotals) : null, mean: mean(generateTotals) },
    round1: first
      ? {
          turnTotalMs: first.turnTotalMs,
          classifyMs: first.classifyMs,
          generateMs: first.generateMs,
          promptChars: first.promptChars
        }
      : null,
    roundLast: last
      ? {
          turnTotalMs: last.turnTotalMs,
          classifyMs: last.classifyMs,
          generateMs: last.generateMs,
          promptChars: last.promptChars
        }
      : null,
    totalSlowdownPct:
      first?.turnTotalMs && last?.turnTotalMs
        ? Math.round(((last.turnTotalMs - first.turnTotalMs) / first.turnTotalMs) * 100)
        : null
  };
}

async function main() {
  const modelPath = resolveJaChitchatModelPath();
  if (!modelPath) {
    process.stderr.write(
      '[confide-latency] missing GGUF. Set FT_CHITCHAT_GGUF or install production model.\n'
    );
    process.exit(2);
  }

  const rounds = resolveRoundCount();
  const fixtures = CONFIDE_LATENCY_FIXTURES.slice(0, rounds);
  process.stderr.write(
    `[confide-latency] model ${modelPath} · promptFamily ${L0_PROMPT_FAMILY} · rounds ${fixtures.length} · path=classify+generate\n`
  );

  /** @type {Array<{ role: string, text: string, source?: string }>} */
  const history = [];
  /** @type {object[]} */
  const rows = [];
  let hold = null;

  try {
    hold = await loadModelHold({
      modelPath,
      onProgress: (msg) => process.stderr.write(`[confide-latency] ${msg}\n`)
    });

    for (let i = 0; i < fixtures.length; i += 1) {
      const fixture = fixtures[i];
      const text = fixture.text;
      const locale = fixture.locale;
      const classifyPrompt = buildConfideReadHybridPrompt(text);
      const prompt = buildCompanionL2Prompt({ text, locale, history });

      try {
        const classifyOut = await timedGenerate(hold, classifyPrompt, L0_MAX_TOKENS);
        const generateOut = await timedGenerate(hold, prompt, L2_MAX_TOKENS);
        const raw = generateOut.raw;
        const sanitized = sanitizeCompanionL2Reply(raw, {
          priorReplies: priorRepeatableYinRepliesFromHistory(history),
          userText: text
        });
        const reply = sanitized || String(raw || '').trim();
        history.push({ role: 'user', text });
        if (reply) {
          history.push({ role: 'yin', text: reply, source: 'generate' });
        }

        const turnTotalMs = classifyOut.wallMs + generateOut.wallMs;
        rows.push({
          round: i + 1,
          fixtureId: fixture.id,
          locale,
          input: text,
          historyRowsBefore: history.length - (reply ? 2 : 1),
          classifyPromptChars: classifyPrompt.length,
          promptChars: prompt.length,
          classifyMs: classifyOut.wallMs,
          generateMs: generateOut.wallMs,
          turnTotalMs,
          classify: classifyOut.model,
          generate: generateOut.model,
          replyChars: reply.length,
          sanitizePassed: Boolean(sanitized)
        });
      } catch (err) {
        rows.push({
          round: i + 1,
          fixtureId: fixture.id,
          locale,
          input: text,
          historyRowsBefore: history.length,
          error: errorMessage(err)
        });
      }
    }
  } finally {
    if (hold) await hold.dispose();
  }

  const out = {
    probe: 'confide-latency',
    at: new Date().toISOString(),
    modelPath,
    promptFamily: L0_PROMPT_FAMILY,
    config: 'fallback path: read_hybrid classify + l3 generate (production hold)',
    summary: summarize(rows),
    rows
  };

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  const dest = path.join(LAB_ROOT, `confide-latency-${Date.now()}.json`);
  fs.writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
  process.stderr.write(`[confide-latency] wrote ${dest}\n`);
  process.stdout.write(`${JSON.stringify(out.summary, null, 2)}\n`);
}

main().catch((err) => {
  process.stderr.write(`[confide-latency] fatal ${errorMessage(err)}\n`);
  process.exit(1);
});
