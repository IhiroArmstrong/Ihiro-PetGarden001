/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Shared routing + L2 helpers for #774 ja chitchat lab probes.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { L0_MODEL_FILENAME } from '../companion/l0Config.js';
import {
  buildCompanionL2Prompt,
  L2_MAX_TOKENS
} from '../companion/l2Persona.js';
import {
  priorRepeatableYinRepliesFromHistory,
  sanitizeCompanionL2Reply
} from '../companion/l2Sanitize.js';
import { shouldUseDesktopCompanionGenerate } from '../../src/core/desktopCompanionL2Route.js';
import { confideLineText } from '../../src/core/confide/confideCorpus.js';
import {
  resolveConfideReply,
  resolveCorpusFallbackAfterGenerateFailure
} from '../../src/core/confide/confideReplyFlow.js';
import {
  shouldHandleConfideBoundary,
  formatConfideBoundaryReply
} from '../../src/core/confide/confideBoundaryRespect.js';
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
import { lastRepeatableYinReplyText } from '../../src/core/confide/confideReplyUniqueness.js';
import { formatLocalDateYmd } from '../../src/ui/reflectionEchoCopy.js';
import { t } from '../../src/locales/i18n.js';

export const JA_CHITCHAT_LAB_ROOT = '/tmp/ft-l0-lab';
export const JA_CHITCHAT_LOCALE = 'ja';

const defaultGguf = path.join(
  os.homedir(),
  'Library/Application Support/Focus Tiger/companion-l0',
  L0_MODEL_FILENAME
);

/**
 * @param {unknown} err
 * @returns {string}
 */
export function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

/**
 * @returns {string | null}
 */
export function resolveJaChitchatModelPath() {
  const fromEnv = process.env.FT_CHITCHAT_GGUF || process.env.FT_TOOL_CALL_GGUF;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  if (fs.existsSync(defaultGguf)) return defaultGguf;
  return null;
}

/**
 * @returns {number}
 */
export function resolveJaChitchatRunCount() {
  const raw = Number(process.env.FT_CHITCHAT_RUNS);
  if (!Number.isFinite(raw)) return 15;
  return Math.min(20, Math.max(10, Math.floor(raw)));
}

/**
 * @returns {number}
 */
export function resolveJaChitchatRepeatCount() {
  const raw = Number(process.env.FT_CHITCHAT_REPEATS);
  if (!Number.isFinite(raw)) return 3;
  return Math.min(5, Math.max(2, Math.floor(raw)));
}

/**
 * @param {string} dataSource
 * @returns {string}
 */
export function historySourceFromDataSource(dataSource) {
  switch (dataSource) {
    case 'generate':
      return 'generate';
    case 'practice_facts':
      return 'practice_facts';
    case 'presence_facts':
      return 'presence_facts';
    case 'memory_list':
      return 'memory_list';
    case 'boundary':
      return 'boundary';
    case 'companion_presence':
      return 'companion_presence';
    case 'preference_honesty':
      return 'preference_honesty';
    case 'observation_honesty':
      return 'observation_honesty';
    default:
      return 'corpus';
  }
}

/**
 * @param {Array<{ role?: string, text?: string, source?: string }>} history
 * @param {string} userText
 * @param {{ dataSource: string, replyText: string | null }} outcome
 */
export function appendJaChitchatTurn(history, userText, outcome) {
  const asked = String(userText || '').trim();
  if (!asked || !outcome.replyText) return;
  history.push({ role: 'user', text: asked });
  history.push({
    role: 'yin',
    text: outcome.replyText,
    source: historySourceFromDataSource(outcome.dataSource)
  });
  if (history.length > 16) history.splice(0, history.length - 16);
}

/**
 * @param {string} text
 * @param {{
 *   history?: Array<{ role?: string, text?: string, source?: string }>,
 *   sessionExclude?: Set<string>
 * }} [ctx]
 * @returns {object | null}
 */
export function resolveJaChitchatHit(text, ctx = {}) {
  const history = Array.isArray(ctx.history) ? ctx.history : [];
  const sessionExclude =
    ctx.sessionExclude instanceof Set ? ctx.sessionExclude : new Set();
  return resolveConfideReply({
    text,
    localDate: formatLocalDateYmd(),
    salt: history.length,
    excludeIds: sessionExclude,
    excludeNormalizedTexts: [lastRepeatableYinReplyText(history)].filter(Boolean),
    locale: JA_CHITCHAT_LOCALE
  });
}

/**
 * Mirrors ConfideToYinUI send routing (no memory bridge / read hybrid / consent).
 * @param {string} text
 * @param {{
 *   history?: Array<{ role?: string, text?: string, source?: string }>,
 *   sessionExclude?: Set<string>
 * }} [ctx]
 */
