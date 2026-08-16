/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * i18n sync / gap report · compare en.json ↔ ja.json (no auto-translate).
 *
 *   npm run i18n:sync
 *   node scripts/i18n-sync.js
 *
 * Exit 0 when keys match and ja passes copy guards.
 * Exit 1 when missing/extra keys, en-equal placeholders, or Latin-only ja values.
 *
 * Does NOT call LLMs or write machine translations — product copy stays 审完再露.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  listExtraJaKeys,
  listJaEqualToEn,
  listJaMissingJapaneseScript,
  listMissingJaKeys
} from '../src/locales/jaCopyGuards.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src', 'locales');

/**
 * @param {string} name
 * @returns {Record<string, string>}
 */
function loadDict(name) {
  return JSON.parse(readFileSync(join(localesDir, name), 'utf8'));
}

/**
 * @param {string} title
 * @param {string[]} keys
 * @param {Record<string, string>} [sampleFrom]
 */
function printSection(title, keys, sampleFrom) {
  console.log(`\n=== ${title} (${keys.length}) ===`);
  if (keys.length === 0) {
    console.log('(none)');
    return;
  }
  for (const key of keys) {
    if (sampleFrom && sampleFrom[key] != null) {
      const preview = String(sampleFrom[key]).replace(/\s+/g, ' ').slice(0, 80);
      console.log(`- ${key}: ${preview}`);
    } else {
      console.log(`- ${key}`);
    }
  }
}

function main() {
  const en = loadDict('en.json');
  const ja = loadDict('ja.json');

  const missing = listMissingJaKeys(en, ja);
  const extra = listExtraJaKeys(en, ja);
  const equalEn = listJaEqualToEn(en, ja);
  const noJpScript = listJaMissingJapaneseScript(ja);

  console.log('[i18n:sync] en keys:', Object.keys(en).length);
  console.log('[i18n:sync] ja keys:', Object.keys(ja).length);

  printSection('Missing in ja.json (present in en)', missing);
  printSection('Extra in ja.json (not in en)', extra);
  printSection('ja equals en (English placeholder)', equalEn, ja);
  printSection(
    'ja lacks Japanese script (hiragana/katakana/kanji)',
    noJpScript,
    ja
  );

  const bad =
    missing.length + extra.length + equalEn.length + noJpScript.length;
  if (bad > 0) {
    console.error(
      `\n[i18n:sync] FAIL — ${bad} issue(s). Translate ja.json (or allowlist proper nouns in jaCopyGuards.js).`
    );
    console.error(
      'Note: this command lists gaps only — it does not auto-fill machine translations.'
    );
    process.exit(1);
  }

  console.log('\n[i18n:sync] OK — en/ja key parity + ja copy guards pass.');
}

main();
