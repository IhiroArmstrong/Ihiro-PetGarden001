/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab: Prompt 13/14 layer B — generate 12 observe/chat lines, embed-match replies
 * back to user fixtures. Two rulers:
 *   §12 full: scoreL3ObserveShuffleMatches (ok rows, ≥8/12)
 *   observe wing: scoreObserveWingEffective (emotion+habit / 8, ≥6/8)
 *
 *   cd focus-tiger && npm run test:observe-shuffle-screen
 *   cd focus-tiger/desktop && npm run companion:observe-shuffle-screen
 *
 * Results: /tmp/ft-l0-lab/observe-shuffle-<epoch>.json
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
import { loadModelHold } from '../companion/l1Hold.js';
import {
  buildCompanionL2Prompt,
  isCompanionChatGenerateLine,
  L2_MAX_TOKENS,
  L3_OBSERVE_RETRY_AVOID_CLICHE
} from '../companion/l2Persona.js';
import { sanitizeCompanionL2Reply } from '../companion/l2Sanitize.js';
import {
  L3_OBSERVE_SHUFFLE_FIXTURES,
  L3_OBSERVE_SHUFFLE_PASS_HITS,
  L3_OBSERVE_WING_PASS_COUNT
} from '../companion/l3ObserveShuffleFixtures.js';
import {
  buildChatWingGrayRows,
  buildObserveShuffleGuessRows,
  evaluateObserveShuffleScreen,
  evaluateObserveWingGuardStreak,
  scoreObserveWingEffective
} from '../../src/core/l3ObserveShuffleScreen.js';
import { resolveJaChitchatModelPath } from './l0-ja-chitchat-probe-shared.js';

const LAB_ROOT = '/tmp/ft-l0-lab';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readPreviousObserveWingRates(labRoot) {
  if (!fs.existsSync(labRoot)) return [];
  return fs
    .readdirSync(labRoot)
    .filter((name) => /^observe-shuffle-\d+\.json$/.test(name))
    .sort()
    .map((name) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(labRoot, name), 'utf8'));
        const rate = data?.observeWing?.guardRejectRate;
        return typeof rate === 'number' ? rate : null;
      } catch {
        return null;
      }
    })
    .filter((rate) => typeof rate === 'number');
}

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

/**
 * @param {string} text
 * @returns {'zh' | 'en'}
 */
function resolveFixtureLocale(text) {
  return /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
}

/**
 * @param {{ generate: Function }} hold
 * @param {string} prompt
 */
async function generateReply(hold, prompt) {
  const raw = await hold.generate(prompt, { maxTokens: L2_MAX_TOKENS });
  return String(raw || '').trim();
}

/**
 * @param {{
 *   hold: { generate: Function },
 *   embedHold: Awaited<ReturnType<typeof loadEmbeddingHold>>,
 *   text: string,
 *   locale: string
 * }} opts
 */
async function generateSanitizedReply(opts) {
  const observeWing = !isCompanionChatGenerateLine(opts.text);
  const maxAttempts = observeWing ? 2 : 1;
  let lastReason = 'empty_or_banned';
  let sanitized = null;
  let raw = '';
  let clicheSkipped = false;
  let clicheFlagged = false;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const prompt = buildCompanionL2Prompt({
      text: opts.text,
      locale: opts.locale,
      history: [],
      observeRetryHint: attempt > 0 ? L3_OBSERVE_RETRY_AVOID_CLICHE : ''
    });
    raw = await generateReply(opts.hold, prompt);
    sanitized = sanitizeCompanionL2Reply(raw, { userText: opts.text });
    if (!sanitized) {
      lastReason = 'sanitize_rejected';
      break;
    }
    if (!observeWing) break;
    const cliche = await opts.embedHold.scoreObserveCliche(sanitized);
    if (cliche.skipped) {
      clicheSkipped = true;
      break;
    }
    if (!cliche.flagged) break;
    clicheFlagged = true;
    lastReason = 'observe_cliche';
    sanitized = null;
  }

  return {
    raw,
    reply: sanitized,
    observeWing,
    ok: Boolean(sanitized),
    reason: sanitized ? 'ok' : lastReason,
    clicheSkipped,
    clicheFlagged
  };
}

