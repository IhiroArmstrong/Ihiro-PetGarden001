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

const LANG = {
  zh: 'Chinese',
  ja: 'Japanese',
  en: 'English'
};

/**
 * @param {{
 *   text?: string,
 *   locale?: string,
 *   history?: Array<{ role?: string, text?: string }>
 * }} [opts]
 * @returns {string}
 */
export function buildCompanionL2Prompt({
  text = '',
  locale = 'en',
  history = []
} = {}) {
  const lang = LANG[locale] || LANG.en;
  const turns = (Array.isArray(history) ? history : [])
    .slice(-8)
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
