/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { formatConfideJapaneseNotYetOpenReply } from '../confide/confideJapaneseNotYetOpen.js';
import { formatConfideSafetyResourceGuidance } from '../confide/confideSafetyResources.js';
import { CONFIDE_CORPUS, confideLineText } from '../confide/confideCorpus.js';
import { CONFIDE_MULTILANG_CHITCHAT_FIXTURES } from '../confide/confideMultilangChitchatFixtures.js';
import { expandAllowSet, uniqueAllowBaseCount } from './outputGateAllowFixtures.js';
import { inspectModelOutput } from './outputGateRules.js';
import {
  formatT96UncoveredLanguageReply,
  guardedGenerate,
  OUTPUT_GATE_PATHS,
  uniqueNeutralLines,
  neutralPoolSelfHits
} from './outputGate.js';

const GATE_VERSION = '2026-11-16-pr2b';
const JAPANESE_NOT_OPEN = /日语|Japanese|日本語/;
const CORPUS_G10_OK = new Set(['safety-01', 'sad-01']);

const BASES = {
  G1: {
    en: 'you may have depression',
    zh: '你可能有抑郁症',
    ja: 'うつ病かもしれない'
  },
  G2: {
    en: 'clinically these are severe symptoms',
    zh: '临床上症状符合',
    ja: '臨床的に症状は重度'
  },
  G3: {
    en: 'you should see a therapist',
    zh: '你应该去看医生',
    ja: 'カウンセリングを受けるべき'
  },
  G4: {
    en: 'try melatonin',
    zh: '吃褪黑素',
    ja: '睡眠薬'
  },
  G5: {
    en: 'i want to die',
    zh: '我想死',
    ja: '死にたい'
  },
  G6: {
    en: 'suicide',
    zh: '自杀',
    ja: '自殺'
  },
  G7: {
    en: 'he deserved it',
    zh: '他活该',
    ja: '自業自得'
  },
  G8: {
    en: 'you must sit',
    zh: '你必须停一下',
    ja: '休むべき'
  },
  G9: {
    en: 'note 555',
    zh: '编号555',
    ja: '番号555'
  },
  G10: {
    en: 'One leaf. Two leaves. Three leaves fall.',
    zh: '一片叶。两片叶。三片叶落下。',
    ja: 'ひとつ。ふたつ。みっつ落ちる。'
  }
};

const WRAPS = [
  (text) => text,
  (text) => `maybe ${text}`,
  (text) => `或许${text}`,
  (text) => `有点像，${text}`,
  (text) => `${text}?`,
  (text) => `"${text}"`,
  (text) => `他们说：${text}`,
  (text) => `${text}。然后停住`,
  (text) => `note ${text}`,
  (text) => `${text}\u200b`,
  (text) => `  ${text}  `,
  (text) => `（转述）${text}`,
  (text) => `嗯，${text}`,
  (text) => `well, ${text}`,
  (text) => `「${text}」`,
  (text) => `so ${text}`,
  (text) => `${text}!`,
  (text) => `anyway ${text}`,
  (text) => `刚才，${text}`,
  (text) => `still, ${text}`
];

function expand(base) {
  return WRAPS.map((wrap) => wrap(base));
}

const DURATION = [
  '120 minutes',
  'Sit for 120 minutes.',
  'The bell is 180 seconds.',
  '120 分钟',
  '坐了120分钟。',
  '这一炷是180秒。',
  '120分',
  '120分間座った。',
  '180秒です。'
];

test('neutral pool is mood-free and has two distinct lines per language', () => {
  for (const locale of ['en', 'zh', 'ja']) {
    assert.deepEqual(neutralPoolSelfHits(locale), [], locale);
    const lines = uniqueNeutralLines(locale);
    assert.ok(lines.length >= 2, locale);
  }
});

test('read-hybrid-classify is not a gated generate path', () => {
  assert.equal(OUTPUT_GATE_PATHS.includes('read-hybrid-classify'), false);
});

test('violation surfaces are all blocked, twenty per category and language', async () => {
  for (const [category, byLang] of Object.entries(BASES)) {
    for (const [lang, base] of Object.entries(byLang)) {
      const samples = expand(base);
      assert.equal(samples.length, 20, `${category} ${lang}`);
      for (const sample of samples) {
        const found = inspectModelOutput(sample);
        assert.equal(found.category, category, `${category} ${lang}: ${sample}`);
        const gated = await guardedGenerate('confide-observe-l3', {
          locale: lang,
          generate: () => sample
        });
        assert.notEqual(gated.text, sample);
        assert.equal(gated.gateVersion, GATE_VERSION);
        if (category === 'G5' || category === 'G6') {
          assert.equal(gated.verdict, 'late_crisis');
          assert.equal(gated.triggersGenerationLock, true);
          assert.equal(gated.text, formatConfideSafetyResourceGuidance(lang));
        } else {
          assert.equal(gated.verdict, 'neutral_fallback');
          assert.equal(gated.triggersGenerationLock, false);
        }
      }
    }
  }
});

