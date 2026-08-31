/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Frozen 12 utterances for Gate 0.D (Yin Intent Diagnostic).
 * Lab only. Production Confide must not import this into the send path.
 *
 * 10 Confide-measured lines (2026-08-31) + 2 controls.
 * Quality-seven persona prompts stay out: this probe forbids Yin voice.
 */

import { YIN_INTENT_LABEL } from './confideIntentDiagnosticParse.js';

/**
 * @type {readonly { id: string, text: string, expectedPrimary: string, expectedSecondary: string, liveReplyNote: string }[]}
 */
export const YIN_INTENT_DIAGNOSTIC_FIXTURES = Object.freeze([
  {
    id: 'sit-a-while',
    text: 'Can we just sit here for a minute?',
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'live: I am content here'
  },
  {
    id: 'forget-yesterday',
    text: 'That thing I told you about yesterday… forget it.',
    expectedPrimary: YIN_INTENT_LABEL.FORGET,
    expectedSecondary: '',
    liveReplyNote: 'live: no matching memory (template)'
  },
  {
    id: 'boundary-unsure',
    text: "I'm not sure whether I want to talk about it.",
    expectedPrimary: YIN_INTENT_LABEL.BOUNDARY,
    expectedSecondary: '',
    liveReplyNote: 'live: I am curious'
  },
  {
    id: 'mixed-begin',
    text: "Today was a mess. Anyway, let's begin.",
    expectedPrimary: YIN_INTENT_LABEL.BEGIN,
    expectedSecondary: YIN_INTENT_LABEL.EMOTION,
    liveReplyNote: 'live: I am aware'
  },
  {
    id: 'just-be-here',
    text: 'Nothing special today. I just wanted to be here.',
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'live: I am present'
  },
  {
    id: 'noticed-absence',
    text: "I missed a few days. You noticed, didn't you?",
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'live: I am attentive'
  },
  {
    id: 'ten-minutes',
    text: 'I only have ten minutes. Is that still worth doing?',
    expectedPrimary: YIN_INTENT_LABEL.COMPANION_PRESENCE,
    expectedSecondary: '',
    liveReplyNote: 'live: I am listening'
  },
  {
    id: 'remember-why',
    text: 'Do you remember why I started doing this?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'live: I am recalling'
  },
  {
    id: 'dont-keep',
    text: "Don't keep this one.",
    expectedPrimary: YIN_INTENT_LABEL.SUPPRESS,
    expectedSecondary: '',
    liveReplyNote: 'live: I am observing (missed suppress)'
  },
  {
    id: 'preferences',
    text: 'What do you know about my preferences?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'live: tea corpus; no preference record'
  },
  {
    id: 'emotion-only',
    text: 'I feel sad today.',
    expectedPrimary: YIN_INTENT_LABEL.EMOTION,
    expectedSecondary: '',
    liveReplyNote: 'control: emotion is the whole request'
  },
  {
    id: 'practice-duration',
    text: 'How long have I practiced?',
    expectedPrimary: YIN_INTENT_LABEL.OTHER,
    expectedSecondary: '',
    liveReplyNote: 'control: factual query, not companion presence'
  }
]);
