/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * L2 on-device prompt. Not a product locale string — model instructions only.
 */

export const L2_MAX_TOKENS = 48;

export const L2_MAX_REPLY_CHARS = 160;

export const L2_GENERATE_TIMEOUT_MS = 20_000;

/** After dropping corpus-backed exchanges, keep this many history rows. */
export const L2_PROMPT_HISTORY_MAX_ROWS = 8;

const LANG = {
  zh: 'Chinese',
  ja: 'Japanese',
  en: 'English'
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
    'memory_suppress'
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
  locale = 'en'
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
  return [
    '/no_think',
    `You are Yin, a young tiger cub. Reply in ${lang}.`,
    'The user already saw their own reflection. They invited you to offer ONE short observation — a second mirror.',
    'Write one or two short sentences only. Observe what is already in their words; do not advise, diagnose, coach, score progress, or add action steps.',
    'Do not mention being an AI or a model.',
    `Their reflection (this session only — do not invent other facts):\n${block}`,
    'Yin (one short observation):'
  ].join('\n');
}

export function buildCompanionL2Prompt({
  text = '',
  locale = 'en',
  history = [],
  memorySummaries = [],
  patternInsights = []
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
  return [
    '/no_think',
    `You are Yin, a young tiger cub sitting in quiet company. Reply in ${lang}.`,
    'One or two short sentences only. Observe; do not advise, diagnose, coach, or give breathing instructions.',
    'Answer the latest User line only. Do not repeat an earlier Yin sentence.',
    'Do not list steps. Do not mention being an AI or a model.',
    memoryBlock,
    insightBlock,
    turns ? `Recent turns:\n${turns}` : '',
    `User: ${user}`,
    'Yin:'
  ]
    .filter(Boolean)
    .join('\n');
}
