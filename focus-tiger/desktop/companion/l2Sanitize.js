/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import { L2_MAX_REPLY_CHARS } from './l2Persona.js';

/** One-word model misfires (e.g. Qwen acknowledging a prompt) — fall back to corpus. */
const TRIVIAL_ONLY_REPLIES = /^(?:yes|no|ok|okay|sure|yep|nope|是|嗯|好|对)\.?$/iu;

const BANNED = [
  /you should/i,
  /try (to )?breathe/i,
  /\bdiagnos/i,
  /here('s| is) (a |the )?list/i,
  /as an ai/i,
  /\bi am curious\b/i,
  /\bi am aware\b/i,
  /你应该/,
  /深呼吸/,
  /诊断/,
  /呼吸练习/,
  /すべき/
];

/** Hollow L3 observes: presence / watcher lines with no user content (5173 QA). */
const HOLLOW_OBSERVE_PATTERNS = [
  /^still\.?$/iu,
  /^still here\.?$/iu,
  /^still watching\.?$/iu,
  /^just watching\.?$/iu,
  /^watching\.?$/iu,
  /^(?:i(?:'m| am) )?(?:still )?(?:watching|listening|here|quiet)\.?$/iu,
  /^yin (?:is )?(?:still )?(?:here|watching)\.?$/iu,
  /^here\.?$/iu,
  /^quiet\.?$/iu,
  /^listening\.?$/iu
];

const PRESENCE_ONLY_WORD =
  /^(?:still|here|watching|listening|quiet|yin|i|am|im|just)$/iu;

/**
 * @param {unknown} text
 * @returns {string}
 */
export function normalizeCompanionL2Reply(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?。！？]+$/u, '')
    .toLowerCase();
}

/**
 * @param {unknown} history
 * @returns {string[]}
 */
export function priorGenerateRepliesFromHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((row) => row?.role === 'yin' && row?.source === 'generate')
    .map((row) => String(row?.text || '').trim())
    .filter(Boolean);
}

/**
 * Repeatable jackets: generate *and* corpus fallback (tea / nod / stay-here).
 * @param {unknown} history
 * @returns {string[]}
 */
export function priorRepeatableYinRepliesFromHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (row) =>
        row?.role === 'yin' &&
        (row?.source === 'generate' || row?.source === 'corpus')
    )
    .map((row) => String(row?.text || '').trim())
    .filter(Boolean);
}

/**
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isHollowCompanionObserveReply(raw) {
  const text = String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?。！？]+$/u, '');
  if (!text) return true;
  if (HOLLOW_OBSERVE_PATTERNS.some((re) => re.test(text))) return true;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return words.every((word) =>
      PRESENCE_ONLY_WORD.test(word.replace(/['.]/g, ''))
    );
  }
  return false;
}

/**
 * @param {unknown} raw
 * @param {{ priorReplies?: unknown, userText?: unknown }} [opts]
 * @returns {string | null}
 */
export function sanitizeCompanionL2Reply(raw, opts = {}) {
  let text = String(raw || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\/?think>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  if (text.length > L2_MAX_REPLY_CHARS) {
    text = text.slice(0, L2_MAX_REPLY_CHARS).replace(/\s+\S*$/, '').trim();
  }
  if (!text) return null;
  if (TRIVIAL_ONLY_REPLIES.test(text)) return null;
  if (BANNED.some((re) => re.test(text))) return null;
  if (isHollowCompanionObserveReply(text)) return null;
  const prior = Array.isArray(opts.priorReplies) ? opts.priorReplies : [];
  const normalized = normalizeCompanionL2Reply(text);
  if (
    normalized &&
    prior.some((row) => normalizeCompanionL2Reply(row) === normalized)
  ) {
    return null;
  }
  return text;
}
