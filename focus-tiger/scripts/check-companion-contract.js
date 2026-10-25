#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * T55 PR-3: scan shipped companion copy against the contract forbidden table.
 *
 *   npm run check:companion-contract
 *
 * Sample-set rates: bad-hit and allow-pass are reported separately (PR-4).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMPANION_CONTRACT_EXEMPTIONS } from './companion-contract-exemptions.js';
import {
  COMPANION_CONTRACT_HONESTY,
  matchForbiddenPatterns
} from './companion-contract-forbidden.js';
import {
  COMPANION_CONTRACT_SAMPLE_GATE,
  COMPANION_CONTRACT_SAMPLES
} from './companion-contract-samples.js';
import { CALM_ACTION_ARRIVE_EN } from '../src/content/calm-action-wisdom/calm-action-arrive.en.js';
import { CALM_ACTION_ARRIVE_JA } from '../src/content/calm-action-wisdom/calm-action-arrive.ja.js';
import { CALM_ACTION_RECOVER_EN } from '../src/content/calm-action-wisdom/calm-action-recover.en.js';
import { CALM_ACTION_RECOVER_JA } from '../src/content/calm-action-wisdom/calm-action-recover.ja.js';
import { CALM_ACTION_REFLECT_EN } from '../src/content/calm-action-wisdom/calm-action-reflect.en.js';
import { CALM_ACTION_REFLECT_JA } from '../src/content/calm-action-wisdom/calm-action-reflect.ja.js';
import { CALM_ACTION_TRANSITION_EN } from '../src/content/calm-action-wisdom/calm-action-transition.en.js';
import { CALM_ACTION_TRANSITION_JA } from '../src/content/calm-action-wisdom/calm-action-transition.ja.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');

const REFOCUS_KEYS = [
  'REFOCUS_ACKNOWLEDGE_1',
  'REFOCUS_ACKNOWLEDGE_2',
  'REFOCUS_ACKNOWLEDGE_3'
];
const MOMENT_WHISPER_KEYS = [
  'MOMENT_WHISPER_ARRIVE',
  'MOMENT_WHISPER_FOCUS',
  'MOMENT_WHISPER_RECOVER',
  'MOMENT_WHISPER_TRANSITION',
  'MOMENT_WHISPER_REFLECT'
];
const RETURN_KEYS = [
  'JOURNEY_MEMORY_COME_BACK',
  'GROWTH_JOURNEY_RETURNED'
];
const LOCALES = ['en', 'zh', 'ja'];

/**
 * @param {string} rel
 */
function readJson(rel) {
  return JSON.parse(readFileSync(join(PKG_ROOT, rel), 'utf8'));
}

/**
 * @param {string} channel
 * @param {string} locale
 * @param {string} key
 * @param {string} text
 * @param {string} file
 */
function row(channel, locale, key, text, file) {
  return { channel, locale, key, text: String(text ?? ''), file };
}

/**
 * Scan order: Re-focus first (Brief / contract C.2).
 * @returns {Array<{channel: string, locale: string, key: string, text: string, file: string}>}
 */
export function collectLiveStrings() {
  const out = [];
  const dictionaries = {
    en: readJson('src/locales/en.json'),
    zh: readJson('src/locales/zh.json'),
    ja: readJson('src/locales/ja.json')
  };

  for (const locale of LOCALES) {
    for (const key of REFOCUS_KEYS) {
      out.push(row('refocus', locale, key, dictionaries[locale][key], `src/locales/${locale}.json`));
    }
  }

  const invite = readJson('src/locales/slices/awaken-invite.json');
  for (const locale of LOCALES) {
    for (const [key, text] of Object.entries(invite[locale] || {})) {
      out.push(row('awaken-invite', locale, key, text, 'src/locales/slices/awaken-invite.json'));
    }
  }

  const quietKeys = Object.keys(dictionaries.en).filter((key) =>
    /^DAILY_ZEN_QUOTE(_INSIGHT)?_\d+$/.test(key)
  );
  for (const locale of LOCALES) {
    for (const key of quietKeys) {
      out.push(row('quiet-line', locale, key, dictionaries[locale][key], `src/locales/${locale}.json`));
    }
  }

  const calmPools = [
    ['en', CALM_ACTION_ARRIVE_EN],
    ['ja', CALM_ACTION_ARRIVE_JA],
    ['en', CALM_ACTION_RECOVER_EN],
    ['ja', CALM_ACTION_RECOVER_JA],
    ['en', CALM_ACTION_REFLECT_EN],
    ['ja', CALM_ACTION_REFLECT_JA],
    ['en', CALM_ACTION_TRANSITION_EN],
    ['ja', CALM_ACTION_TRANSITION_JA]
  ];
  for (const [locale, pool] of calmPools) {
    for (const entry of pool) {
      out.push(
        row(
          'calm-action',
          locale,
          entry.id,
          entry.text,
          'src/content/calm-action-wisdom/'
        )
      );
    }
  }

  for (const locale of LOCALES) {
    for (const key of MOMENT_WHISPER_KEYS) {
      out.push(
        row('moment-whisper', locale, key, dictionaries[locale][key], `src/locales/${locale}.json`)
      );
    }
  }

  const sessionEnd = readJson('src/locales/slices/session-end-observed-duration.json');
  for (const locale of LOCALES) {
    const key = 'SESSION_END_OBSERVED_MINUTES';
    out.push(
      row(
        'session-end',
        locale,
        key,
        sessionEnd[locale]?.[key],
        'src/locales/slices/session-end-observed-duration.json'
      )
    );
  }

  const paper = readJson('src/locales/slices/practice-paper.json');
  for (const locale of LOCALES) {
    const key = 'PRACTICE_PAPER_RHYTHM_5';
    out.push(
      row('return-greeting', locale, key, paper[locale]?.[key], 'src/locales/slices/practice-paper.json')
    );
  }
  for (const locale of LOCALES) {
    for (const key of RETURN_KEYS) {
      out.push(
        row('return-greeting', locale, key, dictionaries[locale][key], `src/locales/${locale}.json`)
      );
    }
  }

  return out.filter((item) => item.text);
}

