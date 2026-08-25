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
 * Drop corpus-backed exchanges (Yin `source === 'corpus'` and the user
 * turn immediately before it), then keep the last N rows.
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
  for (const row of rows) {
    if (row?.role === 'yin' && (row?.source === 'corpus' || row?.source === 'practice_facts')) {
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
