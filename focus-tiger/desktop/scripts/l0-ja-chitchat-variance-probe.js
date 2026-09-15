/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Lab-only #774: batch variance probe for ja Confide chitchat diff samples.
 * Full routing: resolveConfideReply → interceptors → L2 generate when eligible.
 * Never wired to Confide send. Run from system Terminal (Metal).
 *
 *   cd focus-tiger/desktop && npm run companion:ja-chitchat-variance
 *   FT_CHITCHAT_RUNS=15 npm run companion:ja-chitchat-variance
 *
 * Results: /tmp/ft-l0-lab/compare-<epoch>.json
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { L0_MODEL_FILENAME } from '../companion/l0Config.js';
import { loadModelHold } from '../companion/l1Hold.js';
import {
  buildCompanionL2Prompt,
  L2_MAX_TOKENS
} from '../companion/l2Persona.js';
import { sanitizeCompanionL2Reply } from '../companion/l2Sanitize.js';
import { shouldUseDesktopCompanionGenerate } from '../../src/core/desktopCompanionL2Route.js';
import { confideLineText } from '../../src/core/confide/confideCorpus.js';
import {
  resolveConfideReply,
  resolveCorpusFallbackAfterGenerateFailure
} from '../../src/core/confide/confideReplyFlow.js';
import { shouldHandleConfideBoundary, formatConfideBoundaryReply } from '../../src/core/confide/confideBoundaryRespect.js';
import {
  shouldHandleConfideCompanionPresence,
  formatConfideCompanionPresenceReply
} from '../../src/core/confide/confideCompanionPresence.js';
import {
  shouldHandleConfidePreferenceHonesty,
  formatConfidePreferenceHonestyReply
} from '../../src/core/confide/confidePreferenceHonesty.js';
import {
  shouldHandleConfideObservationHonesty,
  formatConfideObservationHonestyReply
} from '../../src/core/confide/confideObservationHonesty.js';
import {
  CONFIDE_TOOL_ID,
  matchConfideExecutableTool
} from '../../src/core/confide/confideExecutableTools.js';
import { buildPracticeFactsReply } from '../../src/core/confide/confidePracticeFacts.js';
import { buildPresenceFactsReply } from '../../src/core/confide/confidePresenceFacts.js';
import { formatMemoryListReply } from '../../src/core/confide/confideMemoryList.js';
import { CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES } from '../../src/core/confide/confideJaChitchatVarianceFixtures.js';
import { t, setLocale } from '../../src/locales/i18n.js';

const labRoot = '/tmp/ft-l0-lab';
const LOCALE = 'ja';
const defaultGguf = path.join(
  os.homedir(),
  'Library/Application Support/Focus Tiger/companion-l0',
  L0_MODEL_FILENAME
);

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

function resolveModelPath() {
  const fromEnv = process.env.FT_CHITCHAT_GGUF || process.env.FT_TOOL_CALL_GGUF;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  if (fs.existsSync(defaultGguf)) return defaultGguf;
  return null;
}

/**
 * @returns {number}
 */
function resolveRunCount() {
  const raw = Number(process.env.FT_CHITCHAT_RUNS);
  if (!Number.isFinite(raw)) return 15;
  return Math.min(20, Math.max(10, Math.floor(raw)));
}

/**
 * Mirrors ConfideToYinUI send routing (no memory bridge / read hybrid / consent).
 * @param {string} text
 * @returns {{
 *   route: string,
 *   dataSource: string,
 *   corpusId: string | null,
 *   replyText: string | null,
 *   needsGenerate: boolean,
 *   hit: object | null
 * }}
 */
function resolveConfideLabRoute(text) {
  const hit = resolveConfideReply({ text, locale: LOCALE });
  if (!hit) {
    return {
      route: '',
      dataSource: 'none',
      corpusId: null,
      replyText: null,
      needsGenerate: false,
      hit: null
    };
  }
  const corpusText = confideLineText(hit.line, LOCALE);
  const route = hit.route;

  if (shouldHandleConfideBoundary({ route, text })) {
    return {
      route,
      dataSource: 'boundary',
      corpusId: null,
      replyText: formatConfideBoundaryReply(t),
      needsGenerate: false,
      hit
    };
  }
  if (shouldHandleConfideCompanionPresence({ route, text })) {
    return {
      route,
      dataSource: 'companion_presence',
      corpusId: null,
      replyText: formatConfideCompanionPresenceReply(t),
      needsGenerate: false,
      hit
    };
  }
  if (shouldHandleConfidePreferenceHonesty({ route, text })) {
    return {
      route,
      dataSource: 'preference_honesty',
      corpusId: null,
      replyText: formatConfidePreferenceHonestyReply(t),
      needsGenerate: false,
      hit
    };
  }
  if (shouldHandleConfideObservationHonesty({ route, text })) {
    return {
      route,
      dataSource: 'observation_honesty',
      corpusId: null,
      replyText: formatConfideObservationHonestyReply(t),
      needsGenerate: false,
      hit
    };
  }

  const tool = matchConfideExecutableTool({ route, text, memoryState: null, hasBridge: false });
  if (tool) {
    if (tool.id === CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION) {
      return {
        route,
        dataSource: 'practice_facts',
        corpusId: null,
        replyText: buildPracticeFactsReply(null, null, t, text),
        needsGenerate: false,
        hit
      };
    }
    if (tool.id === CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND) {
      return {
        route,
        dataSource: 'presence_facts',
        corpusId: null,
        replyText: buildPresenceFactsReply(null, t, text),
        needsGenerate: false,
        hit
      };
    }
    if (tool.id === CONFIDE_TOOL_ID.QUERY_MEMORY_LIST) {
      return {
        route,
        dataSource: 'memory_list',
        corpusId: null,
        replyText: formatMemoryListReply(null, t),
        needsGenerate: false,
        hit
      };
    }
  }

  const wantGenerate = shouldUseDesktopCompanionGenerate({
    route,
    generateEnabled: true,
    generateLayerOpen: true,
    hasGenerateFn: true
  });
  if (!wantGenerate) {
    return {
      route,
      dataSource: 'corpus',
      corpusId: hit.line.id,
      replyText: corpusText,
      needsGenerate: false,
      hit
    };
  }

  return {
    route,
    dataSource: 'generate',
    corpusId: null,
    replyText: null,
    needsGenerate: true,
    hit
  };
}

