/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Help Center ask-card TTS: speak the closest on-screen answer.
 * Same accessibility standard as Confide T34 (speak displayed how-to text
 * when System TTS is available). Does not execute commands.
 *
 * SSOT: docs/task-briefs/task-help-center-ask-answer-tts.md
 */

import { findHelpCenterArticle } from './helpCenterCatalog.js';

/**
 * @param {string | null | undefined} text
 * @returns {boolean}
 */
export function shouldSpeakHelpCenterAskSurface(text) {
  return String(text || '').trim().length > 0;
}

/**
 * @param {string} title
 * @param {string} body
 * @returns {string}
 */
export function joinHelpCenterTitleAndBody(title, body) {
  const heading = String(title || '').trim();
  const article = String(body || '').trim();
  if (!heading) return article;
  if (!article) return heading;
  return `${heading}. ${article}`;
}

/**
 * Closest answer = first ranked article (title + body). Safety / empty
 * surfaces speak the same words shown on screen. Operating-command recap
 * stays on the existing Yin voice runner and is not built here.
 *
 * @param {{
 *   articleIds?: string[],
 *   empty?: boolean,
 *   emptyText?: string,
 *   safetyText?: string,
 *   translate?: (key: string) => string
 * }} [opts]
 * @returns {string}
 */
export function buildHelpCenterClosestAnswerSpeakText({
  articleIds = [],
  empty = false,
  emptyText = '',
  safetyText = '',
  translate
} = {}) {
  const safety = String(safetyText || '').trim();
  if (safety) return safety;

  const ids = Array.isArray(articleIds) ? articleIds : [];
  const firstId = ids[0];
  if (firstId && typeof translate === 'function') {
    const row = findHelpCenterArticle(firstId);
    if (row) {
      return joinHelpCenterTitleAndBody(translate(row.titleKey), translate(row.bodyKey));
    }
  }

  if (empty || ids.length === 0) {
    return String(emptyText || '').trim();
  }
  return '';
}
