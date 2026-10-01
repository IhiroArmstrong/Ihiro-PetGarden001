/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Frozen fixtures for Confide generate-failure corpus fallback (#930).
 * Covers compound emotion/habit utterances that enter generate, then fail
 * (sanitize / model error) and must not fall back to privacy disclaimer fallback-02.
 *
 * Sources (deduped by text; generate-eligible only):
 * - L3 observe shuffle emotion + habit rows (mirrors l3ObserveShuffleFixtures.js)
 * - meta-query generate_skip_classify chitchat
 * - Stage 2 real meat emotional candidates
 * - #930 compound variants (spacing / punctuation)
 */

import { isConfideGenerateEligible } from './confideAcceptanceResolve.js';
import { CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES } from './confideMetaQueryAcceptanceFixtures.js';
import { CONFIDE_STAGE2_REAL_MEAT_CANDIDATES } from './confideStage2RealMeatCandidates.js';
import { CONFIDE_SEMANTIC_BUCKET } from './confideSemanticBuckets.js';

/** Mirrors desktop/companion/l3ObserveShuffleFixtures.js emotion + habit rows. */
const L3_EMOTION_HABIT_SOURCE_ROWS = Object.freeze([
  { id: 'e-irritation', text: '有点烦' },
  { id: 'e-sleepless', text: '睡不着' },
  { id: 'e-mind-away', text: "I'm here, but my mind really isn't." },
  { id: 'e-putting-off', text: 'I keep putting off things I know I should do.' },
  { id: 'e-motions', text: "I feel like I'm just going through the motions today." },
  { id: 'h-phone', text: 'I keep reaching for my phone without even thinking about it.' },
  { id: 'h-morning', text: 'I was doing pretty well until this morning.' },
  { id: 'h-different', text: "Today felt different, and I can't explain why." }
]);

/** @typedef {'generate_fail' | 'corpus_control'} ConfideGenerateFailureFallbackKind */

/**
 * @typedef {{
 *   id: string,
 *   text: string,
 *   locale?: 'en' | 'zh' | 'ja',
 *   kind: ConfideGenerateFailureFallbackKind,
 *   source?: string
 * }} ConfideGenerateFailureFallbackFixture
 */

/** @type {readonly ConfideGenerateFailureFallbackFixture[]} */
const COMPOUND_EMOTION_VARIANTS = Object.freeze([
  Object.freeze({
    id: 'gf-compound-annoyed-no-practice-comma',
    text: '有点烦，不想练习',
    locale: 'zh',
    kind: 'generate_fail',
    source: '#930-primary'
  }),
  Object.freeze({
    id: 'gf-compound-today-spaced',
    text: '今天 有点烦，不想练习',
    locale: 'zh',
    kind: 'generate_fail',
    source: '#930-field-spacing'
  }),
  Object.freeze({
    id: 'gf-compound-today-tight',
    text: '今天有点烦，不想练习',
    locale: 'zh',
    kind: 'generate_fail',
    source: '#930-variant'
  }),
  Object.freeze({
    id: 'gf-compound-unhappy-no-practice',
    text: '俺觉得不太高兴。不想练习。',
    locale: 'zh',
    kind: 'generate_fail',
    source: 'stage2-browser-env-field'
  }),
  Object.freeze({
    id: 'gf-compound-annoyed-period-no-practice',
    text: '有点烦。不想练习了。',
    locale: 'zh',
    kind: 'generate_fail',
    source: '#930-variant'
  }),
  Object.freeze({
    id: 'gf-compound-no-practice-bare',
    text: '我不想练习了。',
    locale: 'zh',
    kind: 'generate_fail',
    source: 'latency-probe'
  }),
  Object.freeze({
    id: 'gf-compound-sleepless-today',
    text: '今天睡不着，脑子停不下来。',
    locale: 'zh',
    kind: 'generate_fail',
    source: 'compound-variant'
  }),
  Object.freeze({
    id: 'gf-compound-en-mind-not-here',
    text: "I'm annoyed and don't want to practice.",
    locale: 'en',
    kind: 'generate_fail',
    source: 'compound-variant'
  }),
  Object.freeze({
    id: 'gf-compound-messy-mind-no-sit',
    text: '心里乱，不想静坐了。',
    locale: 'zh',
    kind: 'generate_fail',
    source: 'compound-variant'
  }),
  Object.freeze({
    id: 'gf-compound-annoyed-no-sit-today',
    text: '今天有点闷，不想练习。',
    locale: 'zh',
    kind: 'generate_fail',
    source: 'compound-variant'
  })
]);

/** @type {readonly ConfideGenerateFailureFallbackFixture[]} */
const CORPUS_CONTROL_FIXTURES = Object.freeze([
  Object.freeze({
    id: 'gf-control-weather-en',
    text: 'the weather is mild today',
    locale: 'en',
    kind: 'corpus_control',
    source: 'confideReplyFlow.test unmatched'
  }),
  Object.freeze({
    id: 'gf-control-random-zh',
    text: '随便聊聊吧',
    locale: 'zh',
    kind: 'corpus_control',
    source: 'unmatched-fallback-pool'
  })
]);

/**
 * @param {string} text
 * @returns {'en' | 'zh' | 'ja'}
 */
function inferLocale(text) {
  if (/[\u3040-\u30ff]/.test(text)) return 'ja';
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  return 'en';
}

/**
 * @param {string} prefix
 * @param {string} text
 * @param {string} source
 * @returns {ConfideGenerateFailureFallbackFixture}
 */
function generateFailRow(prefix, text, source) {
  return Object.freeze({
    id: prefix,
    text,
    locale: inferLocale(text),
    kind: 'generate_fail',
    source
  });
}

/**
 * @returns {readonly ConfideGenerateFailureFallbackFixture[]}
 */
function buildGenerateFailFixtures() {
  /** @type {Map<string, ConfideGenerateFailureFallbackFixture>} */
  const byText = new Map();

  const add = (row) => {
    if (!isConfideGenerateEligible(row.text)) return;
    const key = `${row.locale || inferLocale(row.text)}::${row.text}`;
    if (!byText.has(key)) byText.set(key, row);
  };

  for (const row of COMPOUND_EMOTION_VARIANTS) add(row);

  for (const row of L3_EMOTION_HABIT_SOURCE_ROWS) {
    add(generateFailRow(`gf-l3-${row.id}`, row.text, `l3ObserveShuffle:${row.id}`));
  }

  for (const row of CONFIDE_META_QUERY_ACCEPTANCE_FIXTURES) {
    if (row.bucket !== 'generate_skip_classify') continue;
    add(generateFailRow(`gf-meta-${row.id}`, row.text, `metaQuery:${row.id}`));
  }

  for (const row of CONFIDE_STAGE2_REAL_MEAT_CANDIDATES) {
    if (row.golden_bucket !== CONFIDE_SEMANTIC_BUCKET.EMOTIONAL) continue;
    add(
      generateFailRow(
        `gf-real-${row.sample_id}`,
        row.text,
        `realMeat:${row.sample_id}`
      )
    );
  }

  return Object.freeze([...byText.values()].sort((a, b) => a.id.localeCompare(b.id)));
}

/** @type {readonly ConfideGenerateFailureFallbackFixture[]} */
export const CONFIDE_GENERATE_FAILURE_FALLBACK_FIXTURES = Object.freeze([
  ...buildGenerateFailFixtures(),
  ...CORPUS_CONTROL_FIXTURES
]);

/** @type {readonly ConfideGenerateFailureFallbackFixture[]} */
export const CONFIDE_GENERATE_FAILURE_FALLBACK_GENERATE_FIXTURES = Object.freeze(
  CONFIDE_GENERATE_FAILURE_FALLBACK_FIXTURES.filter((row) => row.kind === 'generate_fail')
);

/** @type {readonly ConfideGenerateFailureFallbackFixture[]} */
export const CONFIDE_GENERATE_FAILURE_FALLBACK_CONTROL_FIXTURES = Object.freeze(
  CONFIDE_GENERATE_FAILURE_FALLBACK_FIXTURES.filter((row) => row.kind === 'corpus_control')
);

export const CONFIDE_GENERATE_FAILURE_FALLBACK_COUNTS = Object.freeze({
  generateFail: CONFIDE_GENERATE_FAILURE_FALLBACK_GENERATE_FIXTURES.length,
  corpusControl: CONFIDE_GENERATE_FAILURE_FALLBACK_CONTROL_FIXTURES.length,
  total: CONFIDE_GENERATE_FAILURE_FALLBACK_FIXTURES.length,
  /** salts 0..23 per generate_fail row */
  saltSweep: 24,
  /** same-panel repeats per generate_fail row */
  sessionRepeats: 5
});