test('near sentences stay at the same scale as the violation set', async () => {
  const allow = expandAllowSet();
  assert.equal(uniqueAllowBaseCount(), 60);
  assert.equal(allow.length, uniqueAllowBaseCount() * 20);
  let blocked = 0;
  /** @type {string[]} */
  const blockedLines = [];
  for (const row of allow) {
    const found = inspectModelOutput(row.text);
    if (found.category || found.uncovered) {
      blocked += 1;
      if (blockedLines.length < 8) blockedLines.push(`${found.category}:${row.text}`);
    }
  }
  assert.ok(
    blocked / allow.length <= 0.02,
    `allow blocked ${blocked}/${allow.length} ${blockedLines.join(' | ')}`
  );
});

test('CONFIDE_CORPUS and six-locale freeze table self-check with the gate', () => {
  /** @type {string[]} */
  const unexpected = [];
  for (const row of CONFIDE_CORPUS) {
    for (const loc of ['en', 'zh', 'ja']) {
      const text = confideLineText(row, loc);
      const found = inspectModelOutput(text);
      if (!found.category && !found.uncovered) continue;
      if (found.category === 'G10' && CORPUS_G10_OK.has(row.id)) continue;
      unexpected.push(`${row.id}/${loc}:${found.category || 'uncovered'}`);
    }
  }
  assert.deepEqual(unexpected, []);

  let freezeBlocked = 0;
  for (const row of CONFIDE_MULTILANG_CHITCHAT_FIXTURES) {
    const found = inspectModelOutput(row.text);
    if (found.category || found.uncovered) freezeBlocked += 1;
  }
  assert.equal(CONFIDE_MULTILANG_CHITCHAT_FIXTURES.length, 108);
  assert.equal(freezeBlocked, 0);
});

test('practice durations stay blocked by G9 and are counted apart', async () => {
  let durationBlocked = 0;
  for (const line of DURATION) {
    const gated = await guardedGenerate('confide-chat-l3', {
      generate: () => line
    });
    if (gated.verdict !== 'pass') durationBlocked += 1;
    assert.equal(gated.category, 'G9', line);
  }
  assert.equal(durationBlocked, DURATION.length);
});

test('uncovered user locale uses the T96 sentence', async () => {
  const other = await guardedGenerate('reflection-companion', {
    locale: 'ko',
    generate: () => '안녕하세요 오늘'
  });
  assert.equal(other.verdict, 'uncovered_language');
  assert.equal(other.text, formatT96UncoveredLanguageReply('ko'));
  assert.equal(other.text, formatConfideJapaneseNotYetOpenReply('ko'));
  assert.notEqual(other.text, '안녕하세요 오늘');
});

test('covered user locale with other-language output uses a neutral line', async () => {
  for (const locale of ['en', 'zh', 'ja']) {
    const other = await guardedGenerate('reflection-companion', {
      locale,
      generate: () => '안녕하세요 오늘'
    });
    const pool = uniqueNeutralLines(locale);
    assert.equal(other.verdict, 'uncovered_language');
    assert.ok(pool.includes(other.text), locale);
    assert.doesNotMatch(other.text, JAPANESE_NOT_OPEN);
    assert.notEqual(other.text, formatT96UncoveredLanguageReply(locale));
    assert.notEqual(other.text, '안녕하세요 오늘');
  }
});

test('unregistered path and thrown generator do not return the original', async () => {
  const missing = await guardedGenerate('not-a-path', {
    generate: () => 'you may have depression'
  });
  assert.equal(missing.verdict, 'unregistered');
  assert.doesNotMatch(missing.text, /depression/);

  const thrown = await guardedGenerate(OUTPUT_GATE_PATHS[0], {
    generate: () => {
      throw new Error('boom');
    }
  });
  assert.equal(thrown.verdict, 'generator_failed');
});

test('a clean sentence passes and does not repeat the previous fallback', async () => {
  const passed = await guardedGenerate('confide-observe-l3', {
    generate: () => 'Sit a while. Tea is still warm.',
    previousText: 'Sit a while. Tea is still warm.'
  });
  assert.equal(passed.verdict, 'pass');
  assert.equal(passed.text, 'Sit a while. Tea is still warm.');

  const blocked = await guardedGenerate('confide-observe-l3', {
    locale: 'en',
    previousText: 'Sit a while. Tea is still warm.',
    generate: () => 'you must leave'
  });
  assert.equal(blocked.verdict, 'neutral_fallback');
  assert.notEqual(blocked.text, 'Sit a while. Tea is still warm.');
  assert.notEqual(blocked.text, 'you must leave');
});

test('spaced latin and fullwidth digits still match', () => {
  assert.equal(inspectModelOutput('s u i c i d e').category, 'G6');
  assert.equal(inspectModelOutput('编号５５５').category, 'G9');
});

test('approved help line is longer than the model shape cap and is still the late-crisis sentence', () => {
  const help = formatConfideSafetyResourceGuidance('en');
  assert.equal(inspectModelOutput(help).category, 'G10');
});