/**
 * @param {string} text
 * @param {string} corpusText
 * @param {object} hit
 * @param {{ generate: (prompt: string, opts?: object) => Promise<string> }} hold
 * @returns {Promise<{ route: string, dataSource: string, corpusId: string | null, replyText: string }>}
 */
async function runL2Generate(text, corpusText, hit, hold) {
  const prompt = buildCompanionL2Prompt({
    text,
    locale: LOCALE,
    history: [],
    memorySummaries: [],
    patternInsights: []
  });
  let raw = '';
  try {
    raw = await hold.generate(prompt, { maxTokens: L2_MAX_TOKENS });
  } catch (err) {
    const picked = resolveCorpusFallbackAfterGenerateFailure({
      locale: LOCALE,
      history: [],
      failedLineId: hit?.line?.id || ''
    });
    if (picked) {
      return {
        route: picked.route,
        dataSource: 'corpus',
        corpusId: picked.line.id,
        replyText: picked.text
      };
    }
    return {
      route: hit.route,
      dataSource: 'corpus',
      corpusId: hit.line.id,
      replyText: corpusText
    };
  }

  const sanitized = sanitizeCompanionL2Reply(raw, {
    priorReplies: [],
    userText: text
  });
  if (sanitized) {
    return {
      route: 'generate',
      dataSource: 'generate',
      corpusId: null,
      replyText: sanitized
    };
  }

  const picked = resolveCorpusFallbackAfterGenerateFailure({
    locale: LOCALE,
    history: [],
    failedLineId: hit?.line?.id || ''
  });
  if (picked) {
    return {
      route: picked.route,
      dataSource: 'corpus',
      corpusId: picked.line.id,
      replyText: picked.text
    };
  }
  return {
    route: hit.route,
    dataSource: 'corpus',
    corpusId: hit.line.id,
    replyText: corpusText
  };
}

async function main() {
  setLocale(LOCALE);
  const runs = resolveRunCount();
  const modelPath = resolveModelPath();
  if (!modelPath) {
    process.stderr.write(
      `[ja-chitchat] missing GGUF. Set FT_CHITCHAT_GGUF or download production model to:\n  ${defaultGguf}\n`
    );
    process.exit(2);
  }

  process.stderr.write(
    `[ja-chitchat] model ${modelPath} · locale ${LOCALE} · runs ${runs} · samples ${CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES.length}\n`
  );

  /** @type {object[]} */
  const rows = [];
  let hold = null;

  try {
    hold = await loadModelHold({
      modelPath,
      onProgress: (msg) => process.stderr.write(`[ja-chitchat] ${msg}\n`)
    });

    for (const fixture of CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES) {
      const text = fixture.text;
      const routed = resolveConfideLabRoute(text);
      const corpusText = routed.hit
        ? confideLineText(routed.hit.line, LOCALE)
        : '';

      for (let runIndex = 1; runIndex <= runs; runIndex += 1) {
        let outcome = routed;
        if (routed.needsGenerate) {
          outcome = await runL2Generate(text, corpusText, routed.hit, hold);
        }
        rows.push({
          fixtureId: fixture.id,
          input: text,
          runIndex,
          route: outcome.route,
          'data-source': outcome.dataSource,
          corpusId: outcome.corpusId,
          replyText: outcome.replyText,
          onTopic: null
        });
        process.stderr.write(
          `[ja-chitchat] ${fixture.id} run ${runIndex}/${runs} route=${outcome.route} source=${outcome.dataSource}\n`
        );
      }
    }
  } finally {
    if (hold && typeof hold.dispose === 'function') {
      await hold.dispose();
    }
  }

  const report = {
    at: new Date().toISOString(),
    issue: '774',
    locale: LOCALE,
    modelPath,
    runsPerSample: runs,
    sampleCount: CONFIDE_JA_CHITCHAT_VARIANCE_FIXTURES.length,
    rowCount: rows.length,
    rows
  };

  fs.mkdirSync(labRoot, { recursive: true });
  const outPath = path.join(labRoot, `compare-${Date.now()}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({ reportPath: outPath, rowCount: rows.length, runsPerSample: runs }, null, 2)}\n`
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
