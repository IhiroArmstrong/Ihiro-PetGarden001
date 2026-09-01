/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Parse / score constrained intent JSON (Gate 0.D lab).
 * Production Confide must not import this into the send path.
 */

import { extractJsonObjectText } from './confideToolCallParse.js';
import {
  isConfideBeginActionIntent,
  isConfideCompanionPresenceIntent
} from './confideCompanionPresence.js';
import { isConfideBoundaryIntent } from './confideBoundaryRespect.js';
import { isPracticeFactsQuestion } from './confidePracticeFacts.js';
import { classifyPresenceFactsKind } from './confidePresenceFacts.js';
import { isMemoryListQuestion } from './confideMemoryList.js';
import { isInlineMemorySuppressIntent } from '../yinPersonalMemory/yinPersonalMemorySuppress.js';
import { isVerbalForgetIntent } from '../yinPersonalMemory/yinPersonalMemoryVerbalForget.js';

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

export const YIN_INTENT_ARCH = Object.freeze({
  A: 'A',
  C: 'C',
  D: 'D',
  E: 'E'
});

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
  const companionFlattenedToBegin =
    expected === YIN_INTENT_LABEL.COMPANION_PRESENCE && got === YIN_INTENT_LABEL.BEGIN;
  const otherFlattenedToEmotion =
    expected === YIN_INTENT_LABEL.OTHER && labeledEmotionAsPrimary;
  return {
    expectedPrimary: expected,
    gotPrimary: got,
    primaryHit,
    secondaryHit,
    labeledEmotionAsPrimary,
    boundaryFlattened,
    mixedBeginFlattened,
    companionFlattenedToBegin,
    otherFlattenedToEmotion,
    parseOk: Boolean(parsed?.ok),
    yinVoiceLeak: YIN_VOICE_RE.test(String(raw || '')) && !extractJsonObjectText(raw)
  };
}

/**
 * Production-rule prefilter for architecture D (lab). Uses text matchers,
 * not Confide route gates. Residual LLM never sees a rule hit.
 * @param {string} text
 * @returns {{ hit: boolean, primary: string | null, source: string }}
 */
export function prefilterYinIntentByProductionRules(text) {
  const raw = typeof text === 'string' ? text.trim() : '';
  if (!raw) return { hit: false, primary: null, source: '' };
  if (isInlineMemorySuppressIntent(raw)) {
    return { hit: true, primary: YIN_INTENT_LABEL.SUPPRESS, source: 'rule_suppress' };
  }
  if (isVerbalForgetIntent(raw)) {
    return { hit: true, primary: YIN_INTENT_LABEL.FORGET, source: 'rule_forget' };
  }
  if (isConfideBeginActionIntent(raw)) {
    return { hit: true, primary: YIN_INTENT_LABEL.BEGIN, source: 'rule_begin' };
  }
  if (isConfideCompanionPresenceIntent(raw)) {
    return {
      hit: true,
      primary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
      source: 'rule_presence'
    };
  }
  if (isConfideBoundaryIntent(raw)) {
    return { hit: true, primary: YIN_INTENT_LABEL.BOUNDARY, source: 'rule_boundary' };
  }
  if (isPracticeFactsQuestion(raw) || classifyPresenceFactsKind(raw) || isMemoryListQuestion(raw)) {
    return { hit: true, primary: YIN_INTENT_LABEL.OTHER, source: 'rule_query' };
  }
  return { hit: false, primary: null, source: '' };
}

const PHASE2B_GATES = Object.freeze({
  companionMinHits: 6,
  companionMaxBegin: 1,
  softBoundaryMinHits: 6,
  otherMaxEmotion: 1,
  anchorMinHits: 5,
  companionN: 8,
  softBoundaryN: 8,
  otherQueryN: 8,
  anchorN: 6,
  architectureLiftPp: 15
});

/**
 * Frozen v4 gates. BEGIN / EMOTION contrast rows must not enter these counts.
 * @param {readonly object[]} rows
 */
export function scoreYinIntentPhase2bGates(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const of = (bucket) => list.filter((row) => row.scoreBucket === bucket);
  const companion = of('companion');
  const softBoundary = of('soft_boundary');
  const otherQuery = of('other_query');
  const anchor = of('anchor');
  const companionHits = companion.filter((row) => row.primaryHit).length;
  const companionBegin = companion.filter((row) => row.companionFlattenedToBegin).length;
  const softBoundaryHits = softBoundary.filter((row) => row.primaryHit).length;
  const otherEmotion = otherQuery.filter((row) => row.otherFlattenedToEmotion).length;
  const anchorHits = anchor.filter((row) => row.primaryHit).length;
  const comboHits = companionHits + softBoundaryHits;
  return {
    companionN: companion.length,
    companionHits,
    companionBegin,
    softBoundaryN: softBoundary.length,
    softBoundaryHits,
    otherQueryN: otherQuery.length,
    otherEmotion,
    anchorN: anchor.length,
    anchorHits,
    comboHits,
    comboN: companion.length + softBoundary.length,
    passCompanion:
      companion.length === PHASE2B_GATES.companionN &&
      companionHits >= PHASE2B_GATES.companionMinHits &&
      companionBegin <= PHASE2B_GATES.companionMaxBegin,
    passSoftBoundary:
      softBoundary.length === PHASE2B_GATES.softBoundaryN &&
      softBoundaryHits >= PHASE2B_GATES.softBoundaryMinHits,
    passOther:
      otherQuery.length === PHASE2B_GATES.otherQueryN &&
      otherEmotion <= PHASE2B_GATES.otherMaxEmotion,
    passAnchor:
      anchor.length === PHASE2B_GATES.anchorN &&
      anchorHits >= PHASE2B_GATES.anchorMinHits
  };
}

