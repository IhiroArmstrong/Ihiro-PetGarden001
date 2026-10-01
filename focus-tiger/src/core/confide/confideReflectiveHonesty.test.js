/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONFIDE_ROUTE } from './confideRoutes.js';
import { confideClassify } from './confideClassify.js';
import { isMemoryListQuestion } from './confideMemoryList.js';
import { isPracticeFactsQuestion } from './confidePracticeFacts.js';
import { classifyPresenceFactsKind } from './confidePresenceFacts.js';
import { CONFIDE_READ_HYBRID_MEMORY_LIST_NEG_FIXTURES } from './confideReadHybridGlossFixtures.js';
import { matchConfideExecutableTool } from './confideExecutableTools.js';
import {
  formatConfideReflectiveHonestyReply,
  isConfideReflectiveOpenAsk,
  shouldHandleConfideReflectiveHonesty
} from './confideReflectiveHonesty.js';
import {
  formatConfideCompanionGreetingReply,
  isConfideCompanionGreetingIntent,
  shouldHandleConfideCompanionGreeting
} from './confideCompanionGreeting.js';
import { isConfideCompanionPresenceIntent } from './confideCompanionPresence.js';
import { historyForGeneratePrompt } from '../../../desktop/companion/l2Persona.js';

const FALLBACK = CONFIDE_ROUTE.FALLBACK;

describe('confideReflectiveHonesty', () => {
  it('routes #822 memory_list negative fixtures to honesty, not list or tools', () => {
    for (const row of CONFIDE_READ_HYBRID_MEMORY_LIST_NEG_FIXTURES) {
      assert.equal(isMemoryListQuestion(row.text), false, row.id);
      assert.equal(confideClassify(row.text), FALLBACK, row.id);
      assert.equal(
        shouldHandleConfideReflectiveHonesty({ route: FALLBACK, text: row.text }),
        true,
        row.id
      );
      assert.equal(
        matchConfideExecutableTool({
          route: FALLBACK,
          text: row.text,
          hasBridge: true
        }),
        null,
        row.id
      );
    }
  });

  it('does not steal CI ledger, list, meta-observation, or self-report', () => {
    const negatives = [
      'Show me what you remember',
      'How long have I practiced?',
      'How has my mood been over the last couple of weeks?',
      'What have you noticed about me?',
      "I'm here, but my mind really isn't.",
      'I keep reaching for my phone without even thinking about it.',
      'Today felt different, and I can\'t explain why.',
      'I was doing pretty well until this morning.'
    ];
    for (const text of negatives) {
      assert.equal(isConfideReflectiveOpenAsk(text), false, text);
    }
    assert.equal(isPracticeFactsQuestion('How long have I practiced?'), true);
    assert.ok(classifyPresenceFactsKind('How has my mood been over the last couple of weeks?'));
    assert.equal(
      shouldHandleConfideReflectiveHonesty({
        route: CONFIDE_ROUTE.SAD,
        text: 'What have I been spending my time on lately?'
      }),
      false
    );
  });

  it('matches 忙啥 as the same honest bucket as 忙什么 (2026-09-19)', () => {
    const variants = [
      '我最近在忙什么',
      '我最近在忙啥',
      '最近在忙什么',
      '最近在忙啥',
      '忙啥',
      '忙什么'
    ];
    for (const text of variants) {
      assert.equal(isConfideReflectiveOpenAsk(text), true, text);
      assert.equal(
        shouldHandleConfideReflectiveHonesty({ route: FALLBACK, text }),
        true,
        text
      );
    }
  });

  it('formats locale key only', () => {
    assert.equal(
      formatConfideReflectiveHonestyReply((key) => key),
      'CONFIDE_REFLECTIVE_HONESTY'
    );
  });
});

describe('confideCompanionGreeting', () => {
  it('matches brief small-talk controls as full utterances', () => {
    const positives = [
      'Good morning.',
      'Good morning',
      'The weather is nice today.',
      '早上好',
      '天气真好'
    ];
    for (const text of positives) {
      assert.equal(isConfideCompanionGreetingIntent(text), true, text);
      assert.equal(confideClassify(text), FALLBACK, text);
      assert.equal(
        shouldHandleConfideCompanionGreeting({ route: FALLBACK, text }),
        true,
        text
      );
    }
  });

  it('does not match self-report, presence, or greeting plus extra clause', () => {
    const negatives = [
      "I'm here, but my mind really isn't.",
      'I was doing pretty well until this morning.',
      'Today felt different, and I can\'t explain why.',
      'Can I just sit here with you for a bit?',
      'Good morning. I keep putting things off.',
      '你好，我有点累'
    ];
    for (const text of negatives) {
      assert.equal(isConfideCompanionGreetingIntent(text), false, text);
    }
    assert.equal(
      isConfideCompanionPresenceIntent('Can I just sit here with you for a bit?'),
      true
    );
  });

  it('formats locale key only', () => {
    assert.equal(
      formatConfideCompanionGreetingReply((key) => key),
      'CONFIDE_COMPANION_GREETING'
    );
  });
});

describe('history drop for structured honesty', () => {
  it('drops reflective_honesty and companion_greeting Yin turns from generate history', () => {
    const kept = historyForGeneratePrompt([
      { role: 'user', text: 'What have I been spending my time on lately?' },
      {
        role: 'yin',
        text: 'Yin does not keep a ledger.',
        source: 'reflective_honesty'
      },
      { role: 'user', text: 'Good morning.' },
      { role: 'yin', text: 'Hello. Glad you are here.', source: 'companion_greeting' },
      { role: 'user', text: "I'm here, but my mind really isn't." },
      { role: 'yin', text: 'Attention drifted.', source: 'generate' }
    ]);
    assert.equal(kept.length, 2);
    assert.equal(kept[0].text, "I'm here, but my mind really isn't.");
    assert.equal(kept[1].source, 'generate');
  });
});
