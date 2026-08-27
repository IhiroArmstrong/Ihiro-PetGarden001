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
import { parseConfideReadHybridJson } from './confideToolCallParse.js';

/** L0 JSON classify for read hybrid; shorter than L3 generate. */
export const CONFIDE_READ_HYBRID_CLASSIFY_TIMEOUT_MS = 12_000;

/**
 * @param {{
 *   route?: string | null,
 *   regexTool?: { id?: string } | null,
 *   hasBridge?: boolean,
 *   hasClassifyFn?: boolean,
 *   wideViewport?: boolean,
 *   focusing?: boolean
 * }} [opts]
 * @returns {boolean}
 */
export function mayUseConfideReadHybrid({
  route = null,
  regexTool = null,
  hasBridge = false,
  hasClassifyFn = false,
  wideViewport = false,
  focusing = false
} = {}) {
  if (regexTool) return false;
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  if (!hasBridge || !hasClassifyFn || !wideViewport) return false;
  if (focusing) return false;
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
