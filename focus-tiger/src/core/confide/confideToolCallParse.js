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

/** Production Read Hybrid gloss for query_memory_list (2026-09-18 narrow). */
export const CONFIDE_READ_HYBRID_MEMORY_LIST_GLOSS_LINES = Object.freeze([
  `${CONFIDE_TOOL_ID.QUERY_MEMORY_LIST}: ONLY when the user explicitly asks to see, list, recall, or review`,
  'the specific things Yin has recorded/remembered about them (e.g. "what do you remember',
  'about me", "show me what you\'ve noted", "what have you recorded"). This is a request',
  'to retrieve a list of stored observations — not a request to reflect on feelings,',
  'recent activity, or personal history in open-ended terms.',
  'Do NOT classify as query_memory_list when the user is:',
  '- Describing or asking about their own recent state/activity in open-ended terms',
  '  ("what have I been busy with", "what have I been up to lately")',
  '- Asking WHY they did something / started something (reflective/emotional — use none, not list retrieval)',
  '- Making small talk that happens to mention time-related words (today, morning, lately,',
  '  started, been doing) without asking Yin to enumerate stored memories',
  '- Asking Yin to remember something NEW (different intent, not retrieval)',
  'Examples → none (not query_memory_list):',
  '- "What have I been spending my time on lately?"',
  '- "Do you remember why I started doing this?"',
  '- "What have I been busy with lately?"',
  '- "Why did I start practicing?"',
  'Examples → query_memory_list:',
  '- "Show me what you remember"',
  '- "What do you remember about me?"',
  '- "Can you list what you\'ve noted about me?"'
]);

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
    ...CONFIDE_READ_HYBRID_MEMORY_LIST_GLOSS_LINES,
    'Never invent backup, update, forget, or delete-all tools.',
    'If unsure, use none.',
    `User: ${utterance}`
  ].join('\n');
}