async function main() {
  const modelPath = resolveJaChitchatModelPath();
  const embeddingPath = defaultEmbeddingPath();
  if (!modelPath) {
    process.stderr.write(
      '[observe-shuffle-screen] missing L3 GGUF. Set FT_CHITCHAT_GGUF or install production model.\n'
    );
    process.exit(2);
  }
  if (!isGgufCachedAt(embeddingPath, L0_EMBEDDING_MODEL_MIN_BYTES)) {
    process.stderr.write(
      `[observe-shuffle-screen] missing embedding GGUF at ${embeddingPath}\n`
    );
    process.exit(2);
  }

  process.stderr.write(
    `[observe-shuffle-screen] l3 ${modelPath} · embedding ${embeddingPath} · fixtures ${L3_OBSERVE_SHUFFLE_FIXTURES.length}\n`
  );

  let hold = null;
  let embedHold = null;
  /** @type {Array<{ id: string, vector: number[] }>} */
  const fixtureVectors = [];
  /** @type {object[]} */
  const generatedRows = [];

  try {
    hold = await loadModelHold({
      modelPath,
      onProgress: (msg) => process.stderr.write(`[observe-shuffle-screen] ${msg}\n`)
    });
    embedHold = await loadEmbeddingHold({
      modelPath: embeddingPath,
      env: process.env,
      onProgress: (msg) => process.stderr.write(`[observe-shuffle-screen] ${msg}\n`)
    });

    for (const fixture of L3_OBSERVE_SHUFFLE_FIXTURES) {
      const vector = await embedHold.embedText(fixture.text);
      fixtureVectors.push({ id: fixture.id, vector });
    }

    for (const fixture of L3_OBSERVE_SHUFFLE_FIXTURES) {
      const locale = resolveFixtureLocale(fixture.text);
      let generated;
      try {
        generated = await generateSanitizedReply({
          hold,
          embedHold,
          text: fixture.text,
          locale
        });
      } catch {
        generated = {
          raw: '',
          reply: null,
          observeWing: !isCompanionChatGenerateLine(fixture.text),
          ok: false,
          reason: 'generate_error',
          clicheSkipped: false,
          clicheFlagged: false
        };
      }
      const replyVector = generated.reply ? await embedHold.embedText(generated.reply) : null;
      generatedRows.push({
        id: fixture.id,
        bucket: fixture.bucket,
        text: fixture.text,
        locale,
        observeWing: generated.observeWing,
        reply: generated.reply,
        raw: generated.raw,
        ok: generated.ok,
        reason: generated.reason,
        clicheSkipped: generated.clicheSkipped,
        clicheFlagged: generated.clicheFlagged,
        replyVector
      });
    }
  } finally {
    if (embedHold) await embedHold.dispose();
    if (hold) await hold.dispose();
  }

  const scoredRows = generatedRows.filter((row) => row.ok && row.replyVector);
  const guessRows = buildObserveShuffleGuessRows(
    scoredRows.map((row) => ({
      expectedId: row.id,
      replyVector: row.replyVector,
      fixtureVectors
    }))
  );
  const summary = evaluateObserveShuffleScreen(guessRows);
  const observeWing = scoreObserveWingEffective(generatedRows, guessRows);
  const chatWingGray = buildChatWingGrayRows(generatedRows, guessRows);
  const previousRates = readPreviousObserveWingRates(LAB_ROOT);
  const guardStreak = evaluateObserveWingGuardStreak([
    ...previousRates,
    observeWing.guardRejectRate
  ]);
  const observeById = new Map(observeWing.rows.map((row) => [row.id, row]));

  process.stdout.write(
    `[observe-shuffle-screen] generated=${generatedRows.length} scored=${scoredRows.length} §12=${summary.hits}/${summary.n} observe=${observeWing.passes}/${observeWing.n} passBar12=${L3_OBSERVE_SHUFFLE_PASS_HITS} passBar8=${L3_OBSERVE_WING_PASS_COUNT}\n\n`
  );
  for (const row of generatedRows) {
    const guess = guessRows.find((item) => item.expectedId === row.id);
    const observe = observeById.get(row.id);
    let status = 'SKIP';
    if (observe) {
      status = observe.outcome.toUpperCase();
    } else if (row.ok) {
      status = guess?.expectedId === guess?.guessedId ? 'CHAT_HIT' : 'CHAT_GRAY';
    } else {
      status = 'CHAT_SKIP';
    }
    process.stdout.write(
      `${status}\t${row.id}\t${row.bucket}\t${row.text}\t${row.reply || row.reason}\n`
    );
  }
  process.stdout.write('\n--- summary ---\n');
  process.stdout.write(
    `§12 ${summary.hits}/${summary.n} · pass=${summary.pass ? 'YES' : 'NO'} · bar=${summary.passBar}/${summary.minN} (does not block this knife)\n`
  );
  process.stdout.write(
    `observe-wing ${observeWing.passes}/${observeWing.n} · pass=${observeWing.pass ? 'YES' : 'NO'} · bar=${observeWing.passBar}/${observeWing.n} · hit=${observeWing.shuffleHit} guard_pass=${observeWing.guardPass} shuffle_miss=${observeWing.shuffleMiss} fail=${observeWing.fail} guard_skipped=${observeWing.guardSkipped}\n`
  );
  const guardPct = Math.round(observeWing.guardRejectRate * 100);
  let guardLine = `guard_reject_rate ${observeWing.guardRejects}/${observeWing.n}=${guardPct}%`;
  if (guardStreak.redStreak) {
    guardLine += ' · RED consecutive 2× >50% · cannot close #823 (does not exit 1)';
  } else if (guardStreak.yellowStreak) {
    guardLine += ' · YELLOW consecutive 2× >25% · alert only';
  } else if (observeWing.guardRed) {
    guardLine += ' · WARN red (single run; consecutive 2× >50% would block #823 close)';
  } else if (observeWing.guardYellow) {
    guardLine += ' · WARN yellow (single run; consecutive 2× >25% alerts, does not block)';
  }
  process.stdout.write(`${guardLine}\n`);
  process.stdout.write(`chat-wing gray ${chatWingGray.length} (ask-yin; not in 8-count)\n`);

  fs.mkdirSync(LAB_ROOT, { recursive: true });
  const outPath = path.join(LAB_ROOT, `observe-shuffle-${Date.now()}.json`);
  fs.writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        probe: 'observe-shuffle-screen',
        modelPath,
        embeddingPath,
        generatedRows: generatedRows.map((row) => ({
          ...row,
          replyVector: undefined
        })),
        guessRows,
        summary,
        observeWing,
        chatWingGray,
        guardStreak
      },
      null,
      2
    )}\n`
  );
  process.stderr.write(`[observe-shuffle-screen] wrote ${outPath}\n`);

  if (!observeWing.pass) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  process.stderr.write(
    `[observe-shuffle-screen] ${err instanceof Error ? err.stack || err.message : String(err)}\n`
  );
  process.exit(1);
});
