/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Parse / score constrained JSON tool calls (lab + unit tests).
 * Production Confide must not import this into the send path.
 */

import {
  CONFIDE_EXECUTABLE_TOOLS,
  CONFIDE_LAB_NONE_TOOL_ID,
  CONFIDE_TOOL_ID,
  getConfideExecutableToolById
} from './confideExecutableTools.js';

export const CONFIDE_TOOL_CALL_ALLOWED_IDS = Object.freeze([
  CONFIDE_LAB_NONE_TOOL_ID,
  ...CONFIDE_EXECUTABLE_TOOLS.map((tool) => tool.id)
]);

/** Production read hybrid: none + auto-execute read tools only (no forget). */
export const CONFIDE_READ_HYBRID_ALLOWED_IDS = Object.freeze([
  CONFIDE_LAB_NONE_TOOL_ID,
  ...CONFIDE_EXECUTABLE_TOOLS.filter((tool) => tool.readOnly && tool.autoExecute).map(
    (tool) => tool.id
  )
]);

const FENCE_RE = /```(?:json)?\s*([\s\S]*?)```/i;

/**
 * @param {string} raw
 * @returns {string}
 */
export function extractJsonObjectText(raw) {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) return '';
  const fenced = text.match(FENCE_RE);
  const body = fenced ? String(fenced[1] || '').trim() : text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start < 0 || end <= start) return '';
  return body.slice(start, end + 1);
}

/**
 * @param {string} raw
 * @returns {{
 *   ok: boolean,
 *   tool: string | null,
 *   arguments: Record<string, unknown>,
 *   error?: string
 * }}
 */
export function parseConfideToolCallJson(raw) {
  return parseConfideToolCallJsonWithAllowed(raw, CONFIDE_TOOL_CALL_ALLOWED_IDS);
}

/**
 * @param {string} raw
 * @returns {ReturnType<typeof parseConfideToolCallJson>}
 */
export function parseConfideReadHybridJson(raw) {
  return parseConfideToolCallJsonWithAllowed(raw, CONFIDE_READ_HYBRID_ALLOWED_IDS);
}

/**
 * @param {string} raw
 * @param {readonly string[]} allowedIds
 */
function parseConfideToolCallJsonWithAllowed(raw, allowedIds) {
  const slice = extractJsonObjectText(raw);
  if (!slice) {
    return { ok: false, tool: null, arguments: {}, error: 'no_json_object' };
  }
  let parsed;
  try {
    parsed = JSON.parse(slice);
  } catch {
    return { ok: false, tool: null, arguments: {}, error: 'invalid_json' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, tool: null, arguments: {}, error: 'not_object' };
  }
  const tool =
    typeof parsed.tool === 'string'
      ? parsed.tool.trim()
      : typeof parsed.name === 'string'
        ? parsed.name.trim()
        : '';
  if (!tool || !allowedIds.includes(tool)) {
    return { ok: false, tool: tool || null, arguments: {}, error: 'unknown_tool' };
  }
  const args =
    parsed.arguments &&
    typeof parsed.arguments === 'object' &&
    !Array.isArray(parsed.arguments)
      ? parsed.arguments
      : parsed.args && typeof parsed.args === 'object' && !Array.isArray(parsed.args)
        ? parsed.args
        : {};
  return { ok: true, tool, arguments: args };
}

/**
 * @param {{ expectedId: string, parsed: ReturnType<typeof parseConfideToolCallJson> }} opts
 */
export function scoreConfideToolCall({ expectedId, parsed }) {
  const expected = typeof expectedId === 'string' ? expectedId.trim() : '';
  const got = parsed?.ok ? parsed.tool : null;
  const hit = Boolean(got && expected && got === expected);
  const writeIds = new Set([CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY]);
  const writeFalsePositive = Boolean(
    got && writeIds.has(got) && expected !== CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY
  );
  const expectedTool = getConfideExecutableToolById(expected);
  const missRead =
    Boolean(expectedTool && expectedTool.risk === 'read' && got !== expected);
  return {
    expectedId: expected,
    gotId: got,
    hit,
    writeFalsePositive,
    missRead,
    parseOk: Boolean(parsed?.ok)
  };
}

/**
 * Constrained prompt for the lab probe. Keep tools frozen; do not add App CLI.
 * @param {string} userText
 */
export function buildConfideToolCallLabPrompt(userText) {
  const utterance = typeof userText === 'string' ? userText.trim() : '';
  return [
    '/no_think',
    'You map one user sentence to a single tool. Reply with JSON only.',
    'Schema: {"tool":"<id>","arguments":{}}',
    'Allowed tool ids:',
    `- ${CONFIDE_LAB_NONE_TOOL_ID}: chit-chat, crisis, mood labels, or anything else`,
    `- ${CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION}: how long they practiced, when they usually sit, how they have been showing up, comparing two practice windows, or Arrival counts across windows`,
    `- ${CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND}: what mood looked like, presence tag counts, or comparing two check-in windows (not diagnoses)`,
    `- ${CONFIDE_TOOL_ID.QUERY_MEMORY_LIST}: list what Yin remembers on this device`,
    `- ${CONFIDE_TOOL_ID.FORGET_MEMORY_ENTRY}: forget one remembered topic (not bulk wipe)`,
    'Never invent backup, update, or delete-all tools.',
    'If unsure, use none.',
    `User: ${utterance}`
  ].join('\n');
}

/**
 * Production read hybrid prompt: read tools only; forget is never offered.
 * @param {string} userText
 */
export function buildConfideReadHybridPrompt(userText) {
  const utterance = typeof userText === 'string' ? userText.trim() : '';
  return [
    '/no_think',
    'You map one user sentence to a single read-only tool. Reply with JSON only.',
    'Schema: {"tool":"<id>","arguments":{}}',
    'Allowed tool ids:',
    `- ${CONFIDE_LAB_NONE_TOOL_ID}: chit-chat, crisis, mood labels, or anything else`,
    `- ${CONFIDE_TOOL_ID.QUERY_PRACTICE_DURATION}: how long they practiced, when they usually sit, how they have been showing up, comparing two practice windows, or Arrival counts across windows`,
    `- ${CONFIDE_TOOL_ID.QUERY_PRESENCE_TREND}: what mood looked like, presence tag counts, or comparing two check-in windows (not diagnoses)`,
    `- ${CONFIDE_TOOL_ID.QUERY_MEMORY_LIST}: list what Yin remembers on this device`,
    'Never invent backup, update, forget, or delete-all tools.',
    'If unsure, use none.',
    `User: ${utterance}`
  ].join('\n');
}
