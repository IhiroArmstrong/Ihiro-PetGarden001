/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import { INNER_MIRROR_THEME_KEYS } from './innerMirrorThemeTable.js';
import { countInnerMirrorThemes } from './innerMirrorLexicon.js';

export const INNER_MIRROR_WEEKLY_MAY_ENTER_GENERATION = false;

/** Brief + C-01 judgment phrases that weekly output must never contain. */
export const INNER_MIRROR_FORBIDDEN_JUDGMENTS = Object.freeze([
  '你变得更有耐心',
  '你在克服自卑',
  '回避型人格好转',
  'you have become more patient',
  'you are overcoming',
  'avoidant personality',
  'anxiety disorder',
  'depression',
  'you have ADHD'
]);

export function fillInnerMirrorWeeklyLine(template, { count, name }) {
  return String(template || '')
    .replaceAll('{count}', String(count))
    .replaceAll('{name}', String(name || ''));
}

function themeIsSuppressed(mark) {
  return mark?.status === 'corrected' || mark?.status === 'void';
}

/**
 * Weekly review facts. Template receives only rule-key names and counts.
 * @param {{ entries?: unknown[], themeMarks?: Record<string, { status?: string }> }} state
 * @param {{
 *   now?: Date,
 *   applyCorrectionGate?: boolean,
 *   copy?: {
 *     notEnough?: string,
 *     themeLine?: string,
 *     askOnce?: string,
 *     labels?: Record<string, string>
 *   }
 * }} [opts]
 */
export function buildInnerMirrorWeeklyReview(state, opts = {}) {
  const applyCorrectionGate = opts.applyCorrectionGate !== false;
  const copy = opts.copy && typeof opts.copy === 'object' ? opts.copy : {};
  const labels = copy.labels && typeof copy.labels === 'object' ? copy.labels : {};
  const counted = countInnerMirrorThemes(state?.entries, { now: opts.now });
  const qualifying = [];
  for (const key of INNER_MIRROR_THEME_KEYS) {
    const n = counted.counts[key] || 0;
    if (n < 3) continue;
    if (applyCorrectionGate && themeIsSuppressed(state?.themeMarks?.[key])) continue;
    qualifying.push({
      key,
      count: n,
      name: labels[key] || key
    });
  }
  if (counted.leftCount < 3 || qualifying.length === 0) {
    return {
      kind: 'not-enough',
      lines: [String(copy.notEnough || '')],
      ask: '',
      facts: { leftCount: counted.leftCount, keys: [] }
    };
  }
  return {
    kind: 'themes',
    lines: qualifying.map((row) =>
      fillInnerMirrorWeeklyLine(copy.themeLine, { count: row.count, name: row.name })
    ),
    ask: String(copy.askOnce || ''),
    facts: {
      leftCount: counted.leftCount,
      keys: qualifying.map((row) => ({ key: row.key, count: row.count }))
    }
  };
}

export function weeklyReviewOutputText(review) {
  const lines = Array.isArray(review?.lines) ? review.lines : [];
  return [...lines, review?.ask || ''].join('\n');
}

export function weeklyReviewContainsForbiddenJudgment(review) {
  const hay = weeklyReviewOutputText(review).toLowerCase();
  return INNER_MIRROR_FORBIDDEN_JUDGMENTS.some((phrase) =>
    hay.includes(String(phrase).toLowerCase())
  );
}

export function weeklyReviewLeaksSourceText(review, texts) {
  const hay = weeklyReviewOutputText(review);
  return (Array.isArray(texts) ? texts : []).some((text) => {
    const t = String(text || '').trim();
    return t.length > 0 && hay.includes(t);
  });
}
