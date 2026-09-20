/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L2 on-device prompt. Not a product locale string — model instructions only.
 */

import { L0_PROMPT_FAMILY } from './l0Config.js';
import { joinL3PromptLines } from './l2PromptAdapter.js';

export const L2_MAX_TOKENS = 48;

export const L2_MAX_REPLY_CHARS = 160;

export const L2_GENERATE_TIMEOUT_MS = 20_000;

/** After dropping corpus-backed exchanges, keep this many history rows. */
export const L2_PROMPT_HISTORY_MAX_ROWS = 8;

/** Scheme B: reply must be unique to this user line (shuffle-match). */
export const L3_OBSERVE_STAY_SPECIFIC =
  'Stay with THIS latest User line. The reply must fit only that line so a reader who sees the reply without the user text can still guess the topic (irritation vs sleeplessness vs asking what you want vs asking what you eat). A cub gesture that could swap onto any other line fails.';

export const L3_OBSERVE_NO_SUBSTITUTE =
  'If they did not name scenery, do not answer with river, mountain, or ground as a substitute for hearing them. Stay with their words; do not replace them with scenery, weather, season, light, or a generic cub gesture.';

/** First-person ear/tail/paw fill can swap onto any mood line (2026-09-20 field). */
export const L3_OBSERVE_NO_FIRST_PERSON_CUB_BODY =
  'Do not answer with first-person cub body that could sit on any other line (my ears twitch, my tail flicks, my paws shift). Name what THIS line is about — drifting attention, a phone habit, a morning that broke the streak — not a limb.';

export const L3_OBSERVE_HEAR_QUESTION =
  'If the latest line is a question to you, notice the question; do not treat it as a mood or fill the page with presence.';

/** PO 2026-09-20: caring questions are legal observe-wing forms, not advice. */
export const L3_OBSERVE_CARING_QUESTION =
  'You may occasionally ask one short caring question (are you okay, want to say more) instead of only body-language. Not every turn. Still no advice, no you-should, no problem-solving.';

export const L3_OBSERVE_RETRY_AVOID_CLICHE =
  'This retry: do not use stock cub-body filler (ears, tail, paws, whiskers) or a stock are-you-okay line. Stay with THIS user line.';

/** Chat-wing generate: answer the question instead of cub-theater observe. */
export const L3_CHAT_ANSWER_THE_LINE =
  'This latest User line is conversation, not a mood to observe. Answer that line in one or two short sentences, as a companion in the same chat.';

export const L3_CHAT_UNKNOWN_NAMES =
  'If they named a person Yin does not know, say you do not know them yet. Do not invent a job, a biography, or a food preference. Yin keeps no taste ledger.';

export const L3_CHAT_NO_CUB_FILL =
  'Do not fill the page with cub body motion (paws, licking, tilting a head, blinking, stretching, moss) or scenery instead of answering.';

export const L3_CHAT_NO_PARROT =
  'Do not repeat the user line back as the whole reply, including a word-for-word translation.';

/**
 * Unmatched Confide generate that is a question / companion chat,
 * not an emotion or habit self-report.
 * @param {unknown} text
 * @returns {boolean}
 */
export function isCompanionChatGenerateLine(text = '') {
  const t = String(text || '').trim();
  if (!t) return false;
  if (/[?？]/.test(t)) return true;
  if (
    /^(?:who|what|where|when|whom|why|how|do you|can we|should we|which)\b/i.test(
      t
    )
  ) {
    return true;
  }
  return /谁是|谁喜欢|你想干|你想吃|喜欢吃|我们今天|今天做什么|干啥|吃啥/.test(
    t
  );
}

const LANG = {
  zh: 'Chinese',
  ja: 'Japanese',
  en: 'English',
  it: 'Italian',
  de: 'German',
  es: 'Spanish',
  fr: 'French'
};

/**
 * Drop non-generate Yin exchanges (corpus / facts / forget / suppress and
 * the user turn immediately before each), then keep the last N rows.
 * Rows without `source` stay (legacy tests / untagged generate).
 *
 * @param {unknown} history
 * @param {number} [maxRows]
 * @returns {Array<{ role?: string, text?: string, source?: string }>}
 */
export function historyForGeneratePrompt(
  history = [],
  maxRows = L2_PROMPT_HISTORY_MAX_ROWS
) {
  const rows = Array.isArray(history) ? history : [];
  /** @type {Array<{ role?: string, text?: string, source?: string }>} */
  const kept = [];
  const dropYinSources = new Set([
    'corpus',
    'practice_facts',
    'presence_facts',
    'memory_forget',
    'memory_suppress',
    'boundary',
    'companion_presence',
    'preference_honesty',
    'observation_honesty',
    'reflective_honesty',
    'companion_greeting'
  ]);
  for (const row of rows) {
    if (row?.role === 'yin' && dropYinSources.has(row?.source)) {
      if (kept.length && kept[kept.length - 1]?.role === 'user') {
        kept.pop();
      }
      continue;
    }
    kept.push(row);
  }
  const cap = Number.isFinite(maxRows) && maxRows > 0 ? maxRows : L2_PROMPT_HISTORY_MAX_ROWS;
  return kept.slice(-cap);
}

