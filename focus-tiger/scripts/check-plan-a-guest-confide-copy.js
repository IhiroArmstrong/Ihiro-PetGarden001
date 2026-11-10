#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Plan A option 1 — scan merged guest-visible locale + marketing HTML for
 * copy that promises Confide / on-device chat is open to guests now.
 *
 *   npm run check:plan-a-guest-confide-copy
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mergeLocalePack } from '../src/locales/mergeLocaleSlices.js';
import {
  assessPlanAGuestConfideLine,
  PLAN_A_CONFIDE_TOPIC_RE,
  hasPlanASafePhrase,
  PLAN_A_FORBIDDEN_WITHOUT_SAFE
} from './plan-a-guest-confide-copy-policy.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const REPO_ROOT = join(PKG_ROOT, '..');
const SLICES_DIR = join(PKG_ROOT, 'src', 'locales', 'slices');
const LOCALES = ['en', 'zh', 'ja'];

/**
 * @param {string} rel
 */
function readJson(rel) {
  return JSON.parse(readFileSync(join(PKG_ROOT, rel), 'utf8'));
}

/**
 * @returns {{ filename: string, data: unknown }[]}
 */
function loadLocaleSlices() {
  const names = readdirSync(SLICES_DIR)
    .filter((name) => /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(name))
    .sort();
  return names.map((filename) => ({
    filename,
    data: JSON.parse(readFileSync(join(SLICES_DIR, filename), 'utf8'))
  }));
}

/**
 * @returns {{ locale: string, key: string, text: string, reason: string }[]}
 */
export function scanMergedGuestLocaleCopy() {
  const bases = {
    en: readJson('src/locales/en.json'),
    zh: readJson('src/locales/zh.json'),
    ja: readJson('src/locales/ja.json')
  };
  const { dictionaries, errors } = mergeLocalePack(bases, loadLocaleSlices());
  if (errors.length) {
    throw new Error(`locale slice merge errors:\n${errors.join('\n')}`);
  }
  /** @type {{ locale: string, key: string, text: string, reason: string }[]} */
  const hits = [];
  for (const locale of LOCALES) {
    const dict = dictionaries[locale] || {};
    for (const [key, text] of Object.entries(dict)) {
      const verdict = assessPlanAGuestConfideLine(key, text);
      if (!verdict.ok) {
        hits.push({
          locale,
          key,
          text: String(text).slice(0, 160),
          reason: verdict.reason || 'policy'
        });
      }
    }
  }
  return hits;
}

/**
 * @returns {{ file: string, reason: string }[]}
 */
export function scanMarketingSiteHtml() {
  const dir = join(REPO_ROOT, 'marketing-site');
  if (!existsSync(dir)) {
    return [];
  }
  const files = readdirSync(dir).filter((name) => name.endsWith('.html'));
  /** @type {{ file: string, reason: string }[]} */
  const hits = [];
  for (const file of files) {
    const html = readFileSync(join(dir, file), 'utf8');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!PLAN_A_CONFIDE_TOPIC_RE.test(text)) continue;
    if (hasPlanASafePhrase(text)) continue;
    const forbidden = PLAN_A_FORBIDDEN_WITHOUT_SAFE.find((re) => re.test(text));
    if (forbidden) {
      hits.push({
        file: `marketing-site/${file}`,
        reason: `marketing html: ${forbidden}`
      });
      continue;
    }
    if (/confide|倾诉|コンファイド/i.test(text)) {
      hits.push({
        file: `marketing-site/${file}`,
        reason: 'marketing html mentions Confide without guest-closed caveat'
      });
    }
  }
  return hits;
}

/**
 * @returns {boolean}
 */
export function runPlanAGuestConfideCopyCheck() {
  const localeHits = scanMergedGuestLocaleCopy();
  const marketingHits = scanMarketingSiteHtml();
  const all = [...localeHits, ...marketingHits];
  if (all.length === 0) {
    console.log(
      '[check:plan-a-guest-confide-copy] OK — merged guest surfaces + marketing-site'
    );
    return true;
  }
  console.error('[check:plan-a-guest-confide-copy] FAIL');
  for (const hit of localeHits) {
    console.error(
      `  ${hit.locale} ${hit.key}: ${hit.reason}\n    ${hit.text}`
    );
  }
  for (const hit of marketingHits) {
    console.error(`  ${hit.file}: ${hit.reason}`);
  }
  return false;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(runPlanAGuestConfideCopyCheck() ? 0 : 1);
}
