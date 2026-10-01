/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Read-only Confide hybrid: regex-first, L0 fallback on miss only.
 * Qwen output is a candidate tool call — never auto-executes writes.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import {
  CONFIDE_LAB_NONE_TOOL_ID,
  getConfideExecutableToolById,
  isConfideHybridExecutableReadTool
} from './confideExecutableTools.js';
import { normalizeConfideIntentText } from './confideBoundaryRespect.js';
import {
  isConfideCoveredLedgerAsk,
  isConfideReflectiveOpenAsk
} from './confideReflectiveHonesty.js';
import { parseConfideReadHybridJson } from './confideToolCallParse.js';

/** L0 JSON classify for read hybrid; shorter than L3 generate. */
export const CONFIDE_READ_HYBRID_CLASSIFY_TIMEOUT_MS = 12_000;

/**
 * Paraphrases regex may miss but must still reach L0 classify (not substring traps).
 * @type {readonly RegExp[]}
 */
const READ_HYBRID_CLASSIFY_PARAPHRASE_RES = Object.freeze([
  /列出记忆/,
  /列出記憶/,
  /列出你记(?:得|住)的/,
  /列出你記(?:得|住)的/,
  /为什么开始做这(?:件)?事/,
  /為什麼開始做這(?:件)?事/
]);

/**
 * Conservative positive gate: only skip L0 classify when this returns false.
 * Reuses production ledger / reflective matchers; when unsure, keep classify.
 * @param {string} text
 * @returns {boolean}
 */
export function shouldRunConfideReadHybridClassify(text) {
  const raw = normalizeConfideIntentText(text);
  if (!raw) return false;
  if (isConfideCoveredLedgerAsk(raw)) return true;
  if (isConfideReflectiveOpenAsk(raw)) return true;
  return READ_HYBRID_CLASSIFY_PARAPHRASE_RES.some((re) => re.test(raw));
}

/**
 * @param {{
 *   route?: string | null,
 *   regexTool?: { id?: string } | null,
 *   hasBridge?: boolean,
 *   hasClassifyFn?: boolean,
 *   wideViewport?: boolean,
 *   focusing?: boolean,
 *   generateEnabled?: boolean
 * }} [opts]
 * @returns {boolean}
 */
export function mayUseConfideReadHybrid({
  route = null,
  regexTool = null,
  hasBridge = false,
  hasClassifyFn = false,
  wideViewport = false,
  focusing = false,
  generateEnabled = false
} = {}) {
  if (regexTool) return false;
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  if (!hasBridge || !hasClassifyFn || !wideViewport) return false;
  if (focusing) return false;
  if (!generateEnabled) return false;
  return true;
}

/**
 * Parse L0 JSON and resolve only registry read tools marked autoExecute.
 * @param {string} raw
 * @returns {(import('./confideExecutableTools.js').CONFIDE_EXECUTABLE_TOOLS[number]) | null}
 */
export function resolveConfideReadHybridToolFromRaw(raw) {
  const parsed = parseConfideReadHybridJson(raw);
  if (!parsed.ok) return null;
  if (parsed.tool === CONFIDE_LAB_NONE_TOOL_ID) return null;
  const tool = getConfideExecutableToolById(parsed.tool);
  return isConfideHybridExecutableReadTool(tool) ? tool : null;
}