const SAMPLE_CATEGORY_TARGETS = Object.freeze({
  'C-01': 6,
  'C-02': 4,
  'C-04': 6,
  'C-07': 5,
  'C-09': 3,
  'allow-neighbor': 8
});

/**
 * @param {typeof COMPANION_CONTRACT_SAMPLES} samples
 * @returns {{
 *   errors: string[],
 *   sample_bad_hit_rate: string,
 *   sample_allow_pass_rate: string,
 *   sample_bad_hit_ratio: number,
 *   sample_allow_pass_ratio: number
 * }}
 */
export function evaluateCompanionContractSamples(samples = COMPANION_CONTRACT_SAMPLES) {
  const errors = [];
  const ids = new Set();
  const counts = {};

  for (const sample of samples) {
    const required = ['id', 'lang', 'scene', 'category', 'expect', 'utterance', 'direction'];
    for (const key of required) {
      if (!sample[key]) errors.push(`sample ${sample.id || '?'} missing ${key}`);
    }
    if (ids.has(sample.id)) errors.push(`duplicate sample id ${sample.id}`);
    ids.add(sample.id);
    if (sample.category === 'C-10' || /crisis|suicide|self-harm/i.test(sample.utterance || '')) {
      errors.push(`sample ${sample.id} is crisis-shaped; C-10 is out of this set`);
    }
    counts[sample.category] = (counts[sample.category] || 0) + 1;
  }

  if (samples.length !== 42) {
    errors.push(`sample count ${samples.length} !== 42`);
  }
  for (const [category, target] of Object.entries(SAMPLE_CATEGORY_TARGETS)) {
    if ((counts[category] || 0) !== target) {
      errors.push(`category ${category} count ${counts[category] || 0} !== ${target}`);
    }
  }
  const cureProfessional = (counts['C-05'] || 0) + (counts['C-06'] || 0);
  if (cureProfessional !== 5) {
    errors.push(`category C-05/C-06 count ${cureProfessional} !== 5`);
  }
  const verdictControl = (counts['C-03'] || 0) + (counts['C-08'] || 0);
  if (verdictControl !== 5) {
    errors.push(`category C-03/C-08 count ${verdictControl} !== 5`);
  }

  const bad = samples.filter((row) => row.expect === 'hit');
  const allow = samples.filter((row) => row.expect === 'allow');
  let badHits = 0;
  let allowPass = 0;

  for (const sample of bad) {
    const matches = matchForbiddenPatterns(sample.utterance);
    const hit = matches.some((row) => !sample.redline || row.redline === sample.redline);
    if (hit) badHits += 1;
    else errors.push(`bad sample ${sample.id} was not hit (${sample.redline || 'any'})`);
  }
  for (const sample of allow) {
    const matches = matchForbiddenPatterns(sample.utterance);
    if (matches.length === 0) allowPass += 1;
    else {
      errors.push(
        `allow sample ${sample.id} was blocked by ${matches.map((row) => row.id).join(',')}`
      );
    }
  }

  const badRatio = bad.length ? badHits / bad.length : 0;
  const allowRatio = allow.length ? allowPass / allow.length : 0;
  if (badRatio < COMPANION_CONTRACT_SAMPLE_GATE.badHitMin) {
    errors.push(
      `sample_bad_hit_rate ${badHits}/${bad.length} below gate ${COMPANION_CONTRACT_SAMPLE_GATE.badHitMin}`
    );
  }
  if (allowRatio < COMPANION_CONTRACT_SAMPLE_GATE.allowPassMin) {
    errors.push(
      `sample_allow_pass_rate ${allowPass}/${allow.length} below gate ${COMPANION_CONTRACT_SAMPLE_GATE.allowPassMin}`
    );
  }

  return {
    errors,
    sample_bad_hit_rate: `${badHits}/${bad.length}`,
    sample_allow_pass_rate: `${allowPass}/${allow.length}`,
    sample_bad_hit_ratio: badRatio,
    sample_allow_pass_ratio: allowRatio
  };
}

