/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Phase 1A · Confide Show memory (CI-03).
 * Lists active Yin Personal Memory summaries. Never invents. Not L3.
 */

import { CONFIDE_ROUTE } from './confideRoutes.js';
import { listActiveYinMemories } from '../yinPersonalMemory/yinPersonalMemoryForget.js';
import { normalizeYinPersonalMemoryState } from '../yinPersonalMemory/yinPersonalMemorySchema.js';

/** Max summaries in the Confide template; the rest stay on the panel. */
export const CONFIDE_MEMORY_LIST_MAX = 6;

const LIST_QUESTION_RES = [
  /\bshow\s+me\s+what\s+you\s+remember\b/i,
  /\bshow\s+me\s+what\s+you(?:'ve|\s+have)\s+remembered\b/i,
  /\bcould you show me what you(?:'ve|\s+have)\s+remembered\b/i,
  /\bwhat\s+do\s+you\s+remember(?:\s+about\s+me)?\b/i,
  /\bwhat\s+do\s+you\s+remember\s+from\s+our\s+last\b/i,
  /\bwhat\s+have\s+you\s+remembered\b/i,
  /\bwhat\s+are\s+you\s+(still\s+)?keeping\s+(in\s+mind|about\s+me)\b/i,
  /\blist\s+what\s+you\s+remember\b/i,
  /\bwhat\s+do\s+you\s+keep\s+(in\s+memory|about\s+me)\b/i,
  /你还?记得(?:我)?(?:些什么|什么|哪些)/,
  /给我看(?:看)?你记(?:得|住)的/,
  /你记住了什么/,
  /你記(?:得|住)了?什麼/,
  /何を覚えて(?:いますか|いる)/,
  /覚えていることを見せて/,
  /記憶を見せて/
];

/**
 * @param {string} template
 * @param {Record<string, string | number>} vars
 */
function fill(template, vars) {
  let out = String(template || '');
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${key}}`, String(value));
  }
  return out;
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isMemoryListQuestion(text) {
  const raw = typeof text === 'string' ? text.trim() : '';
  if (!raw) return false;
  return LIST_QUESTION_RES.some((re) => re.test(raw));
}

/**
 * @param {string | null | undefined} route
 * @param {string} text
 * @param {boolean} [hasBridge]
 * @returns {boolean}
 */
export function shouldAnswerWithMemoryList(route, text, hasBridge = false) {
  if (!hasBridge) return false;
  if (route !== CONFIDE_ROUTE.FALLBACK) return false;
  return isMemoryListQuestion(text);
}

/**
 * @param {import('../yinPersonalMemory/yinPersonalMemorySchema.js').YinPersonalMemoryState | null | undefined} state
 * @param {(key: string) => string} tFn
 * @returns {string}
 */
export function formatMemoryListReply(state, tFn) {
  const lookup = (key) => tFn(key);
  const normalized = normalizeYinPersonalMemoryState(state);
  if (normalized.consent === 'denied') {
    return lookup('CONFIDE_MEMORY_LIST_DENIED');
  }
  if (normalized.consent !== 'granted') {
    return lookup('CONFIDE_MEMORY_LIST_UNDECIDED');
  }
  const active = listActiveYinMemories(normalized);
  if (!active.length) {
    return lookup('CONFIDE_MEMORY_LIST_NONE');
  }
  const shown = active.slice(0, CONFIDE_MEMORY_LIST_MAX);
  const items = shown
    .map((entry) => fill(lookup('CONFIDE_MEMORY_LIST_ITEM'), { summary: entry.summary }))
    .join('\n');
  let out = `${lookup('CONFIDE_MEMORY_LIST_HEADER')}\n${items}`;
  const extra = active.length - shown.length;
  if (extra > 0) {
    out += `\n${fill(lookup('CONFIDE_MEMORY_LIST_MORE'), { count: extra })}`;
  }
  return out;
}