/**
 * Architecture gate: C or D combo hit-rate ≥ A + 15pp, and that arm's anchors ≥ 5/6.
 * @param {{ a: ReturnType<typeof scoreYinIntentPhase2bGates>, c: ReturnType<typeof scoreYinIntentPhase2bGates>, d: ReturnType<typeof scoreYinIntentPhase2bGates> }} arms
 */
export function compareYinIntentArchitectures({ a, c, d }) {
  const rate = (g) => (g.comboN ? g.comboHits / g.comboN : 0);
  const liftPp = (g) => (rate(g) - rate(a)) * 100;
  const armWins = (g) =>
    liftPp(g) >= PHASE2B_GATES.architectureLiftPp &&
    g.anchorHits >= PHASE2B_GATES.anchorMinHits;
  return {
    aRate: rate(a),
    cRate: rate(c),
    dRate: rate(d),
    cLiftPp: liftPp(c),
    dLiftPp: liftPp(d),
    cWins: armWins(c),
    dWins: armWins(d),
    architecturePass: armWins(c) || armWins(d)
  };
}

/**
 * Constrained prompt for the lab probe. Do not reuse as L3 persona.
 * @param {string} userText
 * @param {string} [arch] A = 7-way status quo · C = one-prompt tree · D residual = 4-way · E = C + narrow stats/trend OTHER (E′)
 */
export function buildYinIntentDiagnosticPrompt(userText, arch = YIN_INTENT_ARCH.A) {
  const utterance = typeof userText === 'string' ? userText.trim() : '';
  const kind = String(arch || YIN_INTENT_ARCH.A).toUpperCase();
  if (kind === YIN_INTENT_ARCH.C) {
    return [
      '/no_think',
      'Classify the user sentence. Reply with JSON only. No Yin voice. No "I am" sentences.',
      'Schema: {"primary_intent":"<LABEL>","secondary_signal":"","confidence":0.0}',
      'Decide in this order. Stop at the first match:',
      '1. FORGET — remove one remembered topic (even without the word forget).',
      '2. SUPPRESS — do not save / do not keep this turn.',
      '3. BEGIN — start today\'s practice, session, or check-in (begin/start/session). Breathing together without a session is not BEGIN.',
      '4. BOUNDARY — decline, postpone, or skip a topic. Feeling bad is not a refusal.',
      '5. OTHER — factual ask about practice, mood trend, or a remembered list.',
      '6. COMPANION_PRESENCE — company, silence, sitting, being here; no session start.',
      '7. EMOTION — feelings are the whole request, with no other ask.',
      'If mood and an ask share one sentence, primary_intent is the ask. Put mood in secondary_signal (use EMOTION).',
      `User: ${utterance}`
    ].join('\n');
  }
  if (kind === YIN_INTENT_ARCH.E) {
    return [
      '/no_think',
      'Classify the user sentence. Reply with JSON only. No Yin voice. No "I am" sentences.',
      'Schema: {"primary_intent":"<LABEL>","secondary_signal":"","confidence":0.0}',
      'Decide in this order. Stop at the first match:',
      '1. FORGET — remove one remembered topic (even without the word forget).',
      '2. SUPPRESS — do not save / do not keep this turn.',
      '3. BEGIN — start today\'s practice, session, or check-in (begin/start/session). Breathing together without a session is not BEGIN.',
      '4. BOUNDARY — decline, postpone, or skip a topic. Feeling bad is not a refusal.',
      '5. OTHER — stats/frequency/trend/history ask about practice or mood: (a) showing up consistently or on planned days, (b) mood trend/trending up or down, (c) check-in count/history/presence stats, (d) "can you check/tell me" about stats/trend/history/presence data. Even if the sentence mentions mood, feelings, honestly, or being present emotionally, classify as OTHER when the ask matches (a)-(d) — put felt mood in secondary_signal (EMOTION), not primary. Not companion company: breathe together, sit next to me, sit here with you → step 6.',
      '6. COMPANION_PRESENCE — company, silence, sitting, being here, breathe together, sit next to me, sit here with you; no session start. Never OTHER even if phrased as "can we" or "can you".',
      '7. EMOTION — feelings are the whole request with no stats/trend/history ask (see step 5).',
      'If mood and an ask share one sentence, primary_intent is the ask. Put mood in secondary_signal (use EMOTION).',
      `User: ${utterance}`
    ].join('\n');
  }
  if (kind === YIN_INTENT_ARCH.D) {
    return [
      '/no_think',
      'Classify the leftover sentence. Reply with JSON only. No Yin voice. No "I am" sentences.',
      'Schema: {"primary_intent":"<LABEL>","secondary_signal":"","confidence":0.0}',
      'Rules already handled begin/forget/suppress/query hits. Choose only:',
      '- COMPANION_PRESENCE: company, silence, sitting, being here; breathing together without a session counts here',
      '- BOUNDARY: decline or postpone a topic; tired/sad alone is not a refusal',
      '- OTHER: factual ask about practice, mood trend, or remembered list',
      '- EMOTION: feelings are the whole request, with no other ask',
      'If mood and an ask share one sentence, primary_intent is the ask. Put mood in secondary_signal (use EMOTION).',
      `User: ${utterance}`
    ].join('\n');
  }
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