/**
 * @param {object} [opts]
 * @returns {{
 *   ok: boolean,
 *   errors: string[],
 *   hits: Array<{id: string, channel: string, locale: string, key: string, patternId: string, redline: string}>,
 *   coverage: Record<string, number>,
 *   sample_bad_hit_rate: string,
 *   sample_allow_pass_rate: string,
 *   honesty: string
 * }}
 */
export function evaluateCompanionContract({
  strings = null,
  exemptions = COMPANION_CONTRACT_EXEMPTIONS,
  samples = COMPANION_CONTRACT_SAMPLES
} = {}) {
  const errors = [];
  const live = strings || collectLiveStrings();
  const hits = [];
  const coverage = {};

  for (const item of live) {
    coverage[item.channel] = (coverage[item.channel] || 0) + 1;
    for (const match of matchForbiddenPatterns(item.text)) {
      hits.push({
        id: `${item.channel}:${item.locale}:${item.key}:${match.id}`,
        channel: item.channel,
        locale: item.locale,
        key: item.key,
        patternId: match.id,
        redline: match.redline,
        file: item.file
      });
    }
  }

  const exemptIds = new Set(exemptions.map((row) => row.id));
  const liveHitIds = new Set(hits.map((hit) => hit.id));

  for (const hit of hits) {
    if (!exemptIds.has(hit.id)) {
      errors.push(
        `new hit ${hit.id} (${hit.redline}) in ${hit.file} — add is forbidden; change copy or wait for PO exemption shrink-only review`
      );
    }
  }

  for (const row of exemptions) {
    if (!liveHitIds.has(row.id)) {
      errors.push(`stale exemption ${row.id} (0 hits; delete the row)`);
    }
  }

  const sampleReport = evaluateCompanionContractSamples(samples);
  errors.push(...sampleReport.errors);

  return {
    ok: errors.length === 0,
    errors,
    hits,
    coverage,
    sample_bad_hit_rate: sampleReport.sample_bad_hit_rate,
    sample_allow_pass_rate: sampleReport.sample_allow_pass_rate,
    sample_bad_hit_ratio: sampleReport.sample_bad_hit_ratio,
    sample_allow_pass_ratio: sampleReport.sample_allow_pass_ratio,
    honesty: COMPANION_CONTRACT_HONESTY
  };
}

/**
 * @returns {boolean}
 */
export function runCompanionContractCheck() {
  const result = evaluateCompanionContract();
  console.log(`[companion-contract] ${result.honesty}`);
  console.log(
    `[companion-contract] coverage ${JSON.stringify(result.coverage)} (invite runtime regex still only awaken-invite tests)`
  );
  console.log(
    `[companion-contract] sample_bad_hit_rate=${result.sample_bad_hit_rate} sample_allow_pass_rate=${result.sample_allow_pass_rate} (regression only; not coverage; not verified; do not cite externally)`
  );
  if (result.hits.length) {
    console.log(`[companion-contract] live hits ${result.hits.length} (exemption caps only shrink)`);
  }
  if (!result.ok) {
    console.error('[companion-contract] FAILED');
    for (const err of result.errors) console.error(`  - ${err}`);
    return false;
  }
  console.log(
    '[companion-contract] OK — no unexempted hits; sample rates reported separately; not a verified-behavior claim'
  );
  return true;
}

function assertCalmActionFilesPresent() {
  const dir = join(PKG_ROOT, 'src/content/calm-action-wisdom');
  const names = readdirSync(dir);
  if (!names.includes('calm-action-arrive.en.js')) {
    throw new Error('calm-action wisdom pool missing');
  }
}

function main() {
  assertCalmActionFilesPresent();
  if (!runCompanionContractCheck()) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