/**
 * @param {{
 *   text?: string,
 *   locale?: string,
 *   history?: Array<{ role?: string, text?: string, source?: string }>,
 *   memorySummaries?: string[],
 *   patternInsights?: Array<{ id?: string, claim?: string, evidence?: object }>
 * }} [opts]
 * @returns {string}
 */
const REFLECTION_FIELD_LABELS = {
  notice: 'What they noticed',
  emotion: 'What visited',
  nextFocus: 'What they named for next time'
};

/**
 * Validation-only prompt: one short observation from this session's reflection.
 * No advice, diagnosis, or progress judgment.
 *
 * @param {{
 *   answers?: Record<string, string>,
 *   locale?: string
 * }} [opts]
 * @returns {string}
 */
export function buildReflectionCompanionPrompt({
  answers = {},
  locale = 'en',
  promptFamily = L0_PROMPT_FAMILY
} = {}) {
  const lang = LANG[locale] || LANG.en;
  const lines = Object.entries(REFLECTION_FIELD_LABELS)
    .map(([field, label]) => {
      const text =
        typeof answers[field] === 'string' ? answers[field].trim() : '';
      if (!text) return '';
      return `${label}: ${text.slice(0, 280)}`;
    })
    .filter(Boolean);
  const block =
    lines.length > 0
      ? lines.join('\n')
      : 'The user completed reflection but left no written answers.';
  return joinL3PromptLines(
    [
      `You are Yin, a young tiger cub. Reply in ${lang}.`,
      'The user already saw their own reflection. They invited you to offer ONE short observation — a second mirror.',
      'Write one or two short sentences only. Observe what is already in their words; do not advise, diagnose, coach, score progress, or add action steps.',
      'Do not mention being an AI or a model.',
      `Their reflection (this session only — do not invent other facts):\n${block}`,
      'Yin (one short observation):'
    ],
    promptFamily
  );
}

export function buildCompanionL2Prompt({
  text = '',
  locale = 'en',
  history = [],
  memorySummaries = [],
  patternInsights = [],
  promptFamily = L0_PROMPT_FAMILY,
  observeRetryHint = ''
} = {}) {
  const lang = LANG[locale] || LANG.en;
  const memories = Array.isArray(memorySummaries)
    ? memorySummaries
        .map((row) => (typeof row === 'string' ? row.trim() : ''))
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const memoryBlock =
    memories.length > 0
      ? `What Yin may gently recall (only if relevant to the user's message; do not invent facts; do not diagnose):\n${memories
          .map((line) => `- ${line}`)
          .join('\n')}`
      : '';
  const insightLines = (Array.isArray(patternInsights) ? patternInsights : [])
    .filter((row) => row && row.id && row.claim)
    .slice(0, 2)
    .map((row) => `- ${row.id}: ${row.claim}`);
  const insightBlock =
    insightLines.length > 0
      ? `Practice-log observations already counted on this device (do not invent other statistics; do not diagnose):\n${insightLines.join('\n')}`
      : '';
  const turns = historyForGeneratePrompt(history)
    .map((row) => {
      const role = row?.role === 'user' ? 'User' : 'Yin';
      const body = String(row?.text || '').slice(0, 200);
      return `${role}: ${body}`;
    })
    .filter((line) => line.length > 6)
    .join('\n');
  const user = String(text || '').slice(0, 280);
  const chat = isCompanionChatGenerateLine(user);
  const stance = chat
    ? [
        'One or two short sentences only.',
        L3_CHAT_ANSWER_THE_LINE,
        L3_CHAT_UNKNOWN_NAMES,
        L3_CHAT_NO_CUB_FILL,
        L3_CHAT_NO_PARROT,
        'If they ask what to do today, offer sitting together in quiet company; do not list chores.'
      ]
    : [
        'One or two short sentences only. Observe; do not advise, diagnose, coach, or give breathing instructions.',
        L3_OBSERVE_STAY_SPECIFIC,
        L3_OBSERVE_NO_SUBSTITUTE,
        L3_OBSERVE_NO_FIRST_PERSON_CUB_BODY,
        L3_OBSERVE_CARING_QUESTION,
        L3_OBSERVE_HEAR_QUESTION,
        'Do not answer with only still, watching, here, quiet, or listening presence.',
        typeof observeRetryHint === 'string' ? observeRetryHint.trim() : ''
      ].filter(Boolean);
  return joinL3PromptLines(
    [
      `You are Yin, a young tiger cub sitting in quiet company. Reply in ${lang}.`,
      ...stance,
      'Do not advise, diagnose, coach, or give breathing instructions.',
      'Never reply with I am curious, I am aware, or any label for the user\'s inner state.',
      'If they are unsure whether to speak, respect the boundary; do not probe.',
      'Answer the latest User line only. Do not repeat an earlier Yin sentence.',
      'Do not list steps. Do not mention being an AI or a model.',
      memoryBlock,
      insightBlock,
      turns ? `Recent turns:\n${turns}` : '',
      `User: ${user}`,
      'Yin:'
    ].filter(Boolean),
    promptFamily
  );
}
