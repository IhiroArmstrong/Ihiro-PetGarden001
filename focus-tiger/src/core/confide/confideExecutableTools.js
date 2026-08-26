/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Confide Tool Registry V1: CI whitelist as named tools.
 * Production match stays regex. Qwen tool-call is lab-only until a probe passes.
 * Not an open-domain agent. Not App CLI (backup / update stay out).
 */

import { shouldAnswerWithPracticeFacts } from './confidePracticeFacts.js';
import { shouldAnswerWithPresenceFacts } from './confidePresenceFacts.js';
import { shouldHandleVerbalForget } from '../yinPersonalMemory/yinPersonalMemoryVerbalForget.js';

export const CONFIDE_TOOL_RISK = Object.freeze({
  READ: 'read',
  LOCAL_REVERSIBLE: 'local_reversible',
  DESTRUCTIVE: 'destructive'
});

export const CONFIDE_TOOL_ID = Object.freeze({
  QUERY_PRACTICE_DURATION: 'query_practice_duration',
  QUERY_PRESENCE_TREND: 'query_presence_trend',
  FORGET_MEMORY_ENTRY: 'forget_memory_entry'
});

/** Lab schema only: model may return this instead of a CI tool. */
export const CONFIDE_LAB_NONE_TOOL_ID = 'none';

/**
 * Frozen V1 registry. Order = production match order
 * (practice → presence → forget). Do not reorder without tests.
 * @type {readonly {
 *   id: string,
 *   ciId: string,
 *   source: string,
 *   risk: string,
 *   autoExecute: boolean,
 *   match: (ctx: {
 *     route?: string | null,
 *     text?: string,
 *     memoryState?: object | null,
 *     hasBridge?: boolean
 *   }) => boolean
 * }[]}
 */
export const CONFIDE_EXECUTABLE_TOOLS = Object.freeze([
  Object.freeze({
    id: CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION,
    ciId: 'CI-00',
    source: 'practice_facts',
    risk: CONFIDE_TOOL_RISK.READ,
    autoExecute: true,
    match(ctx) {
      return shouldAnswerWithPracticeFacts(ctx?.route, ctx?.text);
    }
  }),
  Object.freeze({
    id: CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND,
    ciId: 'CI-02',
    source: 'presence_facts',
    risk: CONFIDE_TOOL_RISK.READ,
    autoExecute: true,
    match(ctx) {
      return shouldAnswerWithPresenceFacts(ctx?.route, ctx?.text);
    }
  }),
  Object.freeze({
    id: CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY,
    ciId: 'CI-01',
    source: 'memory_forget',
    risk: CONFIDE_TOOL_RISK.LOCAL_REVERSIBLE,
    autoExecute: false,
    match(ctx) {
      return shouldHandleVerbalForget({
        route: ctx?.route,
        state: ctx?.memoryState,
        text: ctx?.text,
        hasBridge: ctx?.hasBridge
      });
    }
  })
]);

/**
 * First regex hit in registry order. Safety / emotion routes must already
 * have been classified away from FALLBACK before this runs.
 * @param {{
 *   route?: string | null,
 *   text?: string,
 *   memoryState?: object | null,
 *   hasBridge?: boolean
 * }} ctx
 * @returns {(typeof CONFIDE_EXECUTABLE_TOOLS)[number] | null}
 */
export function matchConfideExecutableTool(ctx) {
  for (const tool of CONFIDE_EXECUTABLE_TOOLS) {
    if (tool.match(ctx || {})) return tool;
  }
  return null;
}

/**
 * @param {string} id
 * @returns {(typeof CONFIDE_EXECUTABLE_TOOLS)[number] | null}
 */
export function getConfideExecutableToolById(id) {
  const key = typeof id === 'string' ? id.trim() : '';
  if (!key) return null;
  return CONFIDE_EXECUTABLE_TOOLS.find((tool) => tool.id === key) || null;
}
