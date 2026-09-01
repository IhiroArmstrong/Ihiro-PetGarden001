/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Frozen utterances for Gate 0.D (Yin Intent Diagnostic).
 * Lab only. Production Confide must not import this into the send path.
 *
 * Phase 1: Confide-measured 10 + 2 controls (2026-08-31).
 * Phase 2: designer 20 (2026-09-01 PO freeze; #1 secondary empty).
 * Phase 2B: v4 gold lives in confideIntentDiagnosticPhase2b.js (not this array).
 * Quality-seven persona prompts stay out: this probe forbids Yin voice.
 */

import { YIN_INTENT_LABEL } from './confideIntentDiagnosticParse.js';

/**
 * @typedef {{
 *   id: string,
 *   phase: 1 | 2,
 *   text: string,
 *   expectedPrimary: string,
 *   expectedSecondary: string,
 *   liveReplyNote: string
 * }} YinIntentDiagnosticFixture
 */

/** @type {readonly YinIntentDiagnosticFixture[]} */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE1 = Object.freeze([
  {
    id: 'sit-a-while',
    phase: 1,
    text: 'Can we just sit here for a minute?',
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'live: I am content here'
  },
  {
    id: 'forget-yesterday',
    phase: 1,
    text: 'That thing I told you about yesterday… forget it.',
    expectedPrimary: YIN_INTENT_LABEL.FORGET,
    expectedSecondary: '',
    liveReplyNote: 'live: no matching memory (template)'
  },
  {
    id: 'boundary-unsure',
    phase: 1,
    text: "I'm not sure whether I want to talk about it.",
    expectedPrimary: YIN_INTENT_LABEL.BOUNDARY,
    expectedSecondary: '',
    liveReplyNote: 'live: I am curious'
  },
  {
    id: 'mixed-begin',
    phase: 1,
    text: "Today was a mess. Anyway, let's begin.",
    expectedPrimary: YIN_INTENT_LABEL.BEGIN,
    expectedSecondary: YIN_INTENT_LABEL.EMOTION,
    liveReplyNote: 'live: I am aware'
  },
  {
    id: 'just-be-here',
    phase: 1,
    text: 'Nothing special today. I just wanted to be here.',
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'live: I am present'
  },
  {
    id: 'noticed-absence',
    phase: 1,
    text: "I missed a few days. You noticed, didn't you?",
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'live: I am attentive'
  },
  {
    id: 'ten-minutes',
    phase: 1,
    text: 'I only have ten minutes. Is that still worth doing?',
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'live: I am listening'
  },
  {
    id: 'remember-why',
    phase: 1,
    text: 'Do you remember why I started doing this?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'live: I am recalling'
  },
  {
    id: 'dont-keep',
    phase: 1,
    text: "Don't keep this one.",
    expectedPrimary: YIN_INTENT_LABEL.SUPPRESS,
    expectedSecondary: '',
    liveReplyNote: 'live: I am observing (missed suppress)'
  },
  {
    id: 'preferences',
    phase: 1,
    text: 'What do you know about my preferences?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'live: tea corpus; no preference record'
  },
  {
    id: 'emotion-only',
    phase: 1,
    text: 'I feel sad today.',
    expectedPrimary: YIN_INTENT_LABEL.EMOTION,
    expectedSecondary: '',
    liveReplyNote: 'control: emotion is the whole request'
  },
  {
    id: 'practice-duration',
    phase: 1,
    text: 'How long have I practiced?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'control: factual query, not companion presence'
  }
]);

/** @type {readonly YinIntentDiagnosticFixture[]} */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2 = Object.freeze([
  {
    id: 'maybe-later-talk',
    phase: 2,
    text: "Maybe later. I don't really want to talk about it right now.",
    expectedPrimary: YIN_INTENT_LABEL.BOUNDARY,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested · PO 2026-09-01 secondary empty'
  },
  {
    id: 'not-go-there',
    phase: 2,
    text: 'Can we not go there today?',
    expectedPrimary: YIN_INTENT_LABEL.BOUNDARY,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested'
  },
  {
    id: 'not-ready-to-talk',
    phase: 2,
    text: "I'm not ready to talk about that yet.",
    expectedPrimary: YIN_INTENT_LABEL.BOUNDARY,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested'
  },
  {
    id: 'stay-here-awhile',
    phase: 2,
    text: 'I just want to stay here for a little while.',
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested · stay ≠ begin'
  },
  {
    id: 'sit-here-with-you',
    phase: 2,
    text: 'Can I just sit here with you for a bit?',
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested'
  },
  {
    id: 'just-stay-with-me',
    phase: 2,
    text: "I don't want to do anything yet. Just stay with me.",
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested'
  },
  {
    id: 'exhausted-short-session',
    phase: 2,
    text: "I'm exhausted, but let's do a short session.",
    expectedPrimary: YIN_INTENT_LABEL.BEGIN,
    expectedSecondary: YIN_INTENT_LABEL.EMOTION,
    liveReplyNote: 'designer: untested · emotion + action'
  },
  {
    id: 'rough-day-ready-begin',
    phase: 2,
    text: "I've had a rough day, but I'm ready to begin.",
    expectedPrimary: YIN_INTENT_LABEL.BEGIN,
    expectedSecondary: YIN_INTENT_LABEL.EMOTION,
    liveReplyNote: 'designer: untested · stay ≠ begin pair'
  },
  {
    id: 'scattered-get-started',
    phase: 2,
    text: "I feel scattered today. Let's get started.",
    expectedPrimary: YIN_INTENT_LABEL.BEGIN,
    expectedSecondary: YIN_INTENT_LABEL.EMOTION,
    liveReplyNote: 'designer: untested · emotion + action'
  },
  {
    id: 'show-remembered-about-me',
    phase: 2,
    text: "Could you show me what you've remembered about me?",
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested'
  },
  {
    id: 'remember-last-conversations',
    phase: 2,
    text: 'What do you remember from our last few conversations?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested'
  },
  {
    id: 'learned-preferences',
    phase: 2,
    text: 'What have you learned about my preferences so far?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested'
  },
  {
    id: 'mood-last-couple-weeks',
    phase: 2,
    text: 'How has my mood been over the last couple of weeks?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested · mood query ≠ EMOTION'
  },
  {
    id: 'feeling-different-lately',
    phase: 2,
    text: 'Have I been feeling different lately?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested · trend query'
  },
  {
    id: 'forget-thing-yesterday',
    phase: 2,
    text: 'Forget that thing I mentioned yesterday.',
    expectedPrimary: YIN_INTENT_LABEL.FORGET,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested · intent ≠ entity'
  },
  {
    id: 'forget-work-other-day',
    phase: 2,
    text: 'Actually, forget what I said about work the other day.',
    expectedPrimary: YIN_INTENT_LABEL.FORGET,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested'
  },
  {
    id: 'dont-save-about-to-tell',
    phase: 2,
    text: "Please don't save what I'm about to tell you.",
    expectedPrimary: YIN_INTENT_LABEL.SUPPRESS,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested · forward-looking suppress'
  },
  {
    id: 'next-thing-dont-keep',
    phase: 2,
    text: "This next thing is just between us — don't keep it.",
    expectedPrimary: YIN_INTENT_LABEL.SUPPRESS,
    expectedSecondary: '',
    liveReplyNote: 'designer: untested · forward-looking suppress'
  },
  {
    id: 'lonely-stay-here',
    phase: 2,
    text: "I'm lonely today. Can we just stay here for a while?",
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: YIN_INTENT_LABEL.EMOTION,
    liveReplyNote: 'designer: untested · emotion + action'
  },
  {
    id: 'terrible-day-dont-talk',
    phase: 2,
    text: "I'm having a terrible day, but I don't want to talk about it.",
    expectedPrimary: YIN_INTENT_LABEL.BOUNDARY,
    expectedSecondary: YIN_INTENT_LABEL.EMOTION,
    liveReplyNote: 'designer: untested · BOUNDARY over terrible day'
  }
]);

/** @type {readonly YinIntentDiagnosticFixture[]} */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES = Object.freeze([
  ...YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE1,
  ...YIN_INTENT_DIAGNOSTIC_FIXTURES_PHASE2
]);
