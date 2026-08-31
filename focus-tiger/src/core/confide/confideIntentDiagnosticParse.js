/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Parse / score constrained intent JSON (Gate 0.D lab).
 * Production Confide must not import this into the send path.
 */

import { extractJsonObjectText } from './confideToolCallParse.js';

export const YIN_INTENT_LABEL = Object.freeze({
  COMPANION_PRESENCE: 'COMPANION_PRESENCE',
  BEGIN: 'BEGIN',
  BOUNDARY: 'BOUNDARY',
  FORGET: 'FORGET',
  SUPPRESS: 'SUPPRESS',
  EMOTION: 'EMOTION',
  OTHER: 'OTHER'
});

export const YIN_INTENT_LABELS = Object.freeze(Object.values(YIN_INTENT_LABEL));

const LABEL_SET = new Set(YIN_INTENT_LABELS);

const YIN_VOICE_RE = /\bI am [a-z]+\b/i;

/**
 * @param {unknown} raw
 * @returns {string}
 */
function normalizeLabel(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().toUpperCase().replace(/[\s-]+/g, '_');
}

/**
 * @param {string} raw
 * @returns {{
 *   ok: boolean,
 *   primary_intent: string | null,
 *   secondary_signal: string,
 *   confidence: number,
 *   error?: string
 * }}
 */
export function parseYinIntentJson(raw) {
  const slice = extractJsonObjectText(raw);
  if (!slice) {
    return {
      ok: false,
      primary_intent: null,
      secondary_signal: '',
      confidence: 0,
      error: 'no_json_object'
    };
  }
  let parsed;
  try {
    parsed = JSON.parse(slice);
  } catch {
    return {
      ok: false,
      primary_intent: null,
      secondary_signal: '',
      confidence: 0,
      error: 'invalid_json'
    };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      primary_intent: null,
      secondary_signal: '',
      confidence: 0,
      error: 'not_object'
    };
  }
  const primary = normalizeLabel(parsed.primary_intent);
  if (!primary || !LABEL_SET.has(primary)) {
    return {
      ok: false,
      primary_intent: primary || null,
      secondary_signal: '',
      confidence: 0,
      error: 'unknown_primary'
    };
  }
  const secondaryRaw =
    typeof parsed.secondary_signal === 'string' ? parsed.secondary_signal.trim() : '';
  const secondaryNorm = normalizeLabel(secondaryRaw);
  const secondary_signal = LABEL_SET.has(secondaryNorm)
    ? secondaryNorm
    : secondaryRaw.slice(0, 48);
  const confNum = Number(parsed.confidence);
  const confidence = Number.isFinite(confNum) ? Math.min(1, Math.max(0, confNum)) : 0;
  return {
    ok: true,
    primary_intent: primary,
    secondary_signal,
    confidence
  };
}

/**
 * @param {{
 *   expectedPrimary: string,
 *   expectedSecondary?: string,
 *   parsed: ReturnType<typeof parseYinIntentJson>,
 *   raw?: string
 * }} opts
 */
export function scoreYinIntent({ expectedPrimary, expectedSecondary = '', parsed, raw = '' }) {
  const expected = normalizeLabel(expectedPrimary);
  const got = parsed?.ok ? parsed.primary_intent : null;
  const primaryHit = Boolean(got && expected && got === expected);
  const wantSecondary = normalizeLabel(expectedSecondary);
  const gotSecondary = parsed?.ok ? normalizeLabel(parsed.secondary_signal) : '';
  const secondaryHit = !wantSecondary
    ? true
    : Boolean(gotSecondary && gotSecondary === wantSecondary);
  const labeledEmotionAsPrimary = got === YIN_INTENT_LABEL.EMOTION;
  const boundaryFlattened =
    expected === YIN_INTENT_LABEL.BOUNDARY && labeledEmotionAsPrimary;
  const mixedBeginFlattened =
    expected === YIN_INTENT_LABEL.BEGIN && labeledEmotionAsPrimary;
  return {
    expectedPrimary: expected,
    gotPrimary: got,
    primaryHit,
    secondaryHit,
    labeledEmotionAsPrimary,
    boundaryFlattened,
    mixedBeginFlattened,
    parseOk: Boolean(parsed?.ok),
    yinVoiceLeak: YIN_VOICE_RE.test(String(raw || '')) && !extractJsonObjectText(raw)
  };
}

/**
 * Constrained prompt for the lab probe. Do not reuse as L3 persona.
 * @param {string} userText
 */
export function buildYinIntentDiagnosticPrompt(userText) {
  const utterance = typeof userText === 'string' ? userText.trim() : '';
  return [
    '/no_think',
    'Classify the user sentence. Reply with JSON only. No Yin voice. No "I am" sentences.',
    'Schema: {"primary_intent":"<LABEL>","secondary_signal":"","confidence":0.0}',
    'Labels:',
    '- COMPANION_PRESENCE: sit with me, be here, short sit still counts, noticed I was away',
    '- BEGIN: ready to start practice (even if they mention a messy day)',
    '- BOUNDARY: not sure they want to talk; not curiosity; not an emotion label',
    '- FORGET: remove one remembered topic',
    '- SUPPRESS: do not keep / do not save this turn',
    '- EMOTION: feelings are the whole request, with no other ask',
    '- OTHER: facts, preferences, remember-why, anything else',
    'If mood and an ask share one sentence, primary_intent is the ask. Put mood in secondary_signal (use EMOTION).',
    `User: ${utterance}`
  ].join('\n');
}
