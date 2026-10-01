/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Splice the previous Confide turn into embedding input for shadow audit.
 * Does not persist a session summary. Electron wide `_l2Turns` only.
 * Live classify must use `priorConfideTurnForLiveClassify` (history has not
 * yet appended the current pair). Shadow logging uses `priorConfideTurnForShadow`.
 */

export const CONFIDE_SHADOW_PRIOR_USER_CHARS = 200;
export const CONFIDE_SHADOW_PRIOR_YIN_CHARS = 200;

/**
 * `_l2Turns` after the current user+yin pair was pushed.
 * @param {unknown} history
 * @returns {{ userText: string, yinText: string } | null}
 */
export function priorConfideTurnForShadow(history = []) {
  const rows = Array.isArray(history) ? history : [];
  if (rows.length < 4) return null;
  const priorUser = rows[rows.length - 4];
  const priorYin = rows[rows.length - 3];
  const currentUser = rows[rows.length - 2];
  const currentYin = rows[rows.length - 1];
  if (priorUser?.role !== 'user' || priorYin?.role !== 'yin') return null;
  if (currentUser?.role !== 'user' || currentYin?.role !== 'yin') return null;
  const userText = String(priorUser.text || '').trim();
  if (!userText) return null;
  return {
    userText,
    yinText: String(priorYin.text || '').trim()
  };
}

/**
 * `_l2Turns` before the current user line is sent (last complete user+yin pair).
 * @param {unknown} history
 * @returns {{ userText: string, yinText: string } | null}
 */
export function priorConfideTurnForLiveClassify(history = []) {
  const rows = Array.isArray(history) ? history : [];
  if (rows.length < 2) return null;
  const priorUser = rows[rows.length - 2];
  const priorYin = rows[rows.length - 1];
  if (priorUser?.role !== 'user' || priorYin?.role !== 'yin') return null;
  const userText = String(priorUser.text || '').trim();
  if (!userText) return null;
  return {
    userText,
    yinText: String(priorYin.text || '').trim()
  };
}

/**
 * Reuse Stage 2 live embed only when the shadow row would not lose with-prior.
 * Desktop copy: `desktop/companion/l1SemanticLiveCache.js` (runtime must not import src).
 * @param {object | null | undefined} cached
 * @param {{
 *   text?: string,
 *   contextualText?: string,
 *   hadPriorTurn?: boolean
 * }} [query]
 * @returns {boolean}
 */
export function canReuseConfideSemanticLiveCache(cached, query = {}) {
  if (!cached || cached.ok !== true) return false;
  const text = typeof query.text === 'string' ? query.text.trim() : '';
  if (!text || cached.text !== text) return false;
  const cachedCtx =
    typeof cached.contextualText === 'string' ? cached.contextualText.trim() : '';
  const ctx =
    typeof query.contextualText === 'string' ? query.contextualText.trim() : '';
  if (cachedCtx !== ctx) return false;
  if (query.hadPriorTurn && !cached.semanticResultWithPrior) return false;
  return true;
}

/**
 * @param {string} currentText
 * @param {{ userText?: string, yinText?: string } | null} prior
 * @returns {string}
 */
export function buildConfideShadowContextualText(currentText, prior) {
  const current = typeof currentText === 'string' ? currentText.trim() : '';
  if (!current || !prior) return '';
  const user = String(prior.userText || '')
    .trim()
    .slice(0, CONFIDE_SHADOW_PRIOR_USER_CHARS);
  const yin = String(prior.yinText || '')
    .trim()
    .slice(0, CONFIDE_SHADOW_PRIOR_YIN_CHARS);
  if (!user) return '';
  const yinLine = yin ? `Yin: ${yin}\n` : '';
  return `User: ${user}\n${yinLine}User: ${current}`;
}