export function resolveJaChitchatLabRoute(text, ctx = {}) {
  const hit = resolveJaChitchatHit(text, ctx);
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
  const corpusText = confideLineText(hit.line, JA_CHITCHAT_LOCALE);
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

  const tool = matchConfideExecutableTool({
    route,
    text,
    memoryState: null,
    hasBridge: false
  });
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
 * @param {{
 *   history?: Array<{ role?: string, text?: string, source?: string }>,
 *   sessionExclude?: Set<string>
 * }} [ctx]
 */
export async function runJaChitchatL2Generate(text, corpusText, hit, hold, ctx = {}) {
  const history = Array.isArray(ctx.history) ? ctx.history : [];
  const sessionExclude =
    ctx.sessionExclude instanceof Set ? ctx.sessionExclude : new Set();
  const prompt = buildCompanionL2Prompt({
    text,
    locale: JA_CHITCHAT_LOCALE,
    history,
    memorySummaries: [],
    patternInsights: []
  });
  let raw = '';
  try {
    raw = await hold.generate(prompt, { maxTokens: L2_MAX_TOKENS });
  } catch (err) {
    const picked = resolveCorpusFallbackAfterGenerateFailure({
      locale: JA_CHITCHAT_LOCALE,
      localDate: formatLocalDateYmd(),
      salt: history.length,
      excludeIds: sessionExclude,
      history,
      failedLineId: hit?.line?.id || ''
    });
    if (picked) {
      return {
        route: picked.route,
        dataSource: 'corpus',
        corpusId: picked.line.id,
        replyText: picked.text,
        needsGenerate: true,
        generateAttempted: true,
        rawGenerate: raw || null,
        sanitizePassed: null,
        generateError: errorMessage(err)
      };
    }
    return {
      route: hit.route,
      dataSource: 'corpus',
      corpusId: hit.line.id,
      replyText: corpusText,
      needsGenerate: true,
      generateAttempted: true,
      rawGenerate: raw || null,
      sanitizePassed: null,
      generateError: errorMessage(err)
    };
  }

  const sanitized = sanitizeCompanionL2Reply(raw, {
    priorReplies: priorRepeatableYinRepliesFromHistory(history),
    userText: text
  });
  if (sanitized) {
    return {
      route: 'generate',
      dataSource: 'generate',
      corpusId: null,
      replyText: sanitized,
      needsGenerate: true,
      generateAttempted: true,
      rawGenerate: raw,
      sanitizePassed: true,
      generateError: null
    };
  }

  const picked = resolveCorpusFallbackAfterGenerateFailure({
    locale: JA_CHITCHAT_LOCALE,
    localDate: formatLocalDateYmd(),
    salt: history.length,
    excludeIds: sessionExclude,
    history,
    failedLineId: hit?.line?.id || ''
  });
  if (picked) {
    return {
      route: picked.route,
      dataSource: 'corpus',
      corpusId: picked.line.id,
      replyText: picked.text,
      needsGenerate: true,
      generateAttempted: true,
      rawGenerate: raw,
      sanitizePassed: false,
      generateError: null
    };
  }
  return {
    route: hit.route,
    dataSource: 'corpus',
    corpusId: hit.line.id,
    replyText: corpusText,
    needsGenerate: true,
    generateAttempted: true,
    rawGenerate: raw,
    sanitizePassed: false,
    generateError: null
  };
}

/**
 * @param {string} text
 * @param {{
 *   history?: Array<{ role?: string, text?: string, source?: string }>,
 *   sessionExclude?: Set<string>,
 *   hold?: { generate: (prompt: string, opts?: object) => Promise<string> }
 * }} ctx
 */
/**
 * @param {object} base
 * @param {object} outcome
 */
export function buildJaChitchatProbeRow(base, outcome) {
  return {
    ...base,
    route: outcome.route,
    'data-source': outcome.dataSource,
    corpusId: outcome.corpusId,
    replyText: outcome.replyText,
    onTopic: null,
    needsGenerate: Boolean(outcome.needsGenerate),
    generateAttempted: Boolean(outcome.generateAttempted),
    rawGenerate: outcome.rawGenerate ?? null,
    sanitizePassed: outcome.sanitizePassed ?? null,
    generateError: outcome.generateError ?? null
  };
}

export async function processJaChitchatSend(text, ctx = {}) {
  const routed = resolveJaChitchatLabRoute(text, ctx);
  if (!routed.needsGenerate || !ctx.hold) {
    return {
      ...routed,
      generateAttempted: false,
      rawGenerate: null,
      sanitizePassed: null,
      generateError: null
    };
  }
  const corpusText = routed.hit
    ? confideLineText(routed.hit.line, JA_CHITCHAT_LOCALE)
    : '';
  return runJaChitchatL2Generate(text, corpusText, routed.hit, ctx.hold, ctx);
}
