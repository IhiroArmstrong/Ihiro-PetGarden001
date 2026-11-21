#!/usr/bin/env node
/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong. All rights reserved.
 */

/**
 * Deck card roots must be created with createGlassCard(), unless grandfathered.
 * Support keep-stylesheet-z is skipped. Exemption list only shrinks.
 *
 *   node scripts/check-glass-card-factory.js
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GLASS_CARD_ELEMENT_IDS,
  GLASS_CARD_KEEP_STYLESHEET_Z
} from '../src/ui/glassCardDeck.js';
import { GLASS_CARD_FACTORY_EXEMPT_IDS } from './glass-card-factory-exemptions.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const UI_DIR = join(PKG_ROOT, 'src/ui');
const SKIP_FILES = new Set(['glassCardDeck.js', 'glassPanelStyles.js']);

function listUiSourceFiles() {
  return readdirSync(UI_DIR)
    .filter((name) => name.endsWith('.js') && !name.endsWith('.test.js'))
    .filter((name) => !SKIP_FILES.has(name))
    .map((name) => join(UI_DIR, name));
}

/**
 * @param {string} src
 * @param {string} id
 */
export function sourceMentionsCardId(src, id) {
  return src.includes(`'${id}'`) || src.includes(`"${id}"`);
}

/**
 * @param {string} src
 */
export function sourceUsesGlassFactory(src) {
  return /\bcreateGlassCard\s*\(/.test(src);
}

/**
 * @param {object} [opts]
 * @param {string[]} [opts.ids]
 * @param {{ id: string, src: string, rel: string }[]} [opts.files]
 * @param {ReadonlySet<string>} [opts.keepStylesheetZ]
 * @param {readonly string[]} [opts.exemptIds]
 * @returns {{ ok: boolean, errors: string[], factoryIds: string[], exemptIds: string[] }}
 */
export function evaluateGlassCardFactory({
  ids = Object.values(GLASS_CARD_ELEMENT_IDS),
  files,
  keepStylesheetZ = GLASS_CARD_KEEP_STYLESHEET_Z,
  exemptIds = GLASS_CARD_FACTORY_EXEMPT_IDS
} = {}) {
  const errors = [];
  const factoryIds = [];
  const liveFiles =
    files ||
    listUiSourceFiles().map((abs) => ({
      id: abs,
      src: readFileSync(abs, 'utf8'),
      rel: abs.slice(PKG_ROOT.length + 1)
    }));
  const exemptSet = new Set(exemptIds);
  const knownIds = new Set(ids);

  for (const id of exemptIds) {
    if (!knownIds.has(id)) {
      errors.push(`${id}: factory exemption is not a live deck id (list only shrinks)`);
    }
  }

  for (const id of ids) {
    if (keepStylesheetZ.has(id)) continue;
    const hits = liveFiles.filter((file) => sourceMentionsCardId(file.src, id));
    if (!hits.length) {
      errors.push(`${id}: no UI source assigns this deck id`);
      continue;
    }
    const factoryHits = hits.filter((file) => sourceUsesGlassFactory(file.src));
    if (factoryHits.length) {
      factoryIds.push(id);
      if (exemptSet.has(id)) {
        errors.push(
          `${id}: uses createGlassCard but is still on the exemption list (remove it)`
        );
      }
      continue;
    }
    if (exemptSet.has(id)) continue;
    errors.push(
      `${id}: must call createGlassCard() (hits: ${hits.map((f) => f.rel).join(', ')})`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    factoryIds,
    exemptIds: [...exemptSet]
  };
}

export function runGlassCardFactoryCheck() {
  const result = evaluateGlassCardFactory();
  if (!result.ok) {
    console.error('[glass-card-factory] FAILED');
    for (const err of result.errors) console.error(`  - ${err}`);
    return false;
  }
  console.log(
    `[glass-card-factory] OK — factory ${result.factoryIds.length}; grandfather ${result.exemptIds.length}`
  );
  return true;
}

function main() {
  if (!runGlassCardFactoryCheck()) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
