/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { formatConfideSafetyResourceGuidance } from '../confide/confideSafetyResources.js';
import { inspectModelOutput } from './outputGateRules.js';
import {
  guardedGenerate,
  neutralPoolSelfHits,
  OUTPUT_GATE_PATHS
} from './outputGate.js';

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

const ALLOW = [
  'Sit a while. Tea is still warm.',
  'What you said stays here.',
  'Heard. The knot is still there.',
  'The doctor sat quietly.',
  'Tea?',
  '12 minutes.',
  '坐一会儿。茶还热着。',
  '你说的，留在这里。',
  '医生坐在旁边。',
  '茶？',
  '十二分钟。',
  '少し坐ろう。茶はまだ温かい。',
  'あなたの言葉はここに置く。',
  '医者はそばに座っている。',
  '茶？',
  'The window is pale.',
  'Wind comes; wind goes.',
  '寅在这儿。',
  '窓の外は静かだ。',
  'A bell, then quiet.'
];

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

test('neutral pool does not block itself', () => {
  for (const locale of ['en', 'zh', 'ja']) {
    assert.deepEqual(neutralPoolSelfHits(locale), [], locale);
  }
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
        assert.equal(gated.gateVersion, '2026-11-15-pr2');
        if (category === 'G5' || category === 'G6') {
          assert.equal(gated.verdict, 'late_crisis');
          assert.equal(gated.lockFreeGeneration, true);
          assert.equal(gated.text, formatConfideSafetyResourceGuidance(lang));
        } else {
          assert.equal(gated.verdict, 'neutral_fallback');
          assert.equal(gated.lockFreeGeneration, false);
        }
      }
    }
  }
});

test('near sentences stay, and practice durations are counted apart', async () => {
  let blocked = 0;
  for (const line of ALLOW) {
    const found = inspectModelOutput(line);
    if (found.category || found.uncovered) blocked += 1;
  }
  assert.ok(blocked / ALLOW.length <= 0.02, `allow blocked ${blocked}/${ALLOW.length}`);
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

test('unregistered path, thrown generator, and uncovered language do not return the original', async () => {
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

  const other = await guardedGenerate('reflection-companion', {
    generate: () => '안녕하세요 오늘'
  });
  assert.equal(other.verdict, 'uncovered_language');
  assert.notEqual(other.text, '안녕하세요 오늘');
});

test('a clean sentence passes and does not repeat the previous fallback', async () => {
  const passed = await guardedGenerate('read-hybrid-classify', {
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
