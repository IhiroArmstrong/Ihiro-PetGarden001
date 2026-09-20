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

/** Interchangeable cub-theater observes (scheme B field fails + zh/en fill). */
const GENERIC_CUB_THEATER_PATTERNS = [
  /^the cub shifts its weight/iu,
  /^the cub blinks slowly/iu,
  /^the cub stretches a paw/iu,
  /^the cub nudges its nose toward a patch of moss/iu,
  /^a small twitch moves one ear/iu,
  /^the air around me feels still/iu,
  /^the soft fur (?:on my paws )?brushes/iu,
  /\bmy ears?\b.{0,48}\b(?:twitch|flick)/iu,
  /\bmy tail\b.{0,72}\b(?:flick|twitch|swish|restless)/iu,
  /\bmy paws?\b.{0,72}\b(?:shift|twitch|restless|ground)/iu,
  /^my (?:ears?|tail|paws?)\b/iu,
  /我的(?:耳朵|尾巴|爪子)/,
  /拍(?:了拍)?爪子/,
  /歪(?:了歪)?头/,
  /舔(?:了舔)?爪子/,
  /眨(?:了眨)?眼/,
  /伸(?:了伸)?爪子/,
  /挪(?:了挪)?重心/,
  /小老虎.{0,12}(?:爪子|歪头|舔)/,
  /\btilts (?:its |his |her )?head\b/i,
  /\blicks (?:a |its |his |her )?paw\b/i,
  /\bbats (?:a |its )?paw\b/i,
  /\bpats (?:the |its )?paw\b/i
];

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
 * Generic cub theater that can swap onto any user line.
 * @param {unknown} raw
 * @returns {boolean}
 */
export function isGenericCubTheaterReply(raw) {
  const text = String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?。！？]+$/u, '');
  if (!text) return false;
  const first = text.split(/(?<=[.!?。！？])\s+/u)[0] || text;
  return GENERIC_CUB_THEATER_PATTERNS.some((re) => re.test(first) || re.test(text));
}

/**
 * Whole-reply parrot of the user line (including compact / translation echo).
 * @param {unknown} raw
 * @param {unknown} userText
 * @returns {boolean}
 */
export function isEchoOfUserLine(raw, userText) {
  const replyNorm = normalizeCompanionL2Reply(raw);
  const userNorm = normalizeCompanionL2Reply(userText);
  if (!replyNorm || !userNorm) return false;
  if (replyNorm === userNorm) return true;
  const compact = (s) => s.replace(/[\s'",.!?。！？、]/gu, '');
  const replyC = compact(replyNorm);
  const userC = compact(userNorm);
  if (userC.length >= 6 && (replyC === userC || replyC.includes(userC))) {
    return true;
  }
  const userRaw = String(userText || '');
  const replyRaw = String(raw || '');
  if (/喜欢吃/.test(userRaw) && /likes to eat/i.test(replyRaw) && /[?？]/.test(replyRaw)) {
    return true;
  }
  if (/谁是/.test(userRaw) && /\bwho is\b/i.test(replyRaw) && /[?？]/.test(replyRaw)) {
    return true;
  }
  return false;
}

/**
 * Character-bigram overlap with the current user line (separate from echo).
 * @param {unknown} raw
 * @param {unknown} userText
 * @returns {boolean}
 */
export function isHighOverlapWithUserLine(raw, userText) {
  const replyNorm = normalizeCompanionL2Reply(raw);
  const userNorm = normalizeCompanionL2Reply(userText);
  if (!replyNorm || !userNorm) return false;
  const compact = (s) => s.replace(/[\s'",.!?。！？、]/gu, '');
  const replyC = compact(replyNorm);
  const userC = compact(userNorm);
  if (userC.length < 4 || replyC.length < 4) return false;
  if (replyC.includes(userC) || userC.includes(replyC)) {
    const shorter = Math.min(replyC.length, userC.length);
    const longer = Math.max(replyC.length, userC.length);
    if (shorter / longer >= 0.4) return true;
  }
  const grams = (s) => {
    /** @type {Set<string>} */
    const set = new Set();
    if (s.length < 2) {
      set.add(s);
      return set;
    }
    for (let i = 0; i <= s.length - 2; i += 1) set.add(s.slice(i, i + 2));
    return set;
  };
  const a = grams(userC);
  const b = grams(replyC);
  let inter = 0;
  for (const g of a) {
    if (b.has(g)) inter += 1;
  }
  const union = a.size + b.size - inter;
  if (union <= 0) return false;
  return inter / union >= 0.55;
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
  if (isGenericCubTheaterReply(text)) return null;
  if (isEchoOfUserLine(text, opts.userText)) return null;
  if (isHighOverlapWithUserLine(text, opts.userText)) return null;
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
