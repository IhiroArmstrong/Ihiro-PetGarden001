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
 *   history?: Array<{ role?: string, text?: string, source?: string }>
 * }} [opts]
 * @returns {string}
 */
export function buildCompanionL2Prompt({
  text = '',
  locale = 'en',
  history = []
} = {}) {
  const lang = LANG[locale] || LANG.en;
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
    turns ? `Recent turns:\n${turns}` : '',
    `User: ${user}`,
    'Yin:'
  ]
    .filter(Boolean)
    .join('\n');
}
